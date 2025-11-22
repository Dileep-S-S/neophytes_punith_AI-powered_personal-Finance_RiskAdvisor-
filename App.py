from flask import Flask, request, jsonify
import numpy as np
import joblib
import tensorflow as tf
from flask_cors import CORS
from PyPDF2 import PdfReader
import re

# --------------------------------------------
# FLASK APP
# --------------------------------------------
app = Flask(__name__)
CORS(app)

# --------------------------------------------
# LOAD ML MODELS
# --------------------------------------------
model = tf.keras.models.load_model("risk_model.keras")
scaler = joblib.load("scaler.pkl")
label_encoder = joblib.load("label_encoder.pkl")

# --------------------------------------------
# CATEGORY KEYWORDS
# --------------------------------------------
KEYWORDS = {
    "food": ["swiggy", "zomato", "restaurant", "hotel", "food", "grocery", "bb", "mcd", "kfc"],
    "utility": ["electricity", "water", "wifi", "internet", "gas", "recharge", "mobile bill"],
    "medicine": ["pharmacy", "medical", "apollo", "chemist", "medicine"],
    "personal": ["amazon", "flipkart", "shopping", "lifestyle", "myntra", "clothing"],
}

# --------------------------------------------
# CREDIT / NON-EXPENSE KEYWORDS
# --------------------------------------------
CREDIT_KEYWORDS = [
    "cr", "credit", "credited", "deposit", "salary",
    "income", "refund", "reversal", "upi-cred"
]


# --------------------------------------------
# PDF TEXT EXTRACTION
# --------------------------------------------
def extract_text_from_pdf(file):
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        try:
            t = page.extract_text()
            if t:
                text += t + "\n"
        except:
            continue

    return text.lower()


# --------------------------------------------
# AMOUNT + CATEGORY EXTRACTION
# --------------------------------------------
def extract_amounts(text):
    # Matches 450, 999.00, 1,250.50, etc.
    pattern = r"(\d{1,3}(,\d{3})*(\.\d{1,2})?|^\d+(\.\d{1,2})?)"

    totals = {
        "food": 0,
        "utility": 0,
        "medicine": 0,
        "personal_expenses": 0,
        "others": 0
    }

    lines = text.split("\n")

    for line in lines:
        w = line.lower().strip()

        # --------------------------------------------------
        # ❌ SKIP CREDITS (salary, deposit, refund, CR)
        # --------------------------------------------------
        if any(ck in w for ck in CREDIT_KEYWORDS):
            continue

        # extract amounts
        m = re.findall(pattern, line)
        if not m:
            continue

        raw_amount = m[-1][0].replace(",", "")
        try:
            amount = float(raw_amount)
        except:
            continue

        # classify category
        category = "others"
        for cat, keys in KEYWORDS.items():
            if any(k in w for k in keys):
                category = cat
                break

        if category == "personal":
            totals["personal_expenses"] += amount
        elif category in totals:
            totals[category] += amount
        else:
            totals["others"] += amount

    return totals


# --------------------------------------------
# ANALYZE PDF ENDPOINT
# --------------------------------------------
@app.post("/analyze_pdf")
def analyze_pdf():
    income = float(request.form.get("income"))
    pdf_file = request.files.get("pdf")

    if not pdf_file:
        return jsonify({"error": "PDF file is required"}), 400

    text = extract_text_from_pdf(pdf_file)
    spending = extract_amounts(text)

    # unpack
    food = spending["food"]
    utility = spending["utility"]
    medicine = spending["medicine"]
    personal = spending["personal_expenses"]
    others = spending["others"]

    total_spend = sum(spending.values())
    balance = income - total_spend

    # ML FEATURES
    X = np.array([[
        income, food, medicine, utility, personal, others,
        food/income if income else 0,
        medicine/income if income else 0,
        utility/income if income else 0,
        personal/income if income else 0,
        others/income if income else 0
    ]])

    X_scaled = scaler.transform(X)
    preds = model.predict(X_scaled)

    risk_class = np.argmax(preds)
    ml_risk = label_encoder.inverse_transform([risk_class])[0]

    # -----------------------------------------------------------------
    # HIGH RISK OVERRIDE — If total spend >= income, force High Risk
    # -----------------------------------------------------------------
    final_risk = "High Risk" if total_spend >= income else ml_risk

    return jsonify({
        "income": income,
        "spending": spending,
        "risk_category": final_risk,
        "probabilities": preds.tolist(),
        "total_spend": total_spend,
        "balance": balance
    })


# --------------------------------------------
# RUN SERVER
# --------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)

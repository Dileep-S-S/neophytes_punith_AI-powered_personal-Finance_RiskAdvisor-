import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function PdfExtractor({ onExtract }) {
  const [loading, setLoading] = useState(false);

  const readPdfText = async (file) => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((i) => i.str).join(" ");
      fullText += text + "\n";
    }

    return fullText.trim();
  };

  const ocrPdf = async (file) => {
    const dataUrl = URL.createObjectURL(file);
    const result = await Tesseract.recognize(dataUrl, "eng");
    return result.data.text;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    let text = "";

    try {
      // Try text extraction first
      text = await readPdfText(file);

      if (!text || text.length < 20) {
        console.log("PDF seems scanned → Using OCR");
        text = await ocrPdf(file);
      }

      parseStatement(text);

    } catch {
      console.log("Falling back to OCR");
      text = await ocrPdf(file);
      parseStatement(text);
    }

    setLoading(false);
  };

  // CATEGORY RULES
  const categoryMap = {
    Food: ["swiggy", "zomato", "restaurant", "hotel"],
    Utility: ["electricity", "bill", "water", "internet", "bescom"],
    Medicine: ["pharmacy", "medical", "apollo"],
    "Personal Expenses": ["shopping", "amazon", "flipkart", "lifestyle"],
  };

  const parseStatement = (rawText) => {
    const lines = rawText.split("\n").map((line) => line.trim());
    let categories = {
      Food: 0,
      Utility: 0,
      Medicine: 0,
      "Personal Expenses": 0,
      Others: 0,
    };

    const amountRegex = /(\d+[\.,]?\d+)/;

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      const amountMatch = line.match(amountRegex);

      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);

        let matched = false;

        for (const cat in categoryMap) {
          if (categoryMap[cat].some((word) => lower.includes(word))) {
            categories[cat] += amount;
            matched = true;
            break;
          }
        }

        if (!matched) categories["Others"] += amount;
      }
    });

    onExtract(categories);
  };

  return (
    <div>
      <h3>Upload Your Bank Statement (PDF)</h3>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      {loading && <p>Extracting data… please wait</p>}
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../Styles/ChatBox.css";

const apiKey = "AIzaSyCK7bMyocMwlCsTlkmNXHYspuePQD9bhHc";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = {
      id: Date.now() + "-u",
      role: "user",
      text: input.trim(),
    };

    const botMsg = {
      id: Date.now() + "-b",
      role: "bot",
      text: "Typing...",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setSending(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text:
                    "Act as a finance advisor. Answer clearly in plain text with concise number of words, dont use bold or italics. Question: " +
                    userMsg.text,
                },
              ],
            },
          ],
        }
      );

      const ans =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No answer";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsg.id ? { ...m, text: ans, loading: false } : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsg.id
            ? { ...m, text: "Error: " + err.message, loading: false }
            : m
        )
      );
    }

    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (<div className="mine-onlycss">
    <div className="chatbox-container">
      <div className="chatbox-header">
        SpendCare AI Chat
      </div>

      <div className="chatbox-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">Ask your finance doubts…</div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chatbox-input">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
        />

        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div></div>
  );
}

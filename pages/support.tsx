import React, { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

const FAQ: { q: string; a: string }[] = [
  { q: "How do I create a new note?", a: "Click the '+ New Note' button in the top bar, or use the floating '+' button at the bottom right. You can also create a note from a template by clicking 'Templates'." },
  { q: "Where are my notes stored?", a: "Your notes are stored locally on your device using your browser's IndexedDB storage. We do not store your notes on our servers. Please make regular backups using the Export feature." },
  { q: "How do I export my notes?", a: "Open any note, then click the 'Export' button in the toolbar. You can export as PDF, Markdown, or HTML. To back up all notes at once, click the 'Export' button in the header." },
  { q: "Can I recover a deleted note?", a: "Yes! Deleted notes are moved to Trash and kept for 30 days. Click the 'Trash' button in the header to view and restore deleted notes." },
  { q: "How does AI Assist work?", a: "Open a note with some text, then click 'AI Assist' in the toolbar. You can fix spelling and grammar, improve writing, summarise, or polish and structure your content." },
  { q: "How do I cancel my subscription?", a: "Go to Account Settings from the footer, then click 'Cancel Subscription / Stop Payment'. Note: cancelling means you will lose access to premium features at the end of your billing period." },
  { q: "How do I change my password?", a: "Go to Account Settings from the footer. You'll find the Change Password section where you can update your password." },
  { q: "How do I delete my account?", a: "Go to Account Settings, then click 'Go to Delete Account'. Please cancel your PayPal subscription first. Account deletion is permanent and cannot be reversed." },
  { q: "Does StickAINote work offline?", a: "Yes! StickAINote is a Progressive Web App (PWA) with full offline support. Your notes are saved locally and you can create, edit and view notes without an internet connection." },
  { q: "How do I install StickAINote on my phone?", a: "Visit stickainote.com in your mobile browser. You should see an 'Install' or 'Add to Home Screen' prompt. If not, use your browser's menu to find the option." },
  { q: "Can I use tables in my notes?", a: "Yes! Click the '+ Table' button in the note toolbar to add a spreadsheet-like table. You can add rows, columns, and even use checkboxes." },
  { q: "How do I contact support?", a: "This automated assistant handles all support queries. We do not offer direct email or phone support. If your question isn't answered here, please describe your issue in the chat and our bot will do its best to help." },
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Hello! I'm the StickAINote support assistant. I can help you with questions about using the app, your account, subscriptions, and more. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findAnswer = useCallback((question: string): string => {
    const q = question.toLowerCase();

    // Check FAQ matches
    let bestMatch = "";
    let bestScore = 0;

    for (const faq of FAQ) {
      const keywords = faq.q.toLowerCase().split(/\s+/);
      let score = 0;
      for (const kw of keywords) {
        if (kw.length > 3 && q.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq.a;
      }
    }

    if (bestScore >= 2) return bestMatch;

    // Keyword-based fallback
    if (q.includes("delete") || q.includes("remove")) {
      if (q.includes("account")) return FAQ.find((f) => f.q.includes("delete my account"))!.a;
      return FAQ.find((f) => f.q.includes("recover"))!.a;
    }
    if (q.includes("password") || q.includes("change")) return FAQ.find((f) => f.q.includes("password"))!.a;
    if (q.includes("cancel") || q.includes("subscription") || q.includes("payment") || q.includes("pay")) return FAQ.find((f) => f.q.includes("cancel"))!.a;
    if (q.includes("export") || q.includes("backup") || q.includes("download")) return FAQ.find((f) => f.q.includes("export"))!.a;
    if (q.includes("offline") || q.includes("internet")) return FAQ.find((f) => f.q.includes("offline"))!.a;
    if (q.includes("install") || q.includes("phone") || q.includes("mobile") || q.includes("app")) return FAQ.find((f) => f.q.includes("install"))!.a;
    if (q.includes("ai") || q.includes("assist") || q.includes("grammar") || q.includes("spell")) return FAQ.find((f) => f.q.includes("AI Assist"))!.a;
    if (q.includes("table") || q.includes("spreadsheet")) return FAQ.find((f) => f.q.includes("tables"))!.a;
    if (q.includes("create") || q.includes("new") || q.includes("note")) return FAQ.find((f) => f.q.includes("create"))!.a;
    if (q.includes("store") || q.includes("data") || q.includes("where") || q.includes("save")) return FAQ.find((f) => f.q.includes("stored"))!.a;
    if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("human")) return FAQ.find((f) => f.q.includes("contact"))!.a;
    if (q.includes("trash") || q.includes("restore") || q.includes("recover")) return FAQ.find((f) => f.q.includes("recover"))!.a;

    return "I'm sorry, I couldn't find a specific answer for that question. Here are some common topics I can help with:\n\n- Creating and managing notes\n- Exporting and backing up\n- AI Assist features\n- Account settings and password\n- Subscriptions and payments\n- Installing the app\n\nPlease try rephrasing your question, or browse the FAQ topics below.";
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: nextId.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const answer = findAnswer(text);
      const botMsg: Message = { id: nextId.current++, role: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 600 + Math.random() * 600);
  }, [input, findAnswer]);

  return (
    <>
      <Head>
        <title>Support - StickAINote</title>
        <meta name="description" content="Get help with StickAINote. Our automated assistant answers your questions 24/7." />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>
            &larr; Home
          </Link>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Support</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Automated Assistant</span>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 16px 8px",
            maxWidth: 700,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? "#2563eb" : "rgba(255,255,255,0.06)",
                  border: msg.role === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 14,
                  color: "#94a3b8",
                }}
              >
                Typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick FAQ buttons */}
        <div
          style={{
            padding: "8px 16px",
            maxWidth: 700,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {["How do I export?", "Cancel subscription", "Recover deleted note", "AI Assist", "Where is my data?"].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            maxWidth: 700,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
            display: "flex",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Ask a question..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: input.trim() ? "#2563eb" : "#1e293b",
              color: "white",
              cursor: input.trim() ? "pointer" : "default",
              fontWeight: 600,
              fontSize: 14,
            }}
            type="button"
          >
            Send
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "12px 16px", fontSize: 11, color: "#475569" }}>
          &copy; {new Date().getFullYear()} StickAINote&trade; &mdash; Leffler International Investments
        </div>
      </main>
    </>
  );
}

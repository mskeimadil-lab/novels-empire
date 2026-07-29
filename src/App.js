import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function App() {
  const [view, setView] = useState("feed"); // feed | write | read
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNovel, setActiveNovel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [authorName, setAuthorName] = useState(
    () => localStorage.getItem("ne-author") || ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiError, setAiError] = useState("");

  async function handleAiAssist(e) {
    e.preventDefault();
    setAiError("");
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiSuggestion("");
    try {
      const res = await fetch("/.netlify/functions/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, currentText: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "وقع مشكل");
      setAiSuggestion(data.text);
    } catch (err) {
      setAiError("ماقدرناش نجيبو اقتراح، حاول مرة أخرى.");
    } finally {
      setAiLoading(false);
    }
  }

  function insertSuggestion() {
    setContent((prev) => (prev ? prev + "\n\n" + aiSuggestion : aiSuggestion));
    setAiSuggestion("");
    setAiPrompt("");
  }

  useEffect(() => {
    loadNovels();
  }, []);

  async function loadNovels() {
    setLoading(true);
    try {
      const q = query(collection(db, "novels"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setNovels(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setNovels([]);
    }
    setLoading(false);
  }

  async function openNovel(id) {
    const snap = await getDoc(doc(db, "novels", id));
    if (snap.exists()) {
      setActiveNovel({ id: snap.id, ...snap.data() });
      setView("read");
      setSidebarOpen(false);
      window.scrollTo(0, 0);
    }
  }

  async function handlePublish(e) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim() || !authorName.trim()) {
      setError("عمر جميع الخانات قبل ما تنشر.");
      return;
    }
    setPublishing(true);
    try {
      localStorage.setItem("ne-author", authorName);
      await addDoc(collection(db, "novels"), {
        title: title.trim(),
        content: content.trim(),
        authorName: authorName.trim(),
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setView("feed");
      setSidebarOpen(false);
      loadNovels();
    } catch (e) {
      setError("وقع مشكل، حاول مرة أخرى.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(18,12,30,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => {
              setView("feed");
              setActiveNovel(null);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>✦</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
              إمبراطورية الروايات
            </span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSidebarOpen(true);
              setView("write");
            }}
          >
            + اكتب رواية
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px 80px" }}>
        {view === "feed" && (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 24 }}>آخر الروايات المنشورة</h1>
            {loading ? (
              <p style={{ color: "var(--muted)" }}>كايتحمّل...</p>
            ) : novels.length === 0 ? (
              <div
                style={{
                  border: "1px dashed var(--border)",
                  borderRadius: 6,
                  padding: 50,
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                ماكاينش رواية بعد. كون أول واحد ينشر!
                <div style={{ marginTop: 18 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setView("write");
                      setSidebarOpen(true);
                    }}
                  >
                    اكتب رواية
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {novels.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => openNovel(n.id)}
                    className="novel-card"
                    style={{
                      textAlign: "start",
                      padding: 20,
                      display: "block",
                      width: "100%",
                    }}
                  >
                    <h3 style={{ fontSize: 19, marginBottom: 8 }}>{n.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>
                      بقلم {n.authorName}
                    </p>
                    <p
                      style={{
                        color: "var(--parchment)",
                        fontSize: 14,
                        opacity: 0.8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        margin: 0,
                      }}
                    >
                      {n.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {view === "read" && activeNovel && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
              onClick={() => setView("feed")}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 14, marginBottom: 20 }}
            >
              ← رجوع
            </button>
            <h1 style={{ fontSize: 30, marginBottom: 6 }}>{activeNovel.title}</h1>
            <p style={{ color: "var(--muted)", marginBottom: 30 }}>بقلم {activeNovel.authorName}</p>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 19,
                lineHeight: 2.1,
                whiteSpace: "pre-wrap",
              }}
            >
              {activeNovel.content}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar for writing */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(480px, 100%)",
              background: "var(--surface)",
              height: "100%",
              overflowY: "auto",
              padding: 26,
              borderInlineStart: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22 }}>اكتب رواية جديدة</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublish}>
              <div className="field">
                <label>الاسم ديالك</label>
                <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
              </div>
              <div className="field">
                <label>عنوان الرواية</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label>النص</label>
                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{ fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.9 }}
                />
              </div>

              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 10, fontWeight: 700 }}>
                  ✦ عاوني نكتب (بالذكاء الاصطناعي)
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder="مثلاً: كمل ليا الفصل، ولا: عطيني فكرة للشخصية الرئيسية"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      padding: "10px 12px",
                      color: "var(--parchment)",
                      fontSize: 14,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={aiLoading}
                    className="btn btn-outline"
                    style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}
                  >
                    {aiLoading ? "..." : "اسأل"}
                  </button>
                </div>
                {aiError && <p style={{ color: "var(--maroon)", fontSize: 13, marginTop: 10 }}>{aiError}</p>}
                {aiSuggestion && (
                  <div style={{ marginTop: 14 }}>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.8,
                        background: "var(--bg)",
                        padding: 12,
                        borderRadius: 4,
                        whiteSpace: "pre-wrap",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {aiSuggestion}
                    </p>
                    <button
                      type="button"
                      onClick={insertSuggestion}
                      className="btn btn-primary"
                      style={{ marginTop: 10, padding: "8px 16px", fontSize: 13 }}
                    >
                      زيدو للنص
                    </button>
                  </div>
                )}
              </div>
              {error && <p style={{ color: "var(--maroon)", fontSize: 14, marginBottom: 16 }}>{error}</p>}
              <button
                type="submit"
                disabled={publishing}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {publishing ? "كاينشر..." : "نشر الرواية"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

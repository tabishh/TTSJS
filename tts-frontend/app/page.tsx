"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const convertAudio = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      // 🔥 STEP 1: Call backend API
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true", // 🔥 IMPORTANT
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      // 🔥 STEP 2: Fetch audio WITH header (this fixes ngrok issue)
      const audioRes = await fetch(data.audio_url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const blob = await audioRes.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert("Error generating audio");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Text to Speech</h1>

      <textarea
        rows={4}
        cols={50}
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />
      <br />

      <button onClick={convertAudio} disabled={loading}>
        {loading ? "Generating..." : "Convert"}
      </button>

      <br />
      <br />

      {/* 🔥 IMPORTANT: key forces reload */}
      {audioUrl && (
        <audio key={audioUrl} controls autoPlay src={audioUrl} />
      )}
    </div>
  );
}
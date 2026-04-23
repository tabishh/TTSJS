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
      // 🔥 Step 1: Generate audio
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      // 🔥 Step 2: Fetch actual audio with header (fixes ngrok issue)
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Text to Speech</h1>

      {/* TEXT INPUT */}
      <textarea
        className="w-full max-w-xl p-3 border rounded-lg mb-4"
        rows={4}
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={convertAudio}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Convert"}
      </button>

      {/* AUDIO PLAYER */}
      {audioUrl && (
        <div className="mt-6">
          <audio key={audioUrl} controls src={audioUrl} />
        </div>
      )}
    </main>
  );
}
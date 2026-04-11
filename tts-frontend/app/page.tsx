"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("female");

  const [speed, setSpeed] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [mood, setMood] = useState("normal");

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const applyMood = (spd: number, ptc: number) => {
    switch (mood) {
      case "happy": return { speed: 20, pitch: 10 };
      case "sad": return { speed: -20, pitch: -10 };
      case "angry": return { speed: 30, pitch: 15 };
      case "excited": return { speed: 40, pitch: 20 };
      case "funny": return { speed: 10, pitch: 20 };
      case "shocked": return { speed: 25, pitch: 30 };
      default: return { speed: spd, pitch: ptc };
    }
  };

  const formatRate = (v: number) => `${v >= 0 ? "+" : ""}${v}%`;
  const formatPitch = (v: number) => `${v >= 0 ? "+" : ""}${v}Hz`;

  const convertAudio = async () => {
    if (!text.trim()) return alert("Enter text");

    setLoading(true);

    try {
      const adjusted = applyMood(speed, pitch);

      const res = await fetch("http://127.0.0.1:8000/generate-audio", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          text,
          language,
          voice,
          rate: formatRate(adjusted.speed),
          pitch: formatPitch(adjusted.pitch)
        })
      });

      const data = await res.json();
      setAudioUrl(data.audio_url);
    } catch (err) {
      console.error(err);
      alert("Error generating audio");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-[520px] text-white"
      >

        <h1 className="text-3xl font-bold text-center mb-4">
          🎙 Text to Audio
        </h1>

        {/* Language */}
        <select
          className="w-full p-2 rounded bg-white/20 mb-3"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>Hindi</option>
          <option>English</option>
          <option>Urdu</option>
        </select>

        {/* Voice */}
        <select
          className="w-full p-2 rounded bg-white/20 mb-3"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        {/* Text */}
        <textarea
          className="w-full p-2 rounded bg-white/20 mb-3"
          rows={4}
          placeholder="Type your text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Speed */}
        <label>Speed: {speed}%</label>
        <input
          type="range"
          min="-50"
          max="50"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full mb-3"
        />

        {/* Pitch */}
        <label>Pitch: {pitch}Hz</label>
        <input
          type="range"
          min="-50"
          max="50"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
          className="w-full mb-3"
        />

        {/* Mood */}
        <select
          className="w-full p-2 rounded bg-white/20 mb-3"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="angry">Angry</option>
          <option value="excited">Excited</option>
          <option value="funny">Funny</option>
          <option value="shocked">Shocked</option>
        </select>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={convertAudio}
          className="w-full bg-white text-black p-2 rounded font-bold"
        >
          {loading ? "Generating..." : "Convert"}
        </motion.button>

        {/* Waveform Animation */}
        {loading && (
          <div className="flex justify-center mt-4 gap-1">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [10, 30, 10] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.1
                }}
                className="w-1 bg-white"
              />
            ))}
          </div>
        )}

        {/* Audio */}
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <audio controls src={audioUrl} className="w-full" />

            <button
              onClick={() => window.open(audioUrl)}
              className="mt-2 w-full bg-green-500 text-white p-2 rounded"
            >
              Download
            </button>
          </motion.div>
        )}

      </motion.div>
    </main>
  );
}
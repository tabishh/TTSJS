"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("en-IN-NeerjaNeural");

  const [speed, setSpeed] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [mood, setMood] = useState("normal");

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const voiceOptions: any = {
    English: [
      { label: "Female (India)", value: "en-IN-NeerjaNeural" },
      { label: "Male (India)", value: "en-IN-PrabhatNeural" }
    ],
    Hindi: [
      { label: "Female (India)", value: "hi-IN-SwaraNeural" },
      { label: "Male (India)", value: "hi-IN-MadhurNeural" }
    ],
    Urdu: [
      { label: "Female 1", value: "ur-IN-GulNeural" },
      { label: "Female 2", value: "ur-PK-UzmaNeural" },
      { label: "Male 1", value: "ur-IN-SalmanNeural" },
      { label: "Male 2", value: "ur-PK-AsadNeural" }
    ]
  };

  useEffect(() => {
    setVoice(voiceOptions[language][0].value);
  }, [language]);

  const applyMood = () => {
    switch (mood) {
      case "happy": return { rate: "+20%", pitch: "+10Hz" };
      case "sad": return { rate: "-20%", pitch: "-10Hz" };
      case "angry": return { rate: "+30%", pitch: "+15Hz" };
      case "excited": return { rate: "+40%", pitch: "+20Hz" };
      default:
        return {
          rate: `${speed >= 0 ? "+" : ""}${speed}%`,
          pitch: `${pitch >= 0 ? "+" : ""}${pitch}Hz`
        };
    }
  };

  // 🔥 FIXED AUDIO LOGIC
  const convertAudio = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      const moodSettings = applyMood();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          text,
          language,
          voice,
          rate: moodSettings.rate,
          pitch: moodSettings.pitch
        })
      });

      const data = await res.json();

      const audioRes = await fetch(data.audio_url, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      const blob = await audioRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      setAudioUrl(blobUrl);

    } catch {
      alert("Error generating audio");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 text-white">

      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-[520px]">

        <h1 className="text-3xl font-bold text-center mb-2">
          🎙 Text to Audio
        </h1>

        <p className="text-center text-sm mb-4 opacity-80">
          ✨ 3 Free downloads per day • ₹2 per download after
        </p>

        {/* Login */}
        <div className="mb-4 flex justify-between items-center">
          {isLoggedIn ? (
            <>
              <span className="text-sm truncate">
                👤 {session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="w-full bg-blue-500 p-2 rounded"
            >
              Login
            </button>
          )}
        </div>

        {/* Language */}
        <select
          className="w-full p-2 rounded bg-white/20 mb-2"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option style={{ color: "black" }}>English</option>
          <option style={{ color: "black" }}>Hindi</option>
          <option style={{ color: "black" }}>Urdu</option>
        </select>

        {/* Voice */}
        <select
          className="w-full p-2 rounded bg-white/20 mb-3"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          {voiceOptions[language].map((v: any, i: number) => (
            <option key={i} value={v.value} style={{ color: "black" }}>
              {v.label}
            </option>
          ))}
        </select>

        {/* Text */}
        <textarea
          className="w-full p-3 rounded bg-white/20 mb-3"
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
          className="w-full mb-2"
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
          <option style={{ color: "black" }} value="normal">Normal</option>
          <option style={{ color: "black" }} value="happy">Happy</option>
          <option style={{ color: "black" }} value="sad">Sad</option>
          <option style={{ color: "black" }} value="angry">Angry</option>
          <option style={{ color: "black" }} value="excited">Excited</option>
        </select>

        {/* Convert */}
        <button
          onClick={convertAudio}
          disabled={!text.trim() || loading}
          className={`w-full p-2 rounded font-bold ${
            !text.trim() || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {loading ? "⏳ Generating..." : "Convert"}
        </button>

        {/* Audio */}
        {!loading && audioUrl && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg text-center">
            <audio controls src={audioUrl} className="w-full mb-3" />
          </div>
        )}

      </div>
    </main>
  );
}
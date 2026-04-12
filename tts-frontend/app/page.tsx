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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 🎙 Voice Map
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

  // 🎭 Mood Logic
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

  // 🎯 Generate Audio
  const convertAudio = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      const moodSettings = applyMood();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
      setAudioUrl(data.audio_url);
    } catch {
      alert("Error generating audio");
    }

    setLoading(false);
  };

  // 💰 Download + Payment Logic (SECURE)
  const handleDownload = async (url: string) => {
    if (!isLoggedIn) {
      signIn("google");
      return;
    }

    // Step 1: Check free usage
    const res = await fetch("/api/track-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: session?.user?.email
      })
    });

    const data = await res.json();

    // ✅ Free allowed
    if (data.allowed) {
      window.open(url);
      return;
    }

    // 💰 Paid flow
    const orderRes = await fetch("/api/create-order", {
      method: "POST"
    });

    const order = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "TTS Audio",
      description: "Audio Download",
      order_id: order.id,

      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment verified ✅");
            window.open(url);
          } else {
            alert("Payment verification failed ❌");
          }

        } catch {
          alert("Verification error");
        }
      },

      prefill: {
        email: session?.user?.email
      },

      theme: {
        color: "#6366f1"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
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

            {!isLoggedIn ? (
              <button
                onClick={() => signIn("google")}
                className="w-full bg-yellow-500 text-black p-2 rounded"
              >
                Login to Download
              </button>
            ) : (
              <button
                onClick={() => handleDownload(audioUrl)}
                className="w-full bg-green-500 text-white p-2 rounded"
              >
                Download Audio
              </button>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
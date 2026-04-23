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

  // 🎯 Generate Audio
  const convertAudio = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      const moodSettings = applyMood();

      // 🔥 Step 1: Generate audio
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify({ text })
        }
      );

      const data = await res.json();

      // 🔥🔥 Step 2: Fetch audio as blob (THIS FIXES YOUR ISSUE)
      const audioRes = await fetch(data.audio_url, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      const blob = await audioRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      setAudioUrl(blobUrl); // ✅ use blob instead of direct URL

    } catch {
      alert("Error generating audio");
    }

    setLoading(false);
  };

  const handleDownload = async (url: string) => {
    if (!isLoggedIn) {
      signIn("google");
      return;
    }

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

    if (data.allowed) {
      window.open(url);
      return;
    }

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
            body: JSON.stringify(response)
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

        {/* (UI unchanged below) */}

        {!loading && audioUrl && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg text-center">

            <audio key={audioUrl} controls src={audioUrl} className="w-full mb-3" />

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
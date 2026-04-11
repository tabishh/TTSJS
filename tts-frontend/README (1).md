# 🎙 Text-to-Audio Web Application

A modern SaaS-style Text-to-Audio generator built with:

- Frontend: Next.js (React + Tailwind + Framer Motion)
- Backend: FastAPI + LangGraph (Agent-based architecture)
- TTS Engine: Microsoft Edge TTS

---

## 🚀 Features

- 🌐 Multi-language support (Hindi, English, Urdu)
- 🎤 Voice selection (Male/Female)
- ⚡ Speed & Pitch control
- 🎭 Mood-based voice modulation
- 🎵 Audio preview player
- ⬇️ Download generated audio
- ✨ Premium animated UI

---

## 🧱 Architecture

Frontend (Next.js)
        ↓
API Call
        ↓
Backend (FastAPI)
        ↓
LangGraph Agent
        ↓
TTS Engine (edge-tts)
        ↓
Audio File
        ↓
Download URL

---

## 📦 Project Structure

### Frontend (Next.js)
tts-frontend/
├── app/
│   └── page.tsx
├── public/
├── package.json

### Backend (FastAPI)
tts-backend/
├── main.py
├── api/
├── agents/
├── nodes/
├── config/
├── generated_audio/

---

# ⚙️ Setup Instructions

## 🔹 1. Clone Repository

git clone https://github.com/YOUR_USERNAME/tts-project.git
cd tts-project

---

## 🔹 2. Setup Backend (FastAPI)

python -m venv venv

Windows:
venv\Scripts\activate

Linux/Mac:
source venv/bin/activate

pip install fastapi uvicorn edge-tts langgraph langchain

python -m uvicorn main:app --reload

Backend:
http://127.0.0.1:8000

---

## 🔹 3. Setup Frontend (Next.js)

cd tts-frontend

npm install

npm run dev

Frontend:
http://localhost:3000

---

# 🧪 Testing

1. Open backend docs:
http://127.0.0.1:8000/docs

2. Open frontend:
http://localhost:3000

3. Test:
- Enter text
- Select language
- Click Convert
- Play and download audio

---

# 🌐 Deployment (Basic)

Frontend:
Deploy on Vercel

Backend:
cloudflared tunnel --url http://localhost:8000

Update API URL in frontend:
https://your-tunnel-url/generate-audio

---

# ⚠️ Notes

- Backend must stay running
- Tunnel URL is temporary
- Audio stored in generated_audio/

---

# 🚧 Future Enhancements

- Authentication
- Payment (Stripe)
- Free usage limit
- Cloud hosting
- Advanced voice emotions
- Analytics

---

# 🧠 Tech Stack

- Next.js
- Tailwind CSS
- Framer Motion
- FastAPI
- LangGraph
- Edge TTS

---

# 📜 License

MIT License

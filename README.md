# HAPPYPERSONA by AS PHENIX

An elite, production-ready emotional AI application that bridges the gap between technology and human empathy. HappyPersona analyzes your biological cues in real-time to create a temporary, session-only AI persona designed to improve your mood and provide a cinematic, emotionally intelligent experience.

## 🚀 Features

- **20-Second Biometric Neural Scan**: Powered by MediaPipe and TensorFlow.js for face structure and expression analysis.
- **Emotionally Intelligent AI Persona**: Custom-tuned Gemini integration that understands sentiment, tone, and intent.
- **Cinematic Environment System**: Real-time adaptive backgrounds that shift based on the emotional intent of the conversation.
- **Privacy Core Architecture**: No data persistence. Memory-only processing. Full session wipe on exit.
- **Natural Interaction**: Real-time voice interaction via Web Speech API with procedural avatar animations.
- **Cross-Platform Responsive**: Fully optimized for mobile browsers and desktop experiences.

## 🛠 Tech Stack

**Frontend:**
- React.js (JavaScript)
- Tailwind CSS
- Framer Motion
- TensorFlow.js & MediaPipe
- Web Speech API

**Backend:**
- Node.js & Express.js
- WebSocket support
- Google Gemini API (@google/generative-ai)

**Deployment:**
- Vercel Optimized

## 📦 Installation

1. **Clone & Install:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Development Mode:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```

## 🔐 Security & Privacy

- **Biometric Zero-Storage**: Face mesh data is calculated locally in the browser and never leaves the client.
- **Encrypted Session ID**: Temporary sessions are handled via memory-only state.
- **Auto-Purge**: All persona weights and chat histories are destroyed when the session ends or the tab is closed.

## 📁 Folder Structure

```text
/src
  /components  - Reusable UI modules & Phase components
  /hooks       - Custom React hooks
  /services    - API integration logic
  /utils       - Helper functions
  /styles      - Global CSS and theme definitions
/server.js     - Express server with Vite integration
/public        - Static assets
```

## 👨‍💻 Credits

**Designed and Developed by:**
**SARVEPALLI AUDI SIVA BHANUVARDHAN**

**Institution:**
DHANALAKSHMI SRINIVASAN UNIVERSITY
TRICHY – 621112, India

---

## 🔗 Connect with me

- **LinkedIn**: [Profile](https://www.linkedin.com/in/audi-siva-bhanuvardhan-sarvepalli-4598a8289/)
- **Portfolio**: [AS PHENIX Portfolio](https://sarvepalliaudi.github.io/asphenixnewprotofolio/)
- **GitHub**: [Sarvepalliaudi](https://github.com/Sarvepalliaudi/Sarvepalliaudi)

---
*HappyPersona by AS PHENIX — Innovation Beyond Limits.*

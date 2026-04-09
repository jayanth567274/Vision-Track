📌 Vision Track
Real-Time Missing Person Identification System

🚀 Overview
Vision Track is an AI-powered system designed to identify missing persons in real time using computer vision and deep learning techniques. The project leverages facial recognition models like ArcFace to match detected faces with a database of missing individuals.

The system aims to assist law enforcement and public safety organizations by providing fast and accurate identification from images or video streams.

🧠 Features
🔍 Real-time face detection from video streams
🧑‍💻 Face recognition using ArcFace model
📊 High accuracy matching with database
🗂️ Missing person database management
📷 Image and live camera input support
📡 Scalable and efficient processing

🛠️ Tech Stack
Programming Language: Python
Libraries/Frameworks:
OpenCV (face detection)
TensorFlow / PyTorch (deep learning)
ArcFace (face recognition model)
Database: SQLite / MongoDB
Frontend (optional): HTML, CSS, JavaScript

⚙️ How It Works
Capture input from camera or image
Detect faces using computer vision
Extract facial features using ArcFace
Compare with stored database
Display matched results with confidence score



▶️ Installation

git clone https://github.com/jayanth567274/Vision-Track.git
cd Vision-Track
pip install -r requirements.txt

---

## Resend Email Setup

Email confirmations are optional. If `RESEND_API_KEY` is missing, cases will still be created and saved normally, but confirmation emails will be skipped.

1. Copy `.env.example` to `.env`
2. Replace `re_xxxxxxxxx` with your real Resend API key:

```env
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=no-reply@visiontrack.app
CONVEX_SITE_URL=http://localhost:5173/
```

3. Start the app:

```bash
npm run dev
```

### Example Resend usage

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.EMAIL_FROM || 'no-reply@visiontrack.app',
  to: 'user@example.com',
  subject: 'Vision Track case created',
  html: '<p>Your missing person case has been created successfully.</p>',
});
```

> Make sure to replace `re_xxxxxxxxx` with your real Resend API key before running the project.

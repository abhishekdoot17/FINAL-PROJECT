# 🇮🇳 Urban Awareness

A full-stack platform for Indian citizens to report urban issues, track government action, and create accountability.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + Google OAuth2 |
| File Uploads | Multer |

## 📁 Project Structure

```
final_year/
├── client/          # Next.js frontend
└── server/          # Express.js backend
```

## ⚙️ Setup

### Server
```bash
cd server
cp .env.example .env    # Fill in your values
npm install
npm run dev             # Runs on http://localhost:5001
```

### Client
```bash
cd client
cp .env.example .env.local   # Fill in your values
npm install
npm run dev                   # Runs on http://localhost:3000
```

## 🔐 Environment Variables

### Server (`server/.env`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
PORT=5001
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=       # Optional
GOOGLE_CLIENT_SECRET=   # Optional
```

### Client (`client/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## ✨ Features

- 📋 Citizen issue reporting with image uploads
- 🔍 Browse & filter approved public reports
- 👍 Upvote reports to amplify community impact
- 🏛️ Government schemes & initiatives browser
- 🔐 JWT authentication + Google OAuth (optional)
- 🛡️ Admin panel — approve/reject reports, manage users
- 📊 Dashboard with report status tracking

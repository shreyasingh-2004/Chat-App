# Real-Time Chat Application

A full-featured WhatsApp-style chat application with real-time messaging, user authentication, file sharing, and online status indicators.

## Features

- User Authentication (JWT)
- Real-time messaging with Socket.IO
- One-to-one private chats
- Online/Offline status indicators
- File sharing (images, videos, documents via Cloudinary)
- Message persistence in MongoDB
- Read receipts (single/double ticks)
- Typing indicators
- Responsive WhatsApp-style UI
- End-to-end message encryption
- Logout functionality

## Tech Stack

### Frontend
- React.js
- Socket.IO Client
- Axios
- CSS3 (WhatsApp-style design)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs for password hashing
- CryptoJS for message encryption

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
\`\`\`

### 2. Install Backend Dependencies
\`\`\`bash
cd server
npm install
\`\`\`

### 3. Install Frontend Dependencies
\`\`\`bash
cd ../client
npm install
\`\`\`

### 4. Environment Setup

Create `.env` files in both server and client directories (see `.env.example` files)

### 5. Start MongoDB
\`\`\`bash
mongod
\`\`\`

### 6. Run the Application

**Backend:**
\`\`\`bash
cd server
npm run dev
\`\`\`

**Frontend:**
\`\`\`bash
cd client
npm start
\`\`\`

### 7. Access the App
Open http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users (except current)
- `GET /api/users/search?q=` - Search users

### Messages
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId/read` - Mark message as read

## 🎯 Usage

1. Register a new account
2. Login with your credentials
3. Click on any user in the sidebar to start chatting
4. Send messages in real-time
5. See when messages are delivered and read (double ticks)
6. View online/offline status of other users

## Deployment

### Deploy Backend to Render/Railway
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

### Deploy Frontend to Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy

## Project Structure

\`\`\`
chat-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/        # Auth middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utilities (encryption)
│   ├── index.js           # Entry point
│   └── package.json
├── .gitignore
├── README.md
└── LICENSE
\`\`\`

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Message encryption in database
- HTTP-only cookies (optional)
- CORS protection
- Input validation


## Acknowledgments

- WhatsApp for UI inspiration
- Socket.IO for real-time communication
- MongoDB for database


## 📧 Contact

Your Email - shreya031204@gmail.com

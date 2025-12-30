# CodeLab Platform - Setup Guide

## Quick Start Guide

### Prerequisites

Make sure you have the following installed on your system:
- Node.js (v18 or higher)
- Python 3.x (for code execution)
- Git (optional)

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend folder:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Copy the environment file:
```powershell
Copy-Item .env.example .env
```

4. Initialize the database:
```powershell
npm run init-db
```

5. Seed the database with sample data:
```powershell
npm run seed
```

6. Start the backend server:
```powershell
npm run dev
```

The backend server will start on http://localhost:5000

### Step 2: Frontend Setup

1. Open a NEW terminal and navigate to the frontend folder:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm run dev
```

The frontend will start on http://localhost:3000

### Step 3: Access the Application

1. Open your browser and go to http://localhost:3000
2. Login with demo credentials:
   - **USN**: 1MS21CS001
   - **Password**: password123

## Demo Accounts

### Students
- USN: 1MS21CS001, Password: password123
- USN: 1MS21CS002, Password: password123
- USN: 1MS21CS003, Password: password123

### Teachers
- USN: TCSE001, Password: password123
- USN: TCSE002, Password: password123

### Admin
- USN: ADMIN001, Password: password123

## Project Structure

```
codelab-platform/
├── backend/
│   ├── database/          # Database setup
│   ├── middleware/        # Auth and error handling
│   ├── routes/           # API endpoints
│   ├── scripts/          # Database scripts
│   ├── services/         # Code execution engine
│   ├── server.js         # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Features Implemented

### ✅ Student Side (Complete)
- [x] Authentication (USN/Roll Number + Password)
- [x] Student Dashboard
- [x] Assignments List
- [x] Assignment Detail View
- [x] Problem Page with Code Editor
- [x] Run Code (Sample Tests)
- [x] Submit Code (All Tests)
- [x] Results Display
- [x] Submission History
- [x] Contest Mode
- [x] Live Leaderboard
- [x] Mobile Responsive UI

### 🔧 Backend (Complete)
- [x] REST API
- [x] JWT Authentication
- [x] Role-based Access Control
- [x] SQLite Database
- [x] Code Execution Engine
- [x] Test Case Evaluation
- [x] Verdict Calculation

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Dashboard
- GET /api/dashboard

### Assignments
- GET /api/assignments
- GET /api/assignments/:id
- POST /api/assignments/:id/start

### Problems
- GET /api/problems/:id
- GET /api/problems/:id/code

### Submissions
- POST /api/submissions/run
- POST /api/submissions/submit
- GET /api/submissions/history/:problemId
- GET /api/submissions/:id

### Contests
- GET /api/contests
- GET /api/contests/:id
- GET /api/contests/:id/leaderboard

### Notifications
- GET /api/notifications
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check that the database was initialized properly
- Verify all dependencies are installed

### Frontend won't start
- Make sure port 3000 is not in use
- Clear node_modules and reinstall: `Remove-Item -Recurse node_modules; npm install`
- Check that the backend is running

### Code execution not working
- Ensure Python is installed and in your PATH
- For C++: Install MinGW or similar C++ compiler
- For JavaScript: Node.js should already be installed

### Database errors
- Delete the database file and re-run: `npm run init-db` then `npm run seed`
- Check file permissions

## Development Tips

1. **Auto-save**: Code editor auto-saves every 10 seconds
2. **Hot Reload**: Both frontend and backend support hot reload
3. **Debug**: Check browser console and terminal for errors
4. **Database**: Use DB Browser for SQLite to inspect the database

## Security Notes

⚠️ **This is a pilot academic platform - NOT for production use**

- Change JWT_SECRET in production
- Implement proper code sandboxing for production
- Add rate limiting for submissions
- Enable HTTPS
- Implement proper input validation

## Next Steps

- Add teacher control panel (being developed separately)
- Implement plagiarism detection
- Add more programming languages
- Enhance code execution sandbox
- Add real-time updates with WebSockets
- Implement submission attempt limits

## Support

For issues or questions:
1. Check the console logs
2. Review the API documentation above
3. Ensure all prerequisites are installed

---

**Built for academic use only** • CodeLab Platform v1.0

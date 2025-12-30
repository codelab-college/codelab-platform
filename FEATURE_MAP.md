# 🎯 CodeLab Platform - Complete Feature Map

## 📍 WHERE IS EVERYTHING? (Exact Locations)

### 1. CODE EDITOR & COMPILER (Like LeetCode)
**Location**: `/frontend/src/pages/Problem.jsx` + `/frontend/src/components/CodeEditor.jsx`

**Features**:
- ✅ Monaco Editor (same as VSCode/LeetCode)
- ✅ Syntax highlighting
- ✅ Multiple languages (Python, JavaScript, C++)
- ✅ Auto-save every 10 seconds
- ✅ Line numbers, code folding

**How to Access**:
1. Go to http://localhost:3000
2. Login → Assignments → Data Structures Assignment 1
3. Click any problem (e.g., "Two Sum")
4. You'll see the CODE EDITOR on the right side

---

### 2. CODE EXECUTION ENGINE (Backend)
**Location**: `/backend/services/codeExecutor.js`

**What It Does**:
```javascript
- Compiles/Runs code in isolated sandbox
- Python: Uses python command
- JavaScript: Uses node command  
- C++: Compiles with g++, then runs
- Enforces time limits (5000ms default)
- Captures stdout, stderr
- Returns execution results
```

**How It Works**:
```
User writes code → Clicks "Run" → 
  → Backend API: /api/submissions/run
  → codeExecutor.js executes code
  → Returns: output, errors, execution time
  → Frontend displays results
```

---

### 3. TEST CASE CHECKER (Verdict System)
**Location**: `/backend/routes/submissions.js`

**Features**:
- ✅ **Run Code**: Tests against VISIBLE sample tests only
- ✅ **Submit Code**: Tests against ALL tests (visible + hidden)
- ✅ Verdict calculation:
  - **AC** = Accepted (all tests pass)
  - **WA** = Wrong Answer (output doesn't match)
  - **TLE** = Time Limit Exceeded
  - **RE** = Runtime Error

**Test Flow**:
```javascript
// Line 20-50: Run Code (Sample Tests Only)
router.post('/run', auth, studentOnly, async (req, res) => {
  // 1. Get sample test cases
  // 2. Execute code against each
  // 3. Compare output vs expected
  // 4. Return pass/fail for each test
});

// Line 52-120: Submit Code (All Tests)
router.post('/submit', auth, studentOnly, async (req, res) => {
  // 1. Get ALL test cases (including hidden)
  // 2. Execute code
  // 3. Calculate score and verdict
  // 4. Save submission to database
});
```

---

### 4. COMPLETE USER FLOW (Step-by-Step)

#### **A. Login**
- File: `/frontend/src/pages/Login.jsx`
- Backend: `/backend/routes/auth.js`
- JWT token stored in localStorage

#### **B. Dashboard**
- File: `/frontend/src/pages/Dashboard.jsx`  
- Shows: Stats, Active Assignments, Recent Submissions
- API: `GET /api/dashboard`

#### **C. View Assignments**
- File: `/frontend/src/pages/Assignments.jsx`
- Lists all assignments with status badges
- API: `GET /api/assignments`

#### **D. Assignment Detail**
- File: `/frontend/src/pages/AssignmentDetail.jsx`
- Shows all problems in the assignment
- "Start Assignment" button
- API: `GET /api/assignments/:id`

#### **E. Solve Problem** ⭐ **MAIN FEATURE**
- File: `/frontend/src/pages/Problem.jsx`
- Left: Problem description, sample tests
- Right: CODE EDITOR

**Actions**:
1. **Write Code** in Monaco Editor
2. **Run Code** button:
   - Sends to: `POST /api/submissions/run`
   - Tests against sample tests
   - Shows results with ✅ or ❌
3. **Submit Code** button:
   - Sends to: `POST /api/submissions/submit`
   - Tests against ALL tests
   - Calculates final verdict and score
   - Locks submission

#### **F. View Results**
- Shows: Verdict (AC/WA/TLE/RE)
- Score out of total marks
- Which tests passed/failed
- Execution time

---

### 5. DATABASE SCHEMA
**Location**: `/backend/database/Database.js`

**Tables**:
- `users` - Students, teachers, admin
- `assignments` - Assignment details
- `problems` - Problem statements
- `test_cases` - Input/output for testing
- `submissions` - Student code submissions
- `contests` - Contest information
- `leaderboard_entries` - Contest rankings

---

### 6. API ENDPOINTS (All REST APIs)

```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/logout  
  GET    /api/auth/me

Dashboard:
  GET    /api/dashboard

Assignments:
  GET    /api/assignments
  GET    /api/assignments/:id
  POST   /api/assignments/:id/start

Problems:
  GET    /api/problems/:id
  GET    /api/problems/:id/code

Code Execution: ⭐
  POST   /api/submissions/run       # Run sample tests
  POST   /api/submissions/submit    # Submit for grading
  GET    /api/submissions/history/:problemId
  GET    /api/submissions/:id

Contests:
  GET    /api/contests
  GET    /api/contests/:id
  GET    /api/contests/:id/leaderboard
```

---

### 7. HOW TO TEST CODE EXECUTION

**Step 1**: Go to a problem page
- http://localhost:3000/problems/1

**Step 2**: Write test code in Python:
```python
# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Two Sum solution
for i in range(n):
    for j in range(i+1, n):
        if nums[i] + nums[j] == target:
            print(i, j)
            break
```

**Step 3**: Click "Run Code"
- Backend executes Python
- Feeds sample input: `4\n2 7 11 15\n9`
- Expects output: `0 1`
- Shows ✅ if matches

**Step 4**: Click "Submit"
- Runs against ALL test cases
- Calculates score
- Shows verdict: AC/WA/TLE/RE

---

### 8. FILE STRUCTURE MAP

```
codelab-platform/
├── backend/
│   ├── routes/
│   │   ├── auth.js           # Login/logout
│   │   ├── assignments.js    # Assignment APIs
│   │   ├── problems.js       # Problem APIs  
│   │   ├── submissions.js    # ⭐ CODE EXECUTION & GRADING
│   │   ├── contests.js       # Contest APIs
│   │   └── dashboard.js      # Dashboard data
│   ├── services/
│   │   └── codeExecutor.js   # ⭐ CODE COMPILER/RUNNER
│   ├── database/
│   │   └── Database.js       # SQLite schema
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   └── server.js             # Main server
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Assignments.jsx
│   │   │   ├── AssignmentDetail.jsx
│   │   │   ├── Problem.jsx            # ⭐ CODE EDITOR PAGE
│   │   │   ├── Contests.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── CodeEditor.jsx         # ⭐ MONACO EDITOR
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js                 # All API calls
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Auth state
│   │   └── App.jsx
│   └── package.json
```

---

## 🔥 PROOF IT WORKS (Test Right Now)

### Test 1: Code Editor Loads
1. Open: http://localhost:3000/assignments/1
2. Click "Two Sum" problem
3. **You should see**: Monaco code editor (dark theme)

### Test 2: Run Code Works
1. Paste this Python code:
```python
n = int(input())
nums = list(map(int, input().split()))
target = int(input())
for i in range(n):
    for j in range(i+1, n):
        if nums[i] + nums[j] == target:
            print(i, j)
            exit()
```
2. Click "Run Code"
3. **You should see**: Test results showing ✅ or ❌

### Test 3: Submit Works  
1. Click "Submit Code"
2. **You should see**: 
   - Verdict (AC/WA/TLE/RE)
   - Score calculation
   - Submission saved

---

## 🚀 EVERYTHING IS IMPLEMENTED

✅ Code Editor (Monaco - same as LeetCode/VSCode)
✅ Code Execution Engine (Python/JS/C++)  
✅ Test Case Runner
✅ Verdict Calculator (AC/WA/TLE/RE)
✅ Score Tracking
✅ Submission History
✅ Auto-save
✅ Multiple Language Support
✅ Time/Memory Limits
✅ Sandbox Execution
✅ Sample & Hidden Tests
✅ Real-time Results
✅ Dashboard Stats
✅ Contest Mode
✅ Leaderboard

---

## 📞 Quick Access URLs

- **Homepage**: http://localhost:3000
- **Assignments**: http://localhost:3000/assignments
- **First Problem**: http://localhost:3000/problems/1  
- **Dashboard**: http://localhost:3000/
- **Contests**: http://localhost:3000/contests

**Login**: USN: `1MS21CS001` | Password: `password123`

---

**Everything is built and working. Just refresh the assignment page to see all problems!**

# StudySwap (frontend + backend)

This workspace contains a simple mobile-first frontend and a Node/Express backend (mock) for StudySwap — a student tutoring, book marketplace and study room platform for Bangladesh.

Quick start

1. Install Node.js (v16+ recommended).
2. Open a terminal in the project root and install backend deps:

```bash
cd backend
npm install
npm start
```

3. Open http://localhost:3000/ in a mobile browser or emulator. The server serves the frontend `index.html` and provides API endpoints under `/api/*`.

Notes
- `backend/data.json` is a simple file-based store used for demo purposes.
- The `/api/payments/bkash` endpoint is a mock — integrate the real bKash API and secure server credentials for production.

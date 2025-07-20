@echo off

echo Starting backend...
cd backend
call npm install
start cmd /k "npm start"
cd ..

echo Starting frontend...
cd frontend
call npm install
start cmd /k "npm run dev"
cd ..

echo Both backend and frontend started.
exit 
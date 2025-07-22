@echo off

echo Clearing old logs and creating logs directory...
cd backend
if exist logs (
  rmdir /s /q logs
)
mkdir logs
cd ..

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
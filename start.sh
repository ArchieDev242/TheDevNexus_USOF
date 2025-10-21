#!/bin/bash

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 2

echo "Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo "AdminJS: http://localhost:3000/admin (admin@usof.com / admin123)"
echo "Custom Admin: http://localhost:3000/admin-panel"
echo "Dashboard: http://localhost:3000/dashboard"
echo ""
echo "Press Ctrl+C to stop"
echo ""

wait

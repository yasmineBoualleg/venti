#!/bin/bash

# Get the local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "🚀 Starting Venti 2.0 for network access..."
echo "📍 Your local IP address: $LOCAL_IP"
echo "🌐 Frontend will be available at: http://$LOCAL_IP:3000"
echo "🔧 Backend API will be available at: http://$LOCAL_IP:8000"
echo ""
echo "Share these URLs with your teammates:"
echo "   Frontend: http://$LOCAL_IP:3000"
echo "   Backend API: http://$LOCAL_IP:8000"
echo ""

# Set environment variables
export FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
export SECRET_KEY="fuckmeandfuckthisshitbecauseicouldntbeanormalperson"
export DEBUG=True

# Verify Firebase service account file exists
if [ ! -f "./backend/firebase-service-account.json" ]; then
    echo "❌ Error: Firebase service account file not found!"
    echo "Expected location: ./backend/firebase-service-account.json"
    exit 1
fi

echo "✅ Firebase service account file found"

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting Django backend server..."
cd backend
python3 manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend server failed to start"
    exit 1
fi

echo "✅ Backend server started successfully"

# Start frontend server
echo "🎨 Starting React frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend server started successfully"

echo ""
echo "🎉 Both servers are running!"
echo "📱 Frontend: http://$LOCAL_IP:3000"
echo "🔧 Backend: http://$LOCAL_IP:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait 
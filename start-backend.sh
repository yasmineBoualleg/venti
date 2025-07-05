#!/bin/bash

echo "🔧 Starting Django Backend Server..."

# Set environment variables
export FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
export SECRET_KEY="fuckmeandfuckthisshitbecauseicouldntbeanormalperson"
export DEBUG=True

# Verify Firebase service account file exists
if [ ! -f "./firebase-service-account.json" ]; then
    echo "❌ Error: Firebase service account file not found!"
    echo "Expected location: ./firebase-service-account.json"
    exit 1
fi

echo "✅ Firebase service account file found"
echo "🚀 Starting Django server on 0.0.0.0:8000..."

# Start Django server
python3 manage.py runserver 0.0.0.0:8000 
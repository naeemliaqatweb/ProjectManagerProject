#!/bin/bash

BACKEND_URL="http://localhost:3200"
EMAIL="verify_user_$(date +%s)@example.com"
PASSWORD="SecurePassword123"

echo "1. Registering new user: $EMAIL"
REGISTER_RES=$(curl -s -X POST "$BACKEND_URL/users" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\", \"name\":\"Verify User\"}")

echo "Registration Response: $REGISTER_RES"

if [[ $REGISTER_RES == *"\"email\":\"$EMAIL\""* ]]; then
  echo "Registration Success!"
else
  echo "Registration Failed!"
  exit 1
fi

echo -e "\n2. Logging in with correct credentials"
LOGIN_RES=$(curl -s -X POST "$BACKEND_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

echo "Login Response: $LOGIN_RES"

if [[ $LOGIN_RES == *"\"email\":\"$EMAIL\""* ]]; then
  echo "Login Success!"
else
  echo "Login Failed!"
  exit 1
fi

echo -e "\n3. Logging in with WRONG password"
LOGIN_WRONG_RES=$(curl -v -s -X POST "$BACKEND_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"WrongPassword\"}")

if [[ $(echo "$LOGIN_WRONG_RES" | grep "404") ]]; then
  echo "Wrong Password Login properly refused (404 Not Found - as implemented in controller)"
else
  echo "Wrong Password Login verification failed!"
fi

echo -e "\nVerification Complete!"

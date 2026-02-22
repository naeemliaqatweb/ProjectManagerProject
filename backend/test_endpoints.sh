#!/bin/bash

# Base URL
URL="http://localhost:3100"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Testing Backend Endpoints${NC}"

# 1. Create a Project (Assuming we have a user, but since we don't have auth yet, we'll just mock ownerId or fail if DB constraints enforce it)
# Note: In real app, we need a valid existing User ID. For now, we will try with a fake ID and see if it works (standard Prisma behavior with MongoDB creates references but might not enforce existence unless db push ran)
# Actually, since we use @relation, the user MUST exist. 
# So we first need to create a User if one doesn't exist. But we didn't make a User endpoint.
# I will try to create a project with a random ObjectID and see what happens.

echo "Creating Project..."
curl -X POST $URL/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "ownerId": "65cb88888888888888888888"}' 
echo -e "\n"

# 2. Get Projects by User
echo "Getting Projects for User..."
curl -X GET $URL/projects/user/65cb88888888888888888888
echo -e "\n"

# 3. Get Single Project (Copy an ID from previous output manually to test, here just hitting a dummy one)
echo "Getting Single Project..."
curl -X GET $URL/projects/65cb88888888888888888888
echo -e "\n"

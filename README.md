# Autonomize-AI
This is a Node.js and Express.js backend application that interacts with the GitHub API and a SQLite database. The purpose is to perform various tasks related to GitHub user data.

Tasks
Task 1: Save GitHub User Data
Endpoint: POST /users
Test: Send a POST request with a GitHub username to save user data to the database.

Example curl command:
curl -X POST -H "Content-Type: application/json" -d '{"username": "ivey"}' http://localhost:3000/users

Task 2: Find Mutually Following Users
Endpoint: GET /users/:username/friends
Test: Send a GET request with a GitHub username to find mutually following users.

Example curl command:
curl http://localhost:3000/users/mralexgray/friends

Task 3: Search Users in the Database
Endpoint: GET /users/search
Test: Send a GET request with parameters like username or location to search users in the database.

Example curl command:
curl http://localhost:3000/users/search?username=ivey

Task 4: Soft Delete User Record
Endpoint: DELETE /users/:username
Test: Send a DELETE request with a GitHub username to soft delete a user record.

Example curl command:
curl -X DELETE http://localhost:3000/users/mralexgray

Task 5: Update User Fields
Endpoint: PUT /users/:username
Test: Send a PUT request with a GitHub username and updated fields to modify user data.

Example curl command:
curl -X PUT -H "Content-Type: application/json" -d '{"location": "New Location", "blog": "newblog.com", "bio": "New Bio"}' http://localhost:3000/users/mralexgray

Task 6: Get Sorted User List
Endpoint: GET /users
Test: Send a GET request with optional sort parameter to get a sorted list of all users.

Example curl command:
curl http://localhost:3000/users?sort=public_repos

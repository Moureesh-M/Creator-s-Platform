# Postman Guide

## Setup

1. Run `npm run install-all`.
2. Run `npm run server`.
3. Use `http://localhost:5000` as `baseURL`.

## Import

1. Import `docs/creators-platform.postman_collection.json`.
2. Import `docs/creators-platform.postman_environment.json`.
3. Select the `Creators Platform Local` environment.

## Run Order

1. Health / Health Check
2. Auth / Register User
3. Auth / Login User
4. Posts / Get All Posts
5. Posts / Create Post
6. Posts / Update Post
7. Posts / Delete Post

## Variables

- `baseURL`: API base URL.
- `authToken`: JWT used as `Authorization: Bearer {{authToken}}`.
- `userName`: Generated before registration.
- `userEmail`: Generated before registration and reused for login.
- `userPassword`: Generated before registration and reused for login.
- `userId`: Saved from auth responses when available.
- `postId`: Saved after creating a post.

Register includes token auto-save if the API returns a token. Login currently returns and saves `authToken`.

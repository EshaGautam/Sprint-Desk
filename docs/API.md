# API Documentation — SprintDesk

SprintDesk acts as a pure client-side application. It communicates with external public services for authentication and notification polling, and queries a local static asset for core sprint datasets.

## 1. DummyJSON Authentication

Manages login verifications, authorization tokens, and session refresh loops.

### User Login
Verifies credentials and returns JSON Web Tokens.
- **HTTP Method**: `POST`
- **Endpoint**: `https://dummyjson.com/auth/login`
- **Request Body**:
  ```json
  {
    "username": "emilys",
    "password": "emilyspass",
    "expiresInMins": 1
  }
  ```
- **Response Fields Used**:
  - `accessToken`: Short-lived JWT access token stored in-memory.
  - `refreshToken`: Persisted in localStorage for session restoration and silent refresh.
  - `username`: Displays user identity in the shell.

### Token Refresh
Refreshes credentials upon expiration to keep requests authorized.
- **HTTP Method**: `POST`
- **Endpoint**: `https://dummyjson.com/auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Behavior**:
  - Automatically triggered by the `apiClient` response interceptor upon catching a `401 Unauthorized` request error.
  - On success: Replaces the expired access token in-memory and retries the failed original request.
  - On failure: Logs out the user, clearing all tokens and redirecting to the `/login` route.

---

## 2. JSONPlaceholder

Simulates new notifications.

### Get Posts
Fetches a list of posts.
- **HTTP Method**: `GET`
- **Endpoint**: `https://jsonplaceholder.typicode.com/posts?_limit=5`
- **Query Parameters**:
  - `_limit=5`: Restricts the return size to 5 items to simulate an incoming alert feed.
- **Response Fields Used**:
  - `id`: Used as the stable notification identifier to filter out duplicates.
  - `title`: Mapped to the notification title.
  - `body`: Mapped to the notification details message.

---

## 3. Mock Data Source

The primary source for core project workflows.

### Get Board Mock Data
- **HTTP Method**: `GET`
- **Endpoint**: `/mock-data.json` (Local static frontend asset)
- **Response Structure**:
  - `users`: Board assignee profiles.
  - `sprints`: Sprint timeline records.
  - `tasks`: Core board tasks.
  - `comments`: Discussion logs.
  - `notifications`: Mock notification records.

---

## 4. Swagger / OpenAPI

Swagger/OpenAPI is not implemented because the assignment application does not contain a backend API server. The API integrations used by the frontend are documented here based on their actual external endpoints.

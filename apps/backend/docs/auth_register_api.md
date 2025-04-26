# API Endpoint: POST /api/v1/auth/register

Registers a new user by first creating an account in the integrated Supabase authentication service and then creating a corresponding user record in the local application database.

## Request

*   **Method:** `POST`
*   **URL:** `/api/v1/auth/register`
*   **Headers:**
    *   `Content-Type: application/json`
*   **Body Format:** `JSON`
*   **Body Parameters:**
    *   `email` (string, required): The desired email address for the new user. Must be unique in Supabase Auth.
    *   `password` (string, required): The desired password for the new user (minimum 8 characters).
    *   `full_name` (string, optional): The user's full name.

*   **Example Request Body:**

    ```json
    {
      "email": "new_user@example.com",
      "password": "a_secure_password_123",
      "full_name": "New User Name"
    }
    ```

## Responses

---

### 1. Success (200 OK)

Returned when the user is successfully created in both Supabase Auth and the local database.

*   **Response Body:** `application/json` (Based on `UserReadSchema`)

    ```json
    {
      "email": "new_user@example.com",
      "is_active": true,
      "is_superuser": false,
      "full_name": "New User Name",
      "id": "us_xxxxxxxxxxxxxxxxxxxxxxxx" // ID from the local DB
    }
    ```
    *(Note: `id` is the local database ID, not necessarily the Supabase Auth UUID unless explicitly synced)*

*   **`curl` Example:**
    *(Use a unique email address and a strong password)*

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/register \
         -H "Content-Type: application/json" \
         -d '{"email": "unique_email@provider.com", "password": "a_very_strong_password!@#", "full_name": "Test User"}'
    ```

---

### 2. Registration Failed (Supabase Error) (400 Bad Request)

Returned when Supabase Auth rejects the sign-up attempt. Common reasons include:
*   Email address already exists in Supabase Auth.
*   Password does not meet Supabase strength requirements.
*   Invalid email address format rejected by Supabase.

*   **Response Body:** `application/json`

    *   Example (Email Exists):
        ```json
        {
          "detail": "Registration failed: User already registered"
        }
        ```
    *   Example (Weak Password):
        ```json
        {
          "detail": "Registration failed: Password should be at least 6 characters"
        }
        ```
    *   Example (Invalid Email):
        ```json
        {
          "detail": "Registration failed: Email address \"bad-email\" is invalid"
        }
        ```

*   **`curl` Example (Using existing email):**

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/register \
         -H "Content-Type: application/json" \
         -d '{"email": "existing_user@example.com", "password": "any_valid_password"}'
    ```

---

### 3. Validation Error (422 Unprocessable Entity)

Returned by FastAPI if the request body does not conform to `UserCreateSchema`. Common reasons:
*   Missing `email` or `password`.
*   Invalid email format (rejected by Pydantic's `EmailStr`).
*   Password is shorter than 8 characters.

*   **Response Body:** `application/json`

    ```json
    {
      "detail": [
        {
          "loc": [
            "body",
            "password"
          ],
          "msg": "ensure this value has at least 8 characters",
          "type": "value_error",
          "ctx": {
            "limit_value": 8
          }
        }
        // ... other validation errors if present ...
      ]
    }
    ```

*   **`curl` Example (Short Password):**

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/register \
         -H "Content-Type: application/json" \
         -d '{"email": "test@example.com", "password": "short"}'
    ```

---

### 4. Internal Server Error (500 Internal Server Error)

Returned for unexpected errors during processing, such as:
*   Inability to connect to the Supabase API during sign-up.
*   Unexpected errors within the Supabase client library during sign-up.
*   Failure to write to the local database *after* successful Supabase sign-up.
*   Other unhandled exceptions in the endpoint logic.

*   **Response Body:** `application/json`

    *   Example (Supabase Connection Error):
        ```json
        {
          "detail": "An unexpected error occurred during registration with authentication service."
        }
        ```
    *   Example (Local DB Write Failure):
        ```json
        {
          "detail": "Failed to create user record locally after successful sign-up."
        }
        ```
        *(Note: If traceback inclusion is active for debugging, the full traceback might be included here - **INSECURE**)*

*   **`curl` Example:**
    *It's hard to reliably trigger a 500 error via `curl`. This typically occurs due to server-side issues.*

    ```bash
    # This command might result in a 500 if the server has issues
    curl -X POST http://localhost:8000/api/v1/auth/register \
         -H "Content-Type: application/json" \
         -d '{"email": "trigger_error@example.com", "password": "a_valid_password_123"}'
    ```

---

## Notes

*   This endpoint performs a two-step registration: first in Supabase Auth, then in the local database.
*   **Email Confirmation:** By default, Supabase Auth requires users to confirm their email address via a link sent to their inbox before they can log in. This endpoint does *not* bypass that confirmation step.
*   **Inconsistency Risk:** If the local database write fails *after* the Supabase sign-up succeeds, the user will exist in Supabase but not locally. Manual intervention might be needed to resolve this state.
*   **Existing Local User:** If a user with the given email already exists in the local database *before* this endpoint is called (perhaps due to a previous failed attempt or manual entry), the current implementation logs a warning and returns the existing local user data *after* ensuring the user also exists in Supabase. This behavior might need refinement depending on the desired synchronization strategy. 
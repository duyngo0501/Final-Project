# API Endpoint: POST /api/v1/auth/login

Authenticates a user using their email and password via the integrated Supabase authentication service and returns a JWT access token upon success.

## Request

*   **Method:** `POST`
*   **URL:** `/api/v1/auth/login`
*   **Headers:**
    *   `Content-Type: application/x-www-form-urlencoded`
*   **Body Format:** `x-www-form-urlencoded`
*   **Body Parameters:**
    *   `username` (string, required): The user's registered email address.
    *   `password` (string, required): The user's password.

## Responses

---

### 1. Success (200 OK)

Returned when the provided email and password match a verified user in Supabase Auth.

*   **Response Body:** `application/json`

    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      "token_type": "bearer"
    }
    ```

*   **`curl` Example:**
    *(Replace `your_verified_email@example.com` and `your_correct_password` with actual valid credentials)*

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/login \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=your_verified_email@example.com&password=your_correct_password"
    ```

---

### 2. Invalid Credentials (401 Unauthorized)

Returned when the email/password combination does not match any user in Supabase Auth.

*   **Response Body:** `application/json`

    ```json
    {
      "detail": "Incorrect email or password: Invalid login credentials"
    }
    ```

*   **`curl` Example:**
    *(Using a valid email format but an incorrect password)*

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/login \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=your_verified_email@example.com&password=incorrect_password"
    ```

---

### 3. Email Not Confirmed (401 Unauthorized)

Returned when the credentials are correct, but the user has not yet verified their email address by clicking the confirmation link sent by Supabase (if email confirmation is enabled in your Supabase project).

*   **Response Body:** `application/json`

    ```json
    {
      "detail": "Incorrect email or password: Email not confirmed"
    }
    ```

*   **`curl` Example:**
    *(Using credentials for a user whose email hasn't been confirmed yet)*

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/login \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=unconfirmed_email@example.com&password=correct_password_for_unconfirmed_user"
    ```

---

### 4. Validation Error (422 Unprocessable Entity)

Returned by FastAPI if the request body is malformed or missing required fields (less likely with `x-www-form-urlencoded` and `OAuth2PasswordRequestForm` dependency which handles basic validation, but possible if data is missing).

*   **Response Body:** `application/json`

    ```json
    {
      "detail": [
        {
          "loc": [
            "body",
            "password"
          ],
          "msg": "field required",
          "type": "value_error.missing"
        }
      ]
    }
    ```

*   **`curl` Example (Missing Password):**

    ```bash
    curl -X POST http://localhost:8000/api/v1/auth/login \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=test@example.com"
    ```

---

### 5. Internal Server Error (500 Internal Server Error)

Returned for unexpected errors during processing, such as:
*   Inability to connect to the Supabase API.
*   Unexpected errors within the Supabase client library.
*   Other unhandled exceptions in the endpoint logic.

*   **Response Body:** `application/json`

    *   **Standard:**
        ```json
        {
          "detail": "An unexpected error occurred during login."
        }
        ```
    *   **DEBUG ONLY (Insecure):** If the temporary traceback inclusion is active:
        ```json
        {
          "detail": "An unexpected error occurred during login: [Original Error Message]\nTraceback:\n[Full Python Traceback Stack]..."
        }
        ```
        **Warning:** Exposing tracebacks is a security risk and should **never** be enabled in production or non-local environments.

*   **`curl` Example:**
    *It's hard to reliably trigger a 500 error via `curl`. This typically occurs due to server-side issues (like Supabase being down, network problems, code bugs). The command would look like a normal login attempt, but the server would encounter an issue.*

    ```bash
    # This command might result in a 500 if the server has issues
    curl -X POST http://localhost:8000/api/v1/auth/login \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=any_email@example.com&password=any_password"
    ```

---

## Notes

*   This endpoint relies entirely on Supabase Auth for credential validation.
*   Users must typically confirm their email address after registration (depending on Supabase project settings) before they can successfully log in.
*   The returned `access_token` is a JWT issued by Supabase and should be sent in the `Authorization: Bearer <token>` header for subsequent requests to protected endpoints. 
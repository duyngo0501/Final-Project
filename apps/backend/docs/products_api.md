# API Endpoint: GET /api/v1/products/

Retrieves a paginated list of games from the external RAWG.io API.

## Request

*   **Method:** `GET`
*   **URL:** `/api/v1/products/`
*   **Headers:**
    *   `accept: application/json` (Optional, but good practice)
*   **Query Parameters:**
    *   `page` (integer, optional, default: 1): The page number to retrieve.
    *   `page_size` (integer, optional, default: 10): The number of results per page (valid range: 1-100).
    *   *(Note: Additional filtering parameters like `search`, `genres`, `platforms`, `ordering` can be added by extending the endpoint and passing them to the `get_rawg_games` client function)*

## Responses

---

### 1. Success (200 OK)

Returned when game data is successfully fetched from the RAWG.io API.

*   **Response Body:** `application/json` (Matches `ProductListingResponse` schema)

    ```json
    {
      "count": 885211,
      "next": "https://api.rawg.io/api/games?key=YOUR_RAWG_KEY&page=2&page_size=5",
      "previous": null,
      "results": [
        {
          "id": 3498,
          "slug": "grand-theft-auto-v",
          "name": "Grand Theft Auto V",
          "released": "2013-09-17",
          "tba": false,
          "background_image": "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
          "rating": 4.47,
          "rating_top": 5,
          // ... other game fields as returned by RAWG ...
        },
        {
          // ... next game object ...
        }
        // ... remaining game objects for the page ...
      ]
    }
    ```

*   **`curl` Example (Default page):**

    ```bash
    curl -X GET "http://localhost:8000/api/v1/products/" -H "accept: application/json"
    ```

*   **`curl` Example (Specific page and size):**

    ```bash
    curl -X GET "http://localhost:8000/api/v1/products/?page=3&page_size=20" -H "accept: application/json"
    ```

---

### 2. Service Unavailable (503 Service Unavailable)

Returned if the backend fails to connect to or retrieve data from the external RAWG.io API.

*   **Response Body:** `application/json`

    ```json
    {
      "detail": "Could not fetch game data from external service."
    }
    ```

*   **`curl` Example:**
    *(This error depends on the external service being unavailable, difficult to trigger reliably via curl)*

    ```bash
    # This command *might* result in 503 if the RAWG API is down or unreachable
    curl -X GET "http://localhost:8000/api/v1/products/" -H "accept: application/json"
    ```

---

### 3. Validation Error (422 Unprocessable Entity)

Returned by FastAPI if query parameters are invalid (e.g., non-integer `page`, `page_size` out of range).

*   **Response Body:** `application/json`

    ```json
    {
      "detail": [
        {
          "loc": [
            "query",
            "page_size"
          ],
          "msg": "ensure this value is less than or equal to 100",
          "type": "value_error",
          "ctx": {
            "limit_value": 100
          }
        }
      ]
    }
    ```

*   **`curl` Example (Invalid `page_size`):**

    ```bash
    curl -X GET "http://localhost:8000/api/v1/products/?page_size=200" -H "accept: application/json"
    ```

---

## Notes

*   This endpoint acts as a proxy to the RAWG.io API for listing games.
*   The `next` and `previous` URLs in the response are directly from the RAWG API and may contain their API key.
*   The specific fields returned within each game object in the `results` array depend on the data provided by the RAWG.io API.
*   Custom games created via `/api/v1/products/custom-games/` are **not** included in this listing. 
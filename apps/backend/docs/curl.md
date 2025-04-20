# Example API Test Commands (curl)

These commands assume the server is running locally on port 8000 and the API prefix is `/api/v1`.

**Note:** Commands modifying data (POST, PUT, DELETE) likely require authentication. Replace `YOUR_AUTH_TOKEN` with a valid Bearer token obtained from your login endpoint.

## Basic Commands

**Test Root Endpoint:**
```bash
curl http://localhost:8000/
```
*(Should return `{"Hello":"World"}`)*

**Get All Items (first 100):**
```bash
curl http://localhost:8000/api/v1/items/get-items
```
*(Might return an empty list `[]` or items if any exist)*

**Get a Specific Item (Replace `{item_id}` with an actual UUID):**
```bash
curl http://localhost:8000/api/v1/items/get-item/{item_id}
```
*(Will likely return 404 if the ID doesn't exist, or the item data)*

## Commands Requiring Authentication

Replace `YOUR_AUTH_TOKEN` with a real token.

**Create an Item:**
```bash
curl -X POST http://localhost:8000/api/v1/items/create-item \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_AUTH_TOKEN" \
-d '{
  "title": "My Test Item",
  "description": "This is a test item description."
}'
```
*(Adjust the JSON `-d` payload based on your `ItemCreate` schema)*

**Update an Item (Replace `{item_id}` and `YOUR_AUTH_TOKEN`):**
```bash
curl -X PUT http://localhost:8000/api/v1/items/update-item/{item_id} \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_AUTH_TOKEN" \
-d '{
  "description": "Updated description."
}'
```
*(Adjust JSON `-d` payload based on your `ItemUpdate` schema)*

**Delete an Item (Replace `{item_id}` and `YOUR_AUTH_TOKEN`):**
```bash
curl -X DELETE http://localhost:8000/api/v1/items/delete/{item_id} \
-H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

*Remember to check your specific API routes (e.g., in `utils.py`, authentication routes) for more endpoints.*
*Access the interactive docs at `http://localhost:8000/docs` for a full list and testing UI.*

## Cart Commands (Requires Authentication)

Replace `YOUR_AUTH_TOKEN` with a real token and `{product_id}` with a valid product UUID.

**Get Cart Contents:**
```bash
curl http://localhost:8000/api/v1/cart/ \
-H "Authorization: Bearer YOUR_AUTH_TOKEN"
```
*(Returns the user's cart, possibly creating an empty one first)*

**Add Item to Cart (e.g., 2 units of product_id):**
```bash
curl -X POST http://localhost:8000/api/v1/cart/items \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_AUTH_TOKEN" \
-d '{
  "product_id": "{product_id}",
  "quantity": 2
}'
```
*(Returns the created/updated cart item)*

**Update Item Quantity in Cart (e.g., set quantity to 5):**
```bash
curl -X PUT http://localhost:8000/api/v1/cart/items/{product_id} \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_AUTH_TOKEN" \
-d '{
  "quantity": 5
}'
```
*(Returns the updated cart item)*

**Remove Item from Cart:**
```bash
curl -X DELETE http://localhost:8000/api/v1/cart/items/{product_id} \
-H "Authorization: Bearer YOUR_AUTH_TOKEN"
```
*(Returns 204 No Content on success)*

**Clear Entire Cart:**
```bash
curl -X DELETE http://localhost:8000/api/v1/cart/ \
-H "Authorization: Bearer YOUR_AUTH_TOKEN"
```
*(Returns 204 No Content on success)* 
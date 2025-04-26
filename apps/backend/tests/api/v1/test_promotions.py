import requests
import uuid
from datetime import datetime, timedelta

# --- Configuration ---
BASE_URL = "http://localhost:8000/api/v1"  # Adjust if your base URL differs
ADMIN_EMAIL = "duycanngo95@gmail.com"  # Make sure this matches your settings
ADMIN_PASSWORD = "string"  # Replace with actual admin password
USER_EMAIL = "curlynguyen95@gmail.com"  # Assumes this regular user exists
USER_PASSWORD = "3551Meimei"  # Replace with actual user password

# Global storage for tokens and created IDs
tokens = {}
created_promotion_id = None

# --- Helper Functions ---


def login_user(email, password) -> str | None:
    """Logs in a user and returns the access token."""
    login_url = f"{BASE_URL}/auth/login"
    try:
        response = requests.post(
            login_url, data={"username": email, "password": password}
        )
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        token_data = response.json()
        print(f"[Login Success] User: {email}, Token obtained.")
        return token_data.get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"[Login Failed] User: {email}, Error: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response Body: {e.response.json()}")
            except requests.exceptions.JSONDecodeError:
                print(f"Response Body: {e.response.text}")
        return None
    except Exception as e:
        print(f"[Login Failed] User: {email}, Unexpected Error: {e}")
        return None


def get_auth_headers(token_type="admin") -> dict:
    """Returns authorization headers for admin or regular user."""
    token = tokens.get(token_type)
    if not token:
        raise ValueError(
            f"{token_type.capitalize()} user not logged in or token missing."
        )
    return {"Authorization": f"Bearer {token}"}


# --- Test Functions ---


# Simple test execution flow
def run_tests():
    global tokens
    global created_promotion_id

    print("\n--- Running Promotion API Tests ---")

    # 1. Login Admin and User
    print("\n--- Logging in Users ---")
    tokens["admin"] = login_user(ADMIN_EMAIL, ADMIN_PASSWORD)
    tokens["user"] = login_user(USER_EMAIL, USER_PASSWORD)

    if not tokens.get("admin") or not tokens.get("user"):
        print("Login failed for admin or user. Aborting tests.")
        return

    # 2. Test Create Promotion
    print("\n--- Testing POST /promotions --- (Admin Only)")
    test_create_promotion()

    # 3. Test Read Promotions (Public)
    print("\n--- Testing GET /promotions --- (Public)")
    test_read_promotions()

    # 4. Test Read Single Promotion (Public)
    print("\n--- Testing GET /promotions/{id} --- (Public)")
    test_read_single_promotion()

    # 5. Test Update Promotion
    print("\n--- Testing PUT /promotions/{id} --- (Admin Only)")
    test_update_promotion()

    # 6. Test Delete Promotion
    print("\n--- Testing DELETE /promotions/{id} --- (Admin Only)")
    test_delete_promotion()

    print("\n--- Promotion API Tests Finished ---")


def test_create_promotion():
    global created_promotion_id
    promo_url = f"{BASE_URL}/promotions/"
    unique_code = f"TESTPROMO_{uuid.uuid4().hex[:6]}"
    promo_data = {
        "code": unique_code,
        "description": "Test Promotion",
        "discount_percentage": 15.5,
        "max_discount_amount": 50000,
        "min_purchase_amount": 100000,
        "start_date": datetime.utcnow().isoformat(),
        "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "is_active": True,
    }

    # Try as Admin (should succeed)
    try:
        headers = get_auth_headers("admin")
        response = requests.post(promo_url, headers=headers, json=promo_data)
        print(f"Admin POST {promo_url} - Status: {response.status_code}")
        assert response.status_code == 201
        created_data = response.json()
        assert created_data["code"] == unique_code
        assert created_data["discount_percentage"] == 15.5
        created_promotion_id = created_data["id"]  # Save ID for later tests
        print(f"[SUCCESS] Admin created promotion (ID: {created_promotion_id})")
    except Exception as e:
        print(f"[FAILURE] Admin create promotion failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")

    # Try as Regular User (should fail - 403 Forbidden)
    try:
        headers = get_auth_headers("user")
        response = requests.post(promo_url, headers=headers, json=promo_data)
        print(f"User POST {promo_url} - Status: {response.status_code}")
        assert response.status_code == 403
        print("[SUCCESS] Regular user correctly forbidden from creating promotion.")
    except Exception as e:
        print(f"[FAILURE] Regular user create promotion test failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")


def test_read_promotions():
    promo_url = f"{BASE_URL}/promotions/"
    # Try as public (no auth needed)
    try:
        response = requests.get(promo_url)
        print(f"Public GET {promo_url} - Status: {response.status_code}")
        response.raise_for_status()
        assert isinstance(response.json(), list)
        # Check if our created promo is in the list (optional, depends on pagination/filtering)
        print("[SUCCESS] Public read promotions list succeeded.")
    except Exception as e:
        print(f"[FAILURE] Public read promotions list failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")


def test_read_single_promotion():
    if not created_promotion_id:
        print("[SKIP] Cannot read single promotion, ID not available.")
        return
    promo_url = f"{BASE_URL}/promotions/{created_promotion_id}"
    # Try as public (no auth needed)
    try:
        response = requests.get(promo_url)
        print(f"Public GET {promo_url} - Status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        assert data["id"] == created_promotion_id
        print("[SUCCESS] Public read single promotion succeeded.")
    except Exception as e:
        print(f"[FAILURE] Public read single promotion failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")


def test_update_promotion():
    if not created_promotion_id:
        print("[SKIP] Cannot update promotion, ID not available.")
        return
    promo_url = f"{BASE_URL}/promotions/{created_promotion_id}"
    update_data = {
        "description": "Updated Test Description",
        "discount_percentage": 20.0,
    }

    # Try as Admin (should succeed)
    try:
        headers = get_auth_headers("admin")
        response = requests.put(promo_url, headers=headers, json=update_data)
        print(f"Admin PUT {promo_url} - Status: {response.status_code}")
        response.raise_for_status()
        updated_data = response.json()
        assert updated_data["id"] == created_promotion_id
        assert updated_data["description"] == "Updated Test Description"
        assert updated_data["discount_percentage"] == 20.0
        print("[SUCCESS] Admin updated promotion.")
    except Exception as e:
        print(f"[FAILURE] Admin update promotion failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")

    # Try as Regular User (should fail - 403 Forbidden)
    try:
        headers = get_auth_headers("user")
        response = requests.put(promo_url, headers=headers, json=update_data)
        print(f"User PUT {promo_url} - Status: {response.status_code}")
        assert response.status_code == 403
        print("[SUCCESS] Regular user correctly forbidden from updating promotion.")
    except Exception as e:
        print(f"[FAILURE] Regular user update promotion test failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")


def test_delete_promotion():
    if not created_promotion_id:
        print("[SKIP] Cannot delete promotion, ID not available.")
        return
    promo_url = f"{BASE_URL}/promotions/{created_promotion_id}"

    # Try as Regular User (should fail - 403 Forbidden)
    try:
        headers = get_auth_headers("user")
        response = requests.delete(promo_url, headers=headers)
        print(f"User DELETE {promo_url} - Status: {response.status_code}")
        assert response.status_code == 403
        print("[SUCCESS] Regular user correctly forbidden from deleting promotion.")
    except Exception as e:
        print(f"[FAILURE] Regular user delete promotion test failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response: {e.response.text}")

    # Try as Admin (should succeed - 204 No Content)
    try:
        headers = get_auth_headers("admin")
        response = requests.delete(promo_url, headers=headers)
        print(f"Admin DELETE {promo_url} - Status: {response.status_code}")
        # 204 No Content should not raise_for_status typically, check code directly
        assert response.status_code == 204
        print("[SUCCESS] Admin deleted promotion.")
    except Exception as e:
        print(f"[FAILURE] Admin delete promotion failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")  # Should be empty for 204
            except:
                print(f"Response: {e.response.text}")

    # Verify deletion (optional, should 404 now)
    try:
        response = requests.get(promo_url)  # Public access
        print(f"Public GET {promo_url} after delete - Status: {response.status_code}")
        assert response.status_code == 404
        print("[SUCCESS] Promotion correctly not found after deletion.")
    except Exception as e:
        print(f"[FAILURE] Promotion verification after delete failed: {e}")


# --- Main Execution ---
if __name__ == "__main__":
    run_tests()

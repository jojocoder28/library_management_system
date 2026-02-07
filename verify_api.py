import requests
import time

BASE_URL = "http://127.0.0.1:8003"

def wait_for_server():
    for _ in range(10):
        try:
            requests.get(BASE_URL)
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(1)
    return False

def test_api():
    if not wait_for_server():
        print("Server failed to start")
        return

    print("Server is up!")

    # 1. Register Admin
    timestamp = int(time.time()) + 100
    admin_email = f"admin_{timestamp}@example.com"
    admin_data = {
        "email": admin_email,
        "password": "adminpassword",
        "role": "admin"
    }
    response = requests.post(f"{BASE_URL}/users/", json=admin_data)
    if response.status_code == 200:
        print("Admin registered successfully")
    elif response.status_code == 400:
        print("Admin probably already exists")
    else:
        print(f"Failed to register admin: {response.text}")

    # 2. Login Admin
    login_data = {"username": admin_email, "password": "adminpassword"}
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        print("Admin logged in")
    else:
        print(f"Admin login failed: {response.text}")
        return

    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Create Publisher
    pub_data = {"name": f"O'Reilly {timestamp}"}
    response = requests.post(f"{BASE_URL}/publishers/", json=pub_data, headers=admin_headers)
    if response.status_code == 200:
        pub_id = response.json()["id"]
        print(f"Publisher created with ID: {pub_id}")
    else:
        print(f"Create publisher failed: {response.text}")
        pub_id = 1 

    # 4. Create Author
    auth_data = {"name": f"Guido {timestamp}"}
    response = requests.post(f"{BASE_URL}/authors/", json=auth_data, headers=admin_headers)
    if response.status_code == 200:
        auth_id = response.json()["id"]
        print(f"Author created with ID: {auth_id}")
    else:
        print(f"Create author failed: {response.text}")
        auth_id = 1

    # 5. Create Book
    book_data = {
        "isbn": f"978-3-16-{timestamp}",
        "title": "Python Tricks",
        "publisher_id": pub_id, 
        "publication_year": 2020,
        "author_ids": [auth_id]
    }
    response = requests.post(f"{BASE_URL}/books/", json=book_data, headers=admin_headers)
    if response.status_code == 200:
        book_id = response.json()["id"]
        print(f"Book created with ID: {book_id}")
    else:
        print(f"Create book failed: {response.text}")
        book_id = 1

    # 6. Create Copy
    copy_data = {
        "book_id": book_id,
        "shelf_location": "A-1",
        "status": "available"
    }
    response = requests.post(f"{BASE_URL}/copies/", json=copy_data, headers=admin_headers)
    if response.status_code == 200:
        copy_id = response.json()["id"]
        print(f"Copy created with ID: {copy_id}")
    else:
        print(f"Create copy failed: {response.text}")

    # 7. Register User
    user_email = f"user_{timestamp}@example.com"
    user_data = {
        "email": user_email,
        "password": "userpassword",
        "role": "member"
    }
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    if response.status_code == 200:
        print("User registered successfully")
    elif response.status_code == 400:
        print("User already exists")

    # 8. Login User
    login_data = {"username": user_email, "password": "userpassword"}
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code == 200:
        user_token = response.json()["access_token"]
        print("User logged in")
    else:
        print("User login failed")
        return

    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 9. Request Book
    req_data = {"book_id": book_id}
    response = requests.post(f"{BASE_URL}/requests/", json=req_data, headers=user_headers)
    if response.status_code == 200:
        req_id = response.json()["id"]
        print(f"Request created with ID: {req_id}")
    else:
        print(f"Request failed: {response.text}")

    # 10. Approve Request / Issue Book (Admin)
    # We need the user ID. Since we just created it, we can fetch 'me' or just assume.
    # Let's hit /users/me to be safe or just use the response from create if it returned ID.
    # The create_user endpoint returns UserRead which has ID. 
    # But we didn't capture it above. Let's fetch /users/me
    response = requests.get(f"{BASE_URL}/users/me", headers=user_headers)
    user_id = response.json()["id"]

    issue_data = {
        "copy_id": copy_id,
        "user_id": user_id, 
        "return_date": "2026-03-01T00:00:00"
    }
    response = requests.post(f"{BASE_URL}/issues/", json=issue_data, headers=admin_headers)
    if response.status_code == 200:
        issue_id = response.json()["id"]
        print(f"Book issued with ID: {issue_id}")
    else:
        print(f"Issue failed: {response.text}")
        return # Cannot return if issue failed

    # 11. Return Book (Admin)
    response = requests.post(f"{BASE_URL}/issues/{issue_id}/return", headers=admin_headers)
    if response.status_code == 200:
        print("Book returned successfully")
    else:
        print(f"Return failed: {response.text}")

if __name__ == "__main__":
    test_api()

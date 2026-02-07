from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.utils import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def create_debug_user():
    db = SessionLocal()
    try:
        user = User(
            email="debug@example.com",
            hashed_password=get_password_hash("password"),
            role=UserRole.ADMIN.value,
            is_active=True
        )
        db.add(user)
        db.commit()
        print("User created successfully")
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_debug_user()

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils import get_password_hash
import sys

def create_admin():
    db: Session = SessionLocal()
    try:
        email = "admin@library.com"
        password = "adminpassword123"
        
        existing_admin = db.query(User).filter(User.email == email).first()
        if existing_admin:
            print(f"Admin user {email} already exists.")
            return

        admin_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Successfully created admin user: {email} / {password}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()

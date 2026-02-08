# Library Management System (LMS)

A full-stack Library Management System built with **FastAPI** (Backend) and **React** (Frontend). This application allows users to browse books, borrow copies, and manage their account, while administrators can manage inventory and approve requests.

## 🚀 Features

### Backend (FastAPI)
- **MVC Architecture**: Clean separation of Models, Views (Schemas), and Controllers.
- **Authentication**: JWT-based auth with Role-Based Access Control (Admin vs User).
- **Database**: SQLite with SQLAlchemy ORM.
- **API Documentation**: Auto-generated Swagger UI (`/docs`).

### Frontend (React + Vite)
- **Modern UI**: Styled with **Tailwind CSS** for a responsive, industry-standard look.
- **Role-Based Dashboards**:
  - **User**: View catalog, request books, track active issues.
  - **Admin**: Approve requests, return books, manage inventory (Tabular View).
- **Security**: Protected routes (`/dashboard`, `/admin`) ensuring unauthorized users cannot access restricted pages.
- **Interactivity**: Real-time feedback with toast notifications (`react-hot-toast`).

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Uvicorn.
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router DOM, Lucide React.
- **Database**: SQLite (file-based).

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+ installed.
- Node.js & npm installed.

### 1. Backend Setup
1. Navigate to the root directory:
   ```bash
   cd "D:\Temp Work\LMS"
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart
   ```
4. Run the backend server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 🔑 Admin Credentials
To access the Admin Dashboard, use the following default credentials (created via `scripts/create_admin.py`):

- **Email**: `admin@library.com`
- **Password**: `adminpassword123`

## 📖 Usage Guide

1. **Guest**: Visit the Landing Page to see the available catalog features.
2. **Register**: Create a new account. You will be redirected to Login.
3. **Login**: Sign in with your credentials.
4. **User Dashboard**: 
   - Browse books in the "Catalog".
   - Click "Request" to borrow a book.
   - View your "My Books" tab to see borrowed items.
5. **Admin Dashboard**:
   - Login as Admin.
   - **Requests Tab**: Approve pending book requests.
   - **Issues Tab**: Return books when users bring them back.
   - **Inventory Tab**: View all books.

## 📂 Project Structure

```
LMS/
├── app/                    # Backend Source Code
│   ├── controllers/        # Business Logic
│   ├── models/             # Database Models
│   ├── routers/            # API Endpoints
│   ├── schemas/            # Pydantic Schemas
│   ├── database.py         # DB Connection
│   └── main.py             # App Entry Point
├── frontend/               # Frontend Source Code
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Views (Home, Login, Dashboards)
│   │   ├── services/       # API Integration
│   │   └── App.jsx         # Main React Component
│   └── tailwind.config.js  # Styling Config
├── scripts/                # Utility Scripts (create_admin.py)
├── requirements.txt        # Python Dependencies
└── README.md               # Project Documentation
```

## 🛡️ License
This project is open-source and available under the MIT License.

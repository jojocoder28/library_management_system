from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.book import (
    BookCreate, BookRead, 
    AuthorCreate, AuthorRead, 
    PublisherCreate, PublisherRead, 
    BookCopyCreate, BookCopyRead
)
from app.controllers.book import (
    create_publisher as create_publisher_ctrl,
    get_publishers as get_publishers_ctrl,
    create_author as create_author_ctrl,
    get_authors as get_authors_ctrl,
    create_book as create_book_ctrl,
    get_books as get_books_ctrl,
    get_book as get_book_ctrl,
    create_copy as create_copy_ctrl,
    get_all_copies as get_all_copies_ctrl
)
from app.dependencies import get_current_admin_user, get_current_active_user

router = APIRouter(
    tags=["Books"]
)

# --- Publishers ---
@router.post("/publishers/", response_model=PublisherRead, dependencies=[Depends(get_current_admin_user)])
def create_publisher(publisher: PublisherCreate, db: Session = Depends(get_db)):
    return create_publisher_ctrl(db, publisher)

@router.get("/publishers/", response_model=List[PublisherRead], dependencies=[Depends(get_current_active_user)])
def read_publishers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_publishers_ctrl(db, skip, limit)

# --- Authors ---
@router.post("/authors/", response_model=AuthorRead, dependencies=[Depends(get_current_admin_user)])
def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    return create_author_ctrl(db, author)

@router.get("/authors/", response_model=List[AuthorRead], dependencies=[Depends(get_current_active_user)])
def read_authors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_authors_ctrl(db, skip, limit)

# --- Books ---
@router.post("/books/", response_model=BookRead, dependencies=[Depends(get_current_admin_user)])
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    return create_book_ctrl(db, book)

@router.get("/books/", response_model=List[BookRead], dependencies=[Depends(get_current_active_user)])
def read_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_books_ctrl(db, skip, limit)

@router.get("/books/{book_id}", response_model=BookRead, dependencies=[Depends(get_current_active_user)])
def read_book(book_id: int, db: Session = Depends(get_db)):
    return get_book_ctrl(db, book_id)

# --- Copies ---
@router.post("/copies/", response_model=BookCopyRead, dependencies=[Depends(get_current_admin_user)])
def create_copy(copy: BookCopyCreate, db: Session = Depends(get_db)):
    return create_copy_ctrl(db, copy)

@router.get("/copies/", response_model=List[BookCopyRead], dependencies=[Depends(get_current_active_user)])
def read_all_copies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_copies_ctrl(db, skip, limit)

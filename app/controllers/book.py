from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.book import Book, Author, Publisher, BookCopy, BookCopyStatus
from app.schemas.book import BookCreate, AuthorCreate, PublisherCreate, BookCopyCreate
import logging

logger = logging.getLogger("app")

# --- Publisher ---
def create_publisher(db: Session, publisher: PublisherCreate):
    db_publisher = Publisher(name=publisher.name)
    db.add(db_publisher)
    db.commit()
    db.refresh(db_publisher)
    logger.info(f"Publisher created: {db_publisher.name}")
    return db_publisher

def get_publishers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Publisher).offset(skip).limit(limit).all()

# --- Author ---
def create_author(db: Session, author: AuthorCreate):
    db_author = Author(name=author.name)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    logger.info(f"Author created: {db_author.name}")
    return db_author

def get_authors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Author).offset(skip).limit(limit).all()

# --- Book ---
def create_book(db: Session, book: BookCreate):
    db_book = Book(
        isbn=book.isbn,
        title=book.title,
        publication_year=book.publication_year,
        publisher_id=book.publisher_id
    )
    # Handle authors (many-to-many)
    if book.author_ids:
        authors = db.query(Author).filter(Author.id.in_(book.author_ids)).all()
        if len(authors) != len(book.author_ids):
             logger.error(f"Book creation failed: One or more authors not found for IDs {book.author_ids}")
             raise HTTPException(status_code=400, detail="One or more authors not found")
        db_book.authors = authors

    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    logger.info(f"Book created: {db_book.title} (ISBN: {db_book.isbn})")
    return db_book

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Book).offset(skip).limit(limit).all()

def get_book(db: Session, book_id: int):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# --- Copy ---
def create_copy(db: Session, copy: BookCopyCreate):
    db_copy = BookCopy(
        book_id=copy.book_id,
        shelf_location=copy.shelf_location,
        status=copy.status
    )
    db.add(db_copy)
    db.commit()
    db.refresh(db_copy)
    return db_copy

def get_all_copies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BookCopy).offset(skip).limit(limit).all()

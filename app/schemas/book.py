from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.book import BookCopyStatus

# --- Publisher ---
class PublisherBase(BaseModel):
    name: str

class PublisherCreate(PublisherBase):
    pass

class PublisherRead(PublisherBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Author ---
class AuthorBase(BaseModel):
    name: str

class AuthorCreate(AuthorBase):
    pass

class AuthorRead(AuthorBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Book ---
class BookBase(BaseModel):
    isbn: str
    title: str
    publication_year: Optional[int] = None
    publisher_id: int

class BookCreate(BookBase):
    author_ids: List[int] = []

class BookRead(BookBase):
    id: int
    publisher: Optional[PublisherRead] = None
    authors: List[AuthorRead] = []
    
    class Config:
        from_attributes = True

# --- BookCopy ---
class BookCopyBase(BaseModel):
    book_id: int
    shelf_location: Optional[str] = None
    status: BookCopyStatus = BookCopyStatus.AVAILABLE

class BookCopyCreate(BookCopyBase):
    pass

class BookCopyRead(BookCopyBase):
    id: int
    created_at: datetime
    book: BookRead
    
    class Config:
        from_attributes = True

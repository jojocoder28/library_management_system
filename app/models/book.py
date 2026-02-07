from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

# Association Table for Many-to-Many between Book and Author
book_authors = Table(
    "book_authors",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.id"), primary_key=True),
    Column("author_id", Integer, ForeignKey("authors.id"), primary_key=True),
)

class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    books = relationship("Book", back_populates="publisher")

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)

    books = relationship("Book", secondary=book_authors, back_populates="authors")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    publication_year = Column(Integer)
    publisher_id = Column(Integer, ForeignKey("publishers.id"))

    publisher = relationship("Publisher", back_populates="books")
    authors = relationship("Author", secondary=book_authors, back_populates="books")
    copies = relationship("BookCopy", back_populates="book")
    requests = relationship("app.models.transaction.IssueRequest", back_populates="book")

class BookCopyStatus(str, enum.Enum):
    AVAILABLE = "available"
    ISSUED = "issued"
    MAINTENANCE = "maintenance"
    LOST = "lost"

class BookCopy(Base):
    __tablename__ = "book_copies"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    status = Column(String, default=BookCopyStatus.AVAILABLE.value)
    shelf_location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="copies")
    issues = relationship("app.models.transaction.Issue", back_populates="copy")

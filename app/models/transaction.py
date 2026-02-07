from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class IssueStatus(str, enum.Enum):
    ISSUED = "issued"
    RETURNED = "returned"
    OVERDUE = "overdue"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FULFILLED = "fulfilled"

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    copy_id = Column(Integer, ForeignKey("book_copies.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime)
    actual_return_date = Column(DateTime, nullable=True) # Good to track when it was actually returned
    status = Column(String, default=IssueStatus.ISSUED.value) # Using String for SQLite compatibility
    fine_amount = Column(Float, default=0.0)

    user = relationship("app.models.user.User", back_populates="issues")
    book_copy = relationship("app.models.book.BookCopy", back_populates="issues")

class IssueRequest(Base):
    __tablename__ = "issue_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    status = Column(String, default=RequestStatus.PENDING.value)
    request_time = Column(DateTime, default=datetime.utcnow)

    user = relationship("app.models.user.User", back_populates="requests")
    book = relationship("app.models.book.Book", back_populates="requests")

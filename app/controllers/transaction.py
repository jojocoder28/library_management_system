from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.transaction import Issue, IssueRequest, IssueStatus, RequestStatus
from app.models.book import BookCopy, BookCopyStatus
from app.schemas.transaction import IssueCreate, IssueRequestCreate, IssueRequestUpdate
from app.models.user import User
import logging

logger = logging.getLogger("app")

# --- Issue Requests ---
def create_request(db: Session, request: IssueRequestCreate, current_user: User):
    # Check if user already has a pending request for this book
    existing = db.query(IssueRequest).filter(
        IssueRequest.user_id == current_user.id,
        IssueRequest.book_id == request.book_id,
        IssueRequest.status == RequestStatus.PENDING
    ).first()
    if existing:
        logger.warning(f"Duplicate request: User {current_user.id} for Book {request.book_id}")
        raise HTTPException(status_code=400, detail="You already have a pending request for this book")

    db_request = IssueRequest(
        user_id=current_user.id,
        book_id=request.book_id,
        status=RequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    logger.info(f"Issue Request created: User {current_user.id} requested Book {request.book_id}")
    return db_request

def get_requests(db: Session, current_user: User, skip: int = 0, limit: int = 100):
    if current_user.role == "admin":
        return db.query(IssueRequest).offset(skip).limit(limit).all()
    else:
        return db.query(IssueRequest).filter(IssueRequest.user_id == current_user.id).offset(skip).limit(limit).all()

def update_request_status(db: Session, request_id: int, status_update: IssueRequestUpdate):
    db_request = db.query(IssueRequest).filter(IssueRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db_request.status = status_update.status
    db.commit()
    db.refresh(db_request)
    logger.info(f"Request {request_id} updated to {status_update.status}")
    return db_request

# --- Issues ---
def create_issue(db: Session, issue: IssueCreate):
    # Verify copy availability
    copy = db.query(BookCopy).filter(BookCopy.id == issue.copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    if copy.status != BookCopyStatus.AVAILABLE:
        logger.warning(f"Issue failed: Copy {issue.copy_id} is not available")
        raise HTTPException(status_code=400, detail="Book copy is not available")

    # Create Issue
    db_issue = Issue(
        user_id=issue.user_id,
        copy_id=issue.copy_id,
        return_date=issue.return_date,
        status=IssueStatus.ISSUED
    )
    
    # Update Copy Status
    copy.status = BookCopyStatus.ISSUED
    
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    logger.info(f"Book Issued: Copy {issue.copy_id} to User {issue.user_id}")
    return db_issue

def get_issues(db: Session, current_user: User, skip: int = 0, limit: int = 100):
    if current_user.role == "admin":
        return db.query(Issue).offset(skip).limit(limit).all()
    else:
        return db.query(Issue).filter(Issue.user_id == current_user.id).offset(skip).limit(limit).all()

def return_book(db: Session, issue_id: int):
    db_issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue record not found")
    
    if db_issue.status == IssueStatus.RETURNED:
         raise HTTPException(status_code=400, detail="Book already returned")

    # Update Issue
    db_issue.status = IssueStatus.RETURNED
    db_issue.actual_return_date = datetime.utcnow()
    
    # Calculate Fine (Simple Logic: 10 units per day overdue)
    if db_issue.return_date and db_issue.actual_return_date > db_issue.return_date:
        overdue_duration = db_issue.actual_return_date - db_issue.return_date
        db_issue.fine_amount = overdue_duration.days * 10.0
    
    # Update Copy Status
    copy = db.query(BookCopy).filter(BookCopy.id == db_issue.copy_id).first()
    if copy:
        copy.status = BookCopyStatus.AVAILABLE

    db.commit()
    db.refresh(db_issue)
    return db_issue

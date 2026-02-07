from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.transaction import (
    IssueCreate, IssueRead, IssueUpdate,
    IssueRequestCreate, IssueRequestRead, IssueRequestUpdate
)
from app.controllers.transaction import (
    create_request as create_request_ctrl,
    get_requests as get_requests_ctrl,
    update_request_status as update_request_status_ctrl,
    create_issue as create_issue_ctrl,
    get_issues as get_issues_ctrl,
    return_book as return_book_ctrl
)
from app.dependencies import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter(
    tags=["Transactions"]
)

# --- Issue Requests ---
@router.post("/requests/", response_model=IssueRequestRead)
def create_request(
    request: IssueRequestCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    return create_request_ctrl(db, request, current_user)

@router.get("/requests/", response_model=List[IssueRequestRead])
def read_requests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_requests_ctrl(db, current_user, skip, limit)

@router.put("/requests/{request_id}", response_model=IssueRequestRead, dependencies=[Depends(get_current_admin_user)])
def update_request_status(request_id: int, status_update: IssueRequestUpdate, db: Session = Depends(get_db)):
    return update_request_status_ctrl(db, request_id, status_update)

# --- Issues ---
@router.post("/issues/", response_model=IssueRead, dependencies=[Depends(get_current_admin_user)])
def create_issue(issue: IssueCreate, db: Session = Depends(get_db)):
    return create_issue_ctrl(db, issue)

@router.get("/issues/", response_model=List[IssueRead])
def read_issues(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_issues_ctrl(db, current_user, skip, limit)

@router.post("/issues/{issue_id}/return", response_model=IssueRead, dependencies=[Depends(get_current_admin_user)])
def return_book(issue_id: int, db: Session = Depends(get_db)):
    return return_book_ctrl(db, issue_id)

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.transaction import IssueStatus, RequestStatus
from app.schemas.book import BookCopyRead, BookRead
from app.schemas.user import UserRead

# --- Issue Request ---
class IssueRequestBase(BaseModel):
    book_id: int

class IssueRequestCreate(IssueRequestBase):
    pass

class IssueRequestUpdate(BaseModel):
    status: RequestStatus

class IssueRequestRead(IssueRequestBase):
    id: int
    user_id: int
    status: RequestStatus
    request_time: datetime
    book: BookRead
    user: UserRead

    class Config:
        from_attributes = True

# --- Issue ---
class IssueBase(BaseModel):
    copy_id: int
    user_id: int
    return_date: Optional[datetime] = None

class IssueCreate(IssueBase):
    pass # status is default ISSUED

class IssueUpdate(BaseModel):
    status: Optional[IssueStatus] = None
    actual_return_date: Optional[datetime] = None
    fine_amount: Optional[float] = None

class IssueRead(IssueBase):
    id: int
    issue_date: datetime
    actual_return_date: Optional[datetime] = None
    status: IssueStatus
    fine_amount: float
    copy: BookCopyRead
    user: UserRead

    class Config:
        from_attributes = True

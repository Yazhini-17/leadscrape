from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional["UserOut"] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


Token.model_rebuild()

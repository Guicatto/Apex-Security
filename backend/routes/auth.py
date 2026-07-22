from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from services.auth import hash_password, verify_password, create_access_token, get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter()


class SignupPayload(BaseModel):
    email: EmailStr
    password: str
    company_name: str


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


@router.post("/auth/signup", status_code=201)
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ja cadastrado")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        company_name=payload.company_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "api_key": user.api_key,
        "company_name": user.company_name
    }


@router.post("/auth/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "api_key": user.api_key,
        "company_name": user.company_name
    }


@router.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "company_name": current_user.company_name,
        "api_key": current_user.api_key
    }

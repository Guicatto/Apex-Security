from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_sender import send_contact_email

router = APIRouter()


class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
def submit_contact(payload: ContactPayload):
    """Contato aberto — nao exige autenticacao (visitantes tambem podem usar)."""
    try:
        send_contact_email(payload.name, payload.email, payload.subject, payload.message)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao enviar mensagem: {e}")
    return {"message": "Mensagem enviada com sucesso"}

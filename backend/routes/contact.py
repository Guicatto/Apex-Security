from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_sender import send_contact_email
import logging

logger = logging.getLogger("apex.contact")

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
    except EnvironmentError as e:
        logger.error(f"Configuracao ausente: {e}")
        raise HTTPException(status_code=503, detail="Servico de email nao configurado no servidor")
    except RuntimeError as e:
        logger.error(f"Erro ao enviar via Resend: {e}")
        raise HTTPException(status_code=502, detail="Falha ao enviar a mensagem. Tente novamente em instantes.")
    return {"message": "Mensagem enviada com sucesso"}

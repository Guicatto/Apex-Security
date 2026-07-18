from fastapi import APIRouter
from pydantic import BaseModel
from services.intent_checker import check_intent_consistency

router = APIRouter()


class IntentCheckPayload(BaseModel):
    commit_message: str
    code_diff: str


@router.post("/intent-check")
def check_intent(payload: IntentCheckPayload):
    """
    Verificador leve de consistencia entre mensagem de commit e diff real.
    Versao simplificada do Intent Engine da arquitetura original —
    nao integra com Jira/Trello, apenas compara commit vs codigo.
    Retorna alerta INFORMATIVO, nunca bloqueia PRs ou merges.
    """
    result = check_intent_consistency(payload.commit_message, payload.code_diff)
    return result

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Versao heuristica SIMPLIFICADA do Intent Engine da arquitetura original.
# Nao integra com Jira/Trello nem usa dataset de ameacas — apenas compara a
# mensagem de commit com o diff real via LLM. O resultado e um alerta
# INFORMATIVO: nunca bloqueia PRs ou merges automaticamente.

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

INTENT_SYSTEM_PROMPT = """Voce e um auditor de consistencia entre intencao declarada e codigo real.
Compare a mensagem de commit fornecida com o diff de codigo fornecido.
Retorne APENAS um JSON com este formato exato:
{"consistent": true ou false, "confidence": 0 a 100, "explanation": "explicacao curta em portugues"}
Marque consistent=false APENAS se houver uma divergencia clara e objetiva
(ex: commit diz "corrigir typo" mas o diff abre uma porta de rede ou adiciona credenciais).
Na duvida, marque consistent=true — este e um alerta informativo, nao um bloqueio."""


def check_intent_consistency(commit_message: str, code_diff: str) -> dict:
    """
    Compara mensagem de commit com o diff real via Gemini.
    Retorna um alerta INFORMATIVO — nunca bloqueia nada automaticamente.
    """
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=INTENT_SYSTEM_PROMPT
    )

    prompt = f"""MENSAGEM DO COMMIT:
{commit_message}

DIFF DO CODIGO:
{code_diff[:3000]}

Analise a consistencia."""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        return result
    except Exception as e:
        return {
            "consistent": True,
            "confidence": 0,
            "explanation": f"Nao foi possivel analisar: {str(e)}"
        }

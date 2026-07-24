import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Cliente centralizado do Gemini com fallback entre multiplas chaves.
# O free tier tem limite diario por chave; quando uma estoura a cota, a proxima
# assume automaticamente. Configure GEMINI_API_KEY, GEMINI_API_KEY_2, _3...


def _load_api_keys() -> list:
    """Carrega todas as chaves configuradas: GEMINI_API_KEY, GEMINI_API_KEY_2, _3..."""
    keys = []
    primary = os.getenv("GEMINI_API_KEY")
    if primary:
        keys.append(primary)

    i = 2
    while True:
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if not key:
            break
        keys.append(key)
        i += 1

    if not keys:
        raise EnvironmentError("Nenhuma GEMINI_API_KEY configurada")
    return keys


_API_KEYS = _load_api_keys()
_current_key_index = 0


def available_keys() -> int:
    """Quantidade de chaves configuradas — util para diagnostico."""
    return len(_API_KEYS)


def generate_with_fallback(model_name: str, system_instruction: str, prompt: str, max_retries: int = None):
    """
    Tenta gerar conteudo com a chave atual. Se receber erro de quota/rate limit,
    tenta automaticamente a proxima chave disponivel, em ordem circular.
    Erros que nao sao de cota sao propagados imediatamente (nao adianta trocar de chave).
    """
    global _current_key_index
    max_retries = max_retries or len(_API_KEYS)
    last_error = None

    for attempt in range(max_retries):
        key_index = (_current_key_index + attempt) % len(_API_KEYS)
        try:
            genai.configure(api_key=_API_KEYS[key_index])
            model = genai.GenerativeModel(model_name=model_name, system_instruction=system_instruction)
            response = model.generate_content(prompt)
            _current_key_index = key_index  # fixa a chave que funcionou como preferida
            return response
        except Exception as e:
            error_str = str(e).lower()
            is_quota_error = (
                "quota" in error_str
                or "429" in error_str
                or "resource" in error_str and "exhausted" in error_str
                or "rate limit" in error_str
            )
            last_error = e
            if is_quota_error:
                continue  # tenta a proxima chave
            else:
                raise  # erro que nao e de quota, propaga imediatamente

    raise RuntimeError(
        f"Todas as {len(_API_KEYS)} chaves do Gemini atingiram o limite. Ultimo erro: {last_error}"
    )

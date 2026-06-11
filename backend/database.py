from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:SUA_SENHA@localhost:5432/apex_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    # Marcadores ASCII em vez de emoji: o console do Windows (cp1252) não
    # imprime ✅/❌ e o UnicodeEncodeError derrubava o startup do uvicorn.
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Banco de dados conectado com sucesso")
        return True
    except Exception as e:
        print(f"[ERRO] Erro ao conectar ao banco: {e}")
        return False

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS = os.getenv("CONTACT_GMAIL_ADDRESS", "apexsecurityofficial@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("CONTACT_GMAIL_APP_PASSWORD")


def send_contact_email(sender_name: str, sender_email: str, subject: str, message: str) -> bool:
    if not GMAIL_APP_PASSWORD:
        raise EnvironmentError("CONTACT_GMAIL_APP_PASSWORD nao configurada")

    msg = MIMEMultipart()
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = GMAIL_ADDRESS
    msg["Reply-To"] = sender_email
    msg["Subject"] = f"[Apex Security - Contato] {subject}"

    body = f"""Nova mensagem de contato recebida pelo site:

Nome: {sender_name}
Email: {sender_email}
Assunto: {subject}

Mensagem:
{message}
"""
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.send_message(msg)

    return True

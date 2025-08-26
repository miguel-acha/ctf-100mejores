import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "5000"))

    # Si defines PUBLIC_BASE_URL, se usará SIEMPRE para el QR.
    # Si NO la defines:
    #   - Si la app es accedida por un dominio ngrok (host termina en .ngrok-free.app o .ngrok.app),
    #     se usará automáticamente ese dominio público.
    #   - En otros casos, se usa request.host_url como hasta ahora.
    PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", None)

    # Opcional: por si tu cuenta de ngrok usa otro dominio corporativo (p.ej. *.trycloudflare.com)
    NGROK_DOMAIN_SUFFIXES = [
        s.strip() for s in os.getenv(
            "NGROK_DOMAIN_SUFFIXES",
            ".ngrok-free.app,.ngrok.app"
        ).split(",") if s.strip()
    ]

    # Contenido didáctico
    WHATSAPP_PHONE = os.getenv("WHATSAPP_PHONE", "59174184075")
    WHATSAPP_MSG = os.getenv(
        "WHATSAPP_MSG",
        "Hola, soy de los 100 mejores y quiero saber mas sobre la carrera."
    )
    STAGE1_PLAINTEXT = os.getenv("STAGE1_PLAINTEXT", "BIENVENIDO A LA UPB")
    STAGE2_ANSWER = os.getenv("STAGE2_ANSWER", "101")
    STAGE2_IMAGE = os.getenv("STAGE2_IMAGE", "secret.png")

import io
import qrcode
from urllib.parse import urlunsplit

from flask import (
    Blueprint, current_app, render_template, request, jsonify, session,
    redirect, url_for, send_file
)
from .security import normalize_text, sha256_hex, caesar_shift

bp = Blueprint("mejores100", __name__, template_folder="../templates", static_folder="../static")

# --- Inicialización controlada (Flask 3) ---
_inited = False
def _ensure_inited():
    global _inited
    if _inited:
        return
    _inited = True

@bp.before_app_request
def _init_on_first_request():
    _ensure_inited()

# Exponer flag de sesión a plantillas
@bp.app_context_processor
def inject_flags():
    return {"stage1_ok": bool(session.get("stage1_ok"))}

def _stage_hashes():
    s1_plain = current_app.config["STAGE1_PLAINTEXT"]
    s2_plain = current_app.config["STAGE2_ANSWER"]
    return sha256_hex(normalize_text(s1_plain)), sha256_hex(normalize_text(s2_plain))

# --------- Utilidad: resolver la BASE URL pública (ngrok-friendly) ----------
def _resolve_public_base():
    """
    Regla de resolución:
    1) Si PUBLIC_BASE_URL está definida en .env → usarla (normalizada con / al final).
    2) Si la petición viene a través de un túnel / proxy:
       - Usar X-Forwarded-Proto y X-Forwarded-Host si existen.
       - En su defecto, si Host termina con sufijos de ngrok (config), usar ese host + esquema.
    3) Fallback: request.host_url (comportamiento tradicional).
    """
    # 1) .env fija
    fixed = current_app.config.get("PUBLIC_BASE_URL")
    if fixed:
        base = fixed.strip()
        if not base.endswith("/"):
            base += "/"
        return base

    # 2) Encabezados de proxy (ngrok los envía)
    xf_proto = request.headers.get("X-Forwarded-Proto")
    xf_host = request.headers.get("X-Forwarded-Host") or request.headers.get("Host")
    if xf_proto and xf_host:
        base = urlunsplit((xf_proto, xf_host, "/", "", ""))
        return base

    # 2b) Host con sufijo de ngrok
    host = request.headers.get("Host", "")
    scheme = request.headers.get("X-Forwarded-Proto") or request.scheme or "http"
    for suffix in current_app.config.get("NGROK_DOMAIN_SUFFIXES", []):
        if host.endswith(suffix):
            base = urlunsplit((scheme, host, "/", "", ""))
            return base

    # 3) Fallback
    return request.host_url

# -------------------- Rutas --------------------

@bp.get("/")
def index():
    _ensure_inited()
    # Cifrado en ROT17; el usuario debe mover el slider a 17 para ver el claro
    s1_plain = current_app.config["STAGE1_PLAINTEXT"]
    encoded = caesar_shift(s1_plain, 17)  # ROT17
    return render_template("stage1.html", encoded_text=encoded)

@bp.post("/api/check1")
def api_check1():
    _ensure_inited()
    guess = normalize_text((request.json or {}).get("guess", ""))
    stage1_hash, _ = _stage_hashes()
    ok = sha256_hex(guess) == stage1_hash
    if ok:
        session["stage1_ok"] = True
    return jsonify({"ok": ok})

@bp.get("/stage2")
def stage2():
    _ensure_inited()
    if not session.get("stage1_ok"):
        return redirect(url_for("mejores100.index"))
    img_name = current_app.config["STAGE2_IMAGE"]
    return render_template("stage2.html", image_name=img_name)

@bp.post("/api/check2")
def api_check2():
    _ensure_inited()
    if not session.get("stage1_ok"):
        return jsonify({"ok": False}), 403
    guess = normalize_text((request.json or {}).get("guess", ""))
    _, stage2_hash = _stage_hashes()
    ok = sha256_hex(guess) == stage2_hash
    if ok:
        from urllib.parse import quote
        phone = current_app.config["WHATSAPP_PHONE"]
        text = current_app.config["WHATSAPP_MSG"]
        wa = f"https://wa.me/{phone}?text={quote(text)}"
        return jsonify({"ok": True, "wa": wa})
    return jsonify({"ok": False})

@bp.get("/qr")
def qr_page():
    # Para info visual en la página, también mostramos la base resuelta
    public_base = _resolve_public_base()
    return render_template("qr.html", public_base=public_base)

@bp.get("/qr.png")
def qr_img():
    """
    Genera un QR que apunta a la URL pública resuelta dinámicamente.
    Soporta:
      - PUBLIC_BASE_URL en .env
      - X-Forwarded-* (ngrok)
      - Host con sufijo de ngrok
      - fallback a request.host_url
    """
    base = _resolve_public_base()
    # Aseguramos / final
    if not base.endswith("/"):
        base += "/"
    target_url = base  # cambia a base + "stage2" si quisieras apuntar directo al reto 2

    buf = io.BytesIO()
    img = qrcode.make(target_url)
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")

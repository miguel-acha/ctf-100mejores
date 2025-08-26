import re, unicodedata, hashlib

def normalize_text(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.upper()
    s = re.sub(r"[^A-Z0-9\\s]", " ", s)
    s = re.sub(r"\\s+", " ", s).strip()
    return s

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def caesar_shift(text: str, k: int) -> str:
    """Cifrado César/ROT sobre A–Z, respeta otros caracteres (espacios, dígitos)."""
    out = []
    k = k % 26
    for ch in text.upper():
        if 'A' <= ch <= 'Z':
            out.append(chr(((ord(ch) - 65 + k) % 26) + 65))
        else:
            out.append(ch)
    return "".join(out)

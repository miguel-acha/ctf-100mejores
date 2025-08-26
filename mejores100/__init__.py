import os
from flask import Flask
from dotenv import load_dotenv
from .config import Config
from .routes import bp

def create_app():
    load_dotenv()
    app = Flask(__name__, instance_relative_config=True, static_folder=None)
    app.config.from_object(Config())
    os.makedirs(app.instance_path, exist_ok=True)
    app.register_blueprint(bp)
    return app

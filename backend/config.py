"""
Configuration loader for environment variables

Loads variables from .env
Exposes them as Python variables
Keeps secrets out of source code

"""


import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
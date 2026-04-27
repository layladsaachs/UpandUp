"""
Configuration loader for environment variables

Loads variables from .env
Keeps secrets out of source code

"""


import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")
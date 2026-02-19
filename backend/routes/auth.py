from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from config import SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI
from urllib.parse import urlencode


router = APIRouter()

@router.get("/login")
def login():
    print("CLIENT ID:", SPOTIFY_CLIENT_ID)
    print("REDIRECT URI:", SPOTIFY_REDIRECT_URI)

    auth_url = "https://accounts.spotify.com/authorize"

    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": "user-read-email playlist-read-private"
    }

    url = f"{auth_url}?{urlencode(params)}"

    return RedirectResponse(url)
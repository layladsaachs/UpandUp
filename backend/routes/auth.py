'''

Authentication routes for Spotify OAuth

Redirecting users to Spotify login
Receiving authorization codes
Exchanging codes for access tokens
Making authenticated requests to Spotify APIs

Implements the OAuth 2.0 Authorization Code Flow

'''


from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from config import SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI
from urllib.parse import urlencode


router = APIRouter()

@router.get("/login")
def login():

   # Initiates the Spotify OAuth flow.

   # Redirects the user to Spotify's authorization page
   # where they can grant access to this application

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

import requests
from config import SPOTIFY_CLIENT_SECRET

@router.get("/callback")
def callback(code: str):

    """
    Handles Spotify redirect after user authorization

     Receives authorization code from Spotify
     Exchanges code for access token
     Uses access token to fetch authenticated user profile
     Returns user profile JSON

    """

    token_url = "https://accounts.spotify.com/api/token"

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET
    }

    # Exchange authorization code for access token
    token_response = requests.post(token_url, data=payload)
    token_data = token_response.json()

    # Extract access token from Spotify response
    access_token = token_data.get("access_token")

    # Use access token to fetch the authenticated users profile
    user_url = "https://api.spotify.com/v1/me"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    user_response = requests.get(user_url, headers=headers)
    user_data = user_response.json()

    return user_data
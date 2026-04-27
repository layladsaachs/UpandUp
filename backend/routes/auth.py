'''

Authentication routes for Spotify OAuth

Redirecting users to Spotify login
Receiving authorization codes
Exchanging codes for access tokens
Making authenticated requests to Spotify APIs

Implements the OAuth Authorization Code Flow

'''


from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode

from config import (
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
    TICKETMASTER_API_KEY
)

access_token_storage = {}

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
        "scope": "user-read-email playlist-read-private user-library-read user-follow-read streaming user-modify-playback-state user-read-playback-state user-top-read user-read-recently-played",
        "show_dialog": "true"
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

    access_token_storage["access_token"] = access_token

    return {"message": "Login successful. Token stored."}

    # Use access token to fetch the authenticated users profile
    user_url = "https://api.spotify.com/v1/me"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    user_response = requests.get(user_url, headers=headers)
    user_data = user_response.json()

    return user_data

@router.get("/me")
def get_user_profile():
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return {"error": "User not authenticated"}

    user_url = "https://api.spotify.com/v1/me"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    user_response = requests.get(user_url, headers=headers)

    return user_response.json()

@router.get("/playlists")
def get_user_playlists():
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return {"error": "User not authenitcated"}

    playlists_url = "https://api.spotify.com/v1/me/playlists"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    playlists_response = requests.get(playlists_url, headers=headers)
    playlists_data = playlists_response.json()

    simplified_playlists = []

    for playlist in playlists_data.get("items", []):
        images = playlist.get("images", [])

        simplified_playlists.append({
            "name": playlist.get("name"),
            "id": playlist.get("id"),
            "tracks_total": playlist.get("tracks", {}).get("total, 0"),
            "image": images[0]["url"] if images else None

        })

    return simplified_playlists

@router.get("/search")
def user_search(q: str):
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return {"error": "User not authenitcated"}

    search_url= "https://api.spotify.com/v1/search"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "q": q,
        "type": "track,artist,album",
        "limit": 10
    }

    response = requests.get(search_url, headers=headers, params=params)
    data = response.json()

    # tracks
    tracks = []
    for item in data.get("tracks", {}).get("items", []):
        images = item.get("album", {}).get("images", [])
        tracks.append({
            "name": item.get("name"),
            "artist": item.get("artists")[0]["name"],
            "album": item.get("album")["name"],
            "image": images[0]["url"] if images else None,
            "duration": item.get("duration_ms") // 1000,
            "uri": item.get("uri")
        })

    # artists
    artists = []
    for item in data.get("artists", {}).get("items", []):
        images = item.get("images", [])
        artists.append({
            "name" : item.get("name"),
            "image" : images[0]["url"] if images else None
        })

    # albums
    albums = []
    for item in data.get("albums", {}).get("items", []):
        images = item.get("images", [])
        albums.append({
            "name" : item.get("name"),
            "artist" : item.get("artists")[0]["name"],
            "image" : images[0]["url"] if images else None
        })

    return {
        "tracks" : tracks,
        "artists" : artists,
        "albums" : albums,
    }

@router.get("/albums")
def get_user_albums():
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return {"error": "User not authenticated"}

    url = "https://api.spotify.com/v1/me/albums"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    res = requests.get(url, headers=headers)
    data = res.json()

    results = []

    for item in data.get("items", []):
        album = item.get("album")
        results.append({
            "name": album.get("name"),
            "artist": album.get("artists")[0]["name"],
            "image": album.get("images")[0]["url"] if album.get("images") else None
        })

    return results


@router.get("/artists")
def get_user_artists():
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return {"error": "User not authenticated"}

    url = "https://api.spotify.com/v1/me/following?type=artist"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    res = requests.get(url, headers=headers)
    data = res.json()

    results = []

    for artist in data.get("artists", {}).get("items", []):
        results.append({
            "name": artist.get("name"),
            "image": artist.get("images")[0]["url"] if artist.get("images") else None
        })

    return results

@router.get("/token")
def get_token():
    access_token = access_token_storage.get("access_token")
    
    if not access_token:
        return {"error": "User not authenticated"}

    return {"access_token": access_token}

#
# recently played
#
@router.get("/recent")
def get_recent():
 access_token = access_token_storage.get("access_token")
 if not access_token:
  return []

 url = "https://api.spotify.com/v1/me/player/recently-played"
 headers = {"Authorization": f"Bearer {access_token}"}

 res = requests.get(url, headers=headers)
 data = res.json()

 results = []
 for item in data.get("items", []):
  track = item.get("track")
  images = track.get("album", {}).get("images", [])

  results.append({
   "name": track.get("name"),
   "artist": track.get("artists")[0]["name"],
   "image": images[0]["url"] if images else None,
   "preview": track.get("preview_url"),
   "duration": track.get("duration_ms") // 1000
  })

 return results

#
# popular
#
@router.get("/top")
def get_top_tracks():
 access_token = access_token_storage.get("access_token")
 if not access_token:
  return []

 url = "https://api.spotify.com/v1/me/top/tracks"
 headers = {"Authorization": f"Bearer {access_token}"}

 res = requests.get(url, headers=headers)
 data = res.json()

 results = []
 for track in data.get("items", []):
  images = track.get("album", {}).get("images", [])

  results.append({
   "name": track.get("name"),
   "artist": track.get("artists")[0]["name"],
   "image": images[0]["url"] if images else None,
   "preview": track.get("preview_url"),
   "duration": track.get("duration_ms") // 1000
  })

 return results

#
# favorite songs
#
@router.get("/favorites")
def get_favorites():
 access_token = access_token_storage.get("access_token")
 if not access_token:
  return []

 url = "https://api.spotify.com/v1/me/tracks"
 headers = {"Authorization": f"Bearer {access_token}"}

 res = requests.get(url, headers=headers)
 data = res.json()

 results = []
 for item in data.get("items", []):
  track = item.get("track")
  images = track.get("album", {}).get("images", [])

  results.append({
   "name": track.get("name"),
   "artist": track.get("artists")[0]["name"],
   "image": images[0]["url"] if images else None,
   "preview": track.get("preview_url"),
   "duration": track.get("duration_ms") // 1000
  })

 return results

#
# artist profile - top
#
@router.get("/artist-top")
def get_artist_top(name: str):
    access_token = access_token_storage.get("access_token")
    if not access_token:
        return []

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    search_url = "https://api.spotify.com/v1/search"
    params = {
        "q": f"artist:{name.strip()}",
        "type": "track",
        "limit": 10
    }

    search_res = requests.get(search_url, headers=headers, params=params)
    search_data = search_res.json()

    results = []

    for track in search_data.get("tracks", {}).get("items", []):
        images = track.get("album", {}).get("images", [])

        results.append({
            "name": track.get("name"),
            "artist": track.get("artists")[0]["name"],
            "image": images[0]["url"] if images else None,
            "preview": track.get("preview_url"),
            "duration": track.get("duration_ms") // 1000
        })

    return results


##############################################################
#                                                            #
#                                                            #
#                                                            #
#                       Ticketmaster                         #
#                                                            #
#                                                            #
#                                                            #       
##############################################################

#
# pull random events
#
@router.get("/events/random")
def get_random_events():
    url = "https://app.ticketmaster.com/discovery/v2/events.json"

    params = {
        "apikey": TICKETMASTER_API_KEY,
        "size": 8,
        "classificationName": "music",
        "keyword": "EDM"
    }

    res = requests.get(url, params=params)
    data = res.json()

    events = []

    for event in data.get("_embedded", {}).get("events", []):
        images = event.get("images", [])

        events.append({
            "name": event.get("name"),
            "date": event.get("dates", {}).get("start", {}).get("localDate"),
            "time": event.get("dates", {}).get("start", {}).get("localTime"),
            "venue": event.get("_embedded", {}).get("venues", [{}])[0].get("name"),
            "image": images[0]["url"] if images else None,
            "url": event.get("url"),
        })

    return events

#
# pull recommendations based on top tracks
#
@router.get("/events/recommended")
def get_recommended_events():
    access_token = access_token_storage.get("access_token")

    if not access_token:
        return []

    # pull user's top tracks
    spotify_url = "https://api.spotify.com/v1/me/top/tracks"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    spotify_res = requests.get(spotify_url, headers=headers)
    spotify_data = spotify_res.json()

    artist_names = []

    for track in spotify_data.get("items", [])[:5]:
        artist = track.get("artists")[0]["name"]

        if artist not in artist_names:
            artist_names.append(artist)

    recommended_events = []

    for artist in artist_names:
        tm_url = "https://app.ticketmaster.com/discovery/v2/events.json"

        params = {
            "apikey": TICKETMASTER_API_KEY,
            "keyword": artist,
            "classificationName": "music",
            "size": 8
        }

        res = requests.get(tm_url, params=params)
        data = res.json()

        for event in data.get("_embedded", {}).get("events", []):
            images = event.get("images", [])

            recommended_events.append({
                "name": event.get("name"),
                "artist": artist,
                "date": event.get("dates", {}).get("start", {}).get("localDate"),
                "time": event.get("dates", {}).get("start", {}).get("localTime"),
                "venue": event.get("_embedded", {}).get("venues", [{}])[0].get("name"),
                "image": images[0]["url"] if images else None,
                "url": event.get("url")
            })

    return recommended_events[:8]
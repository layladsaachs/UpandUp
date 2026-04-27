let audio = new Audio();

document.addEventListener("DOMContentLoaded", () => {

//
// TAB SWITCHING
//
const tab1Button = document.getElementById("tab1Button");
const tab2Button = document.getElementById("tab2Button");
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");

if (tab1Button && tab2Button) {
  tab1Button.onclick = () => {
    tab1.classList.add("active");
    tab2.classList.remove("active");
    tab1Button.classList.add("active-tab");
    tab2Button.classList.remove("active-tab");
  };

  tab2Button.onclick = () => {
    tab2.classList.add("active");
    tab1.classList.remove("active");
    tab2Button.classList.add("active-tab");
    tab1Button.classList.remove("active-tab");

    loadRandomEvents();
    loadRecommendedEvents();
  };
}

//
// DRAGGABLE CELLS
//
const cells = document.querySelectorAll(".cell");
let dragged = null;

cells.forEach(cell => {
  cell.addEventListener("dragstart", () => {
    dragged = cell;
    cell.style.opacity = "0.5";
  });

  cell.addEventListener("dragend", () => {
    cell.style.opacity = "1";
  });

  cell.addEventListener("dragover", (e) => e.preventDefault());

  cell.addEventListener("drop", () => {
    if (dragged !== cell) {
      const parent = cell.parentNode;
      const draggedIndex = [...parent.children].indexOf(dragged);
      const targetIndex = [...parent.children].indexOf(cell);

      if (draggedIndex < targetIndex) {
        parent.insertBefore(dragged, cell.nextSibling);
      } else {
        parent.insertBefore(dragged, cell);
      }
    }
  });
});

//
// CAROUSEL ARROWS (EVENTS TAB)
//
const arrows = document.querySelectorAll(".arrow");

arrows.forEach(button => {
  button.addEventListener("click", () => {
    const track = document.getElementById(button.dataset.track);
    if (!track) return;

    const scrollAmount = 234;

    if (button.classList.contains("right")) {
      track.scrollLeft =
        track.scrollLeft + track.clientWidth >= track.scrollWidth
          ? 0
          : track.scrollLeft + scrollAmount;
    } else {
      track.scrollLeft =
        track.scrollLeft <= 0
          ? track.scrollWidth
          : track.scrollLeft - scrollAmount;
    }
  });
});

//
// SEARCH BAR
//
const searchButton = document.getElementById("searchButton");
const searchBar = document.getElementById("searchBar");

if (searchButton && searchBar) {
  searchButton.addEventListener("click", async () => {
    const query = searchBar.value.trim();
    if (!query) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/search?q=${query}`);
      const data = await res.json();

      renderSearchResults(data);

    } catch (err) {
      console.warn("Backend failed");
    }
  });
}

//
// Search suggestions
//
const suggestionsBox = document.getElementById("searchSuggestions");

searchBar.addEventListener("input", async () => {
  const query = searchBar.value.trim();

  if (!query) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/search?q=${query}`);
    const data = await res.json();

    renderSuggestions(data);
    suggestionsBox.classList.remove("hidden");

  } catch (err) {
    console.warn("Suggestions fallback");

    renderSuggestions({
      tracks: [{ name: "Song Name", artist: "Artist" }],
      artists: [{ name: "Artist Name" }],
      albums: [{ name: "Album Name", artist: "Artist" }],
      events: [{ name: "Event Name", date: "MM/DD/YYYY", time: "Time" }]
    });

    suggestionsBox.classList.remove("hidden");
  }
});

function renderSuggestions(data) {
  suggestionsBox.innerHTML = "";

  const items = [
    ...(data.tracks || []),
    ...(data.artists || []),
    ...(data.albums || []),
    ...(data.events || [])
  ];

  items.slice(0, 6).forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";

    div.innerHTML = `
      <div class="suggestion-img">
        ${item.image ? `<img src="${item.image}">` : "image"}
      </div>
      <div class="suggestion-text">
        <div class="suggestion-title">${item.name}</div>
        <div class="suggestion-sub">
          ${item.artist || ""}
          ${item.date ? `<br>${item.date} ${item.time}` : ""}
        </div>
      </div>
    `;

    div.addEventListener("click", () => {
      suggestionsBox.classList.add("hidden");

      if (item.date) {
        showEventPage(item);
      } else {
        searchBar.value = item.name;
        searchButton.click();
      }
    });

    suggestionsBox.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  if (
    !suggestionsBox.contains(e.target) &&
    !searchBar.contains(e.target)
  ) {
    suggestionsBox.classList.add("hidden");
  }
});

//
// ACTUAL SEARCH RESULTS
//
function renderSearchResults(data) {
 const resultsDiv = document.getElementById("results");
 if (!resultsDiv) return;

 resultsDiv.innerHTML = `
  <div class="section">
   <h3>Songs</h3>
   <div class="card-row" id="songsResults"></div>
  </div>

  <div class="section">
   <h3>Artists</h3>
   <div class="card-row" id="artistsResults"></div>
  </div>

  <div class="section">
   <h3>Albums</h3>
   <div class="card-row" id="albumsResults"></div>
  </div>

  <div class="section">
   <h3>Events</h3>
   <div class="card-row" id="eventsResults"></div>
  </div>
 `;

 renderSongs(data.tracks || []);
 renderArtists(data.artists || []);
 renderAlbums(data.albums || []);
 renderEvents(data.events || []);
}

searchBar.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    suggestionsBox.classList.add("hidden");
    searchButton.click();
  }
});

//
// Song search results
//
function renderSongs(tracks) {
  const container = document.getElementById("songsResults");
  if (!container) return;

  container.innerHTML = "";

  tracks.slice(0,4).forEach((track, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-img">
        ${track.image ? `<img src="${track.image}">` : "image"}
      </div>
      <div class="card-title">${track.name}</div>
      <div class="card-subtitle">${track.artist}</div>
    `;

    container.appendChild(card);
  });

  container.onclick = async (e) => {
    const clickedCard = e.target.closest(".card");
    if (!clickedCard) return;

    const index = clickedCard.dataset.index;
    const track = tracks[index];

    queue = [{
      title: track.name,
      artist: track.artist,
      duration: track.duration,
      image: track.image
    }];

    currentIndex = 0;
    loadTrack(currentIndex);

    if (track.uri) {
      const uris = tracks.map(track => track.uri).filter(Boolean);
      await playTrack(track.uri, uris);
    } else {
      console.log("No URI found");
    }
};
}

//
// Artist search results
//
function renderArtists(artists) {
 const container = document.getElementById("artistsResults");
 if (!container) return;

 container.innerHTML = "";

 artists.slice(0, 4).forEach((artist, index) => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.index = index;

  card.innerHTML = `
   <div class="card-img">
     ${artist.image ? `<img src="${artist.image}">` : "image"}
   </div>
   <div class="card-title">${artist.name}</div>
  `;

  card.addEventListener("click", () => {
    openArtistView(artist);
  });

  container.appendChild(card);

 });
}

//
// Albums search results
//
function renderAlbums(albums) {
 const container = document.getElementById("albumsResults");
 if (!container) return;

 container.innerHTML = "";

 albums.slice(0,4).forEach(album => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-img">
      ${album.image ? `<img src="${album.image}">` : "image"}
    </div>
    <div class="card-title">${album.name}</div>
    <div class="card-subtitle">${album.artist}</div
  `;

  card.addEventListener("click", () => {
    openAlbumView(album);
  });

  container.appendChild(card);
 });
}

//
// Events search results
//
function renderEvents(events) {
 const container = document.getElementById("eventsResults");
 if (!container) return;

 container.innerHTML = "";

 events.slice(0,4).forEach(event => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div>
    <img src="${event.image}" style="width: 100%; height: 100%; object-fit:cover;">
   </div>
   <div>${event.name}</div>
   <div>${event.artist}</div>
   <div>${event.date}</div>
   <div>${event.time}</div>
  `;

  container.appendChild(card);
 });
}


//
// PLAYER
//
const albumArt = document.getElementById("albumArt");
const albumArtFallback = document.getElementById("albumArtFallback");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");

const loopBtn = document.getElementById("loopBtn");
const prevBtn = document.getElementById("prevBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseIcon = document.getElementById("playPauseIcon");
const nextBtn = document.getElementById("nextBtn");
const likeBtn = document.getElementById("likeBtn");
const likeIcon = document.getElementById("likeIcon");

const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const volumeSlider = document.getElementById("volumeSlider");

let queue = [
  { title: "Levels", artist: "Avicii", duration: 180, image: "" },
  { title: "Strobe", artist: "deadmau5", duration: 200, image: "" },
  { title: "Opus", artist: "Eric Prydz", duration: 220, image: "" },
  { title: "Titanium", artist: "David Guetta", duration: 210, image: "" }
];

let currentIndex = 0;

let isPlaying = false;
let isLooping = false;
let currentSeconds = 0;
let timer = null;

let spotifyToken = "";
let player = null;
let deviceId = null;
let progressTimer = null;

async function loadSpotifyToken() {
  const res = await fetch("http://127.0.0.1:8000/token");
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  spotifyToken = data.access_token;
}

async function transferPlaybackHere() {
  await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${spotifyToken}`
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false
    })
  });

}

window.onSpotifyWebPlaybackSDKReady = async () => {
  try {
    await loadSpotifyToken();

    player = new Spotify.Player({
      name: "Vybe Player",
      getOAuthToken: cb =>  cb(spotifyToken),
      volume: 0.5
    });

    player.addListener("ready", async ({ device_id }) => {
      deviceId = device_id;
      console.log("Spotify player ready:", device_id);
      await transferPlaybackHere();
    });

    player.addListener("not_ready", ({ device_id}) => {
      console.log("Device offline:", device_id);
    });

    player.addListener("initialization_error", ({ message }) => {
      console.log("Initialization error:", message);
    });

    player.addListener("authentication_error", ({ message }) => {
      console.log("Authentication error:", message);
    });

    player.addListener("account_error", ({ message }) => {
      console.log("Account error:", message);
    });

    player.addListener("player_state_changed", state => {
      if (!state) return;

      const current = state.track_window.current_track;
      if (!current) return;

      const image = current.album.images[0]?.url || "";

      songTitle.textContent = current.name;
      artistName.textContent = current.artists.map( a => a.name).join(", ");

      durationEl.textContent = formatTime(
        Math.floor(current.duration_ms / 1000)
      );

      currentTimeEl.textContent = formatTime(
        Math.floor(state.position / 1000)
      );

      progressBar.value = current.duration_ms
        ? (state.position / current.duration_ms) * 100
        : 0;

      playPauseIcon.className = state.paused
        ? "fa-solid fa-play"
        : "fa-solid fa-pause";

      if (image) {
        albumArt.src = image;
        albumArt.style.display = "block";
        albumArtFallback.style.display = "none";
      } else {
        albumArt.style.display = "none";
        albumArtFallback.style.display = "block";
      }

      const nowImg = document.getElementById("nowPlayingImg");
      const nowFallback = document.getElementById("nowPlayingFallback");

      if (nowImg && nowFallback) {
        if (image) {
          nowImg.src = image;
          nowImg.style.display = "block";
          nowFallback.style.display = "none";
        } else {
          nowImg.style.display = "none";
          nowFallback.style.display = "block";
        }
      }
    });

    await player.connect();
    startProgressUpdater();
  } catch (err) {
    console.error("Spotify SDK setup failed:", err);
  }
};

async function playTrack(selectedUri, uris) {
  if (!spotifyToken || !deviceId) {
    console.error("Player not ready yet");
    return;
  }

  const offsetIndex = uris.indexOf(selectedUri);

  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${spotifyToken}`
    },
    body: JSON.stringify({
      uris: uris,
      offset: { position: offsetIndex }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Play failed:", text);
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startProgressUpdater() {
  clearInterval(progressTimer);

  progressTimer = setInterval(async () => {
    if (!player) return;

    const state = await player.getCurrentState();
    if (!state) return;

    currentTimeEl.textContent = formatTime(
      Math.floor(state.position / 1000)
    );

    progressBar.value = state.duration
      ? (state.position / state.duration) * 100
      : 0;
  }, 1000);
}

function loadTrack(i) {
  renderQueue();
  const t = queue[i];
  if (!t) return;

  currentSeconds = 0;

  songTitle.textContent = t.title;
  artistName.textContent = t.artist;
  durationEl.textContent = formatTime(t.duration);
  currentTimeEl.textContent = "00:00";

  if (t.image) {
    albumArt.src = t.image;
    albumArt.style.display = "block";
    albumArtFallback.style.display = "none";
  } else {
    albumArt.style.display = "none";
    albumArtFallback.style.display = "block";
  }

  updateNowPlaying(t);
}

async function togglePlay() {
  if (!player) return;

  await player.togglePlay();
}

if (playPauseBtn) {
  playPauseBtn.addEventListener("click", togglePlay);
}

if (nextBtn) {
  nextBtn.addEventListener("click", async () => {
    if (!player) return;

    await player.nextTrack();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", async () => {
    if (!player) return;

    const state = await player.getCurrentState();
    if (!state) return;

    const seconds = state.position / 1000;

    if (seconds > 3) {
      await player.seek(0);
    } else {
      await player.previousTrack();
    }
  });
}

if (progressBar) {
  progressBar.addEventListener("input", async () => {
    if (!player) return;

    const state = await player.getCurrentState();
    if (!state) return;

    const newPos = (progressBar.value / 100) * state.duration;
    await player.seek(newPos);
  });
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", async () => {
    if (!player) return;

    await player.setVolume(volumeSlider.value / 100);
  });
}

//
// LEFT CELL (LIBRARY)
//
const libraryList = document.getElementById("libraryList");
const searchInput = document.getElementById("librarySearch");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "playlists";

async function fetchLibrary(type) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/${type}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Bad data:", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

async function renderLibrary() {
  if (!libraryList) return;

  const query = searchInput?.value.toLowerCase() || "";
  const data = await fetchLibrary(currentFilter);

  libraryList.innerHTML = "";

  // Filter first
  let filtered = data.filter(item =>
    item.name.toLowerCase().includes(query)
  );

  // Apply sorting
  if (currentSort === "alpha") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "added") {
    filtered.reverse();
  }

  // Render
  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "library-item";

    div.innerHTML = `
      <div class="library-item-img">
        ${item.image
          ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">`
          : "image"}
      </div>
      <div class="library-item-text">${item.name}</div>
    `;

    libraryList.appendChild(div);
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.type;
    renderLibrary();
  });
});

if (searchInput) searchInput.addEventListener("input", renderLibrary);
renderLibrary();

//
// MIDDLE CELL (CARDS)
//
function renderRow(id, items) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = item;
    container.appendChild(card);
  });
}

function renderTrackRow(id, tracks) {
 const container = document.getElementById(id);
 if (!container) return;

 container.innerHTML = "";

 tracks.slice(0, 4).forEach((track, index) => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div class="card-img">
     ${track.image ? `<img src="${track.image}">` : "image"}
   </div>
   <div class="card-title">${track.name}</div>
   <div class="card-subtitle">${track.artist}</div>
  `;

  container.appendChild(card);
 });
}

function renderArtistRow(id, artists) {
 const container = document.getElementById(id);
 if (!container) return;

 container.innerHTML = "";

 artists.slice(0, 4).forEach(artist => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div class="card-img">
     ${artist.image ? `<img src="${artist.image}">` : "image"}
   </div>
   <div class="card-title">${artist.name}</div>
  `;

  container.appendChild(card);
 });
}

//
// RIGHT CELL (NOW PLAYING)
//
function updateNowPlaying(track) {
  const img = document.getElementById("nowPlayingImg");
  const fallback = document.getElementById("nowPlayingFallback");
  const title = document.getElementById("nowPlayingTitle");
  const artist = document.getElementById("nowPlayingArtist");

  if (!track) return;

  title.textContent = track.title;
  artist.textContent = track.artist;

  if (track.image) {
    img.src = track.image;
    img.style.display = "block";
    fallback.style.display = "none";
  } else {
    img.style.display = "none";
    fallback.style.display = "block";
  }
}

//
// DROPDOWNS (SETTINGS + PROFILE)
//
const gear = document.getElementById("gear");
const person = document.getElementById("person");
const settingsMenu = document.getElementById("settingsMenu");
const profileMenu = document.getElementById("profileMenu");

if (gear && person && settingsMenu && profileMenu) {
  gear.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("hidden");
    profileMenu.classList.add("hidden");
  });

  person.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("hidden");
    settingsMenu.classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
 if (!settingsMenu.contains(e.target) && !gear.contains(e.target)) {
  settingsMenu.classList.add("hidden");
 }

 if (!profileMenu.contains(e.target) && !person.contains(e.target)) {
  profileMenu.classList.add("hidden");
 }
});
}

//
// Filter Dropdown
const menuBtn = document.getElementById("menuBtn");
const sortMenu = document.getElementById("sortMenu");

if (menuBtn && sortMenu) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sortMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!sortMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      sortMenu.classList.add("hidden");
    }
  });
}

const sortOptions = document.querySelectorAll(".sort-option");
let currentSort = "recent";

sortOptions.forEach(option => {
  option.addEventListener("click", () => {
    sortOptions.forEach(o => o.classList.remove("active"));
    option.classList.add("active");

    currentSort = option.dataset.sort;

    renderLibrary(); 
  });
});

//
// Queue Dropdown menu
const queueBtn = document.getElementById("queueBtn");
const queueMenu = document.getElementById("queueMenu");

if (queueBtn && queueMenu) {
  queueBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpening = queueMenu.classList.toggle("hidden");
    if (!isOpening) {
      renderQueue(); 
    }
  });

  document.addEventListener("click", (e) => {
    if (!queueMenu.contains(e.target) && !queueBtn.contains(e.target)) {
      queueMenu.classList.add("hidden");
    }
  });
}

function renderQueue() {
  const currentDiv = document.getElementById("currentTrack");
  const queueDiv = document.getElementById("queueList");

  if (!currentDiv || !queueDiv) return;

  currentDiv.innerHTML = "";
  queueDiv.innerHTML = "";

  const current = queue[currentIndex];

  // CURRENT TRACK
  if (current) {
    currentDiv.innerHTML = `
      <div class="queue-item current">
        <div class="queue-left">
          <div class="queue-img">
            ${current.image ? `<img src="${current.image}">` : "image"}
          </div>
          <div class="queue-text">
            <div class="queue-title">${current.title}</div>
            <div class="queue-artist">${current.artist}</div>
          </div>
        </div>
      </div>
    `;

    currentDiv.firstElementChild.addEventListener("click", () => {
      loadTrack(currentIndex);
    });
  }

  // NEXT TRACKS (limit 5)
  const nextTracks = queue.slice(currentIndex + 1, currentIndex + 6);

  nextTracks.forEach(track => {
    const div = document.createElement("div");
    div.className = "queue-item";
    if (queue.indexOf(track) === currentIndex) {
      div.classList.add("playing");
    }

    div.dataset.index = queue.indexOf(track); 

    div.innerHTML = `
      <div class="queue-left">
        <div class="queue-img">
          ${track.image ? `<img src="${track.image}">` : "image"}
        </div>

        <div class="queue-text">
          <div class="queue-title">${track.title}</div>
          <div class="queue-artist">${track.artist}</div>
        </div>
      </div>
    `;
    
    div.addEventListener("click", () => {
      currentIndex = parseInt(div.dataset.index);

      if (isShuffleOn) {
        shuffleIndex = shuffleOrder.indexOf(currentIndex);
      }

      currentSeconds = 0;
      loadTrack(currentIndex);
    });

    queueDiv.appendChild(div);
  });
}

//
// create playlist
//
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const results = document.getElementById("results");

if (createPlaylistBtn && results) {
  createPlaylistBtn.addEventListener("click", () => {
    console.log("playlist button clicked");
    renderPlaylistCreator();
  });
}

//
// Shows playlist in middle cell
//
let currentPlaylist = [];

function renderPlaylistCreator() {
  currentPlaylist = [
    {
      title: "Levels",
      artist: "Avicii",
      image: "",
      inQueue: false
    },
    {
      title: "Strobe",
      artist: "deadmau5",
      image: "",
      inQueue: true
    }
  ];

  results.innerHTML = `
    <div class="playlist-container">

      <h1 contenteditable="true" id="playlistName">Playlist Name</h1>

      <div class="playlist-actions">
        <i class="fa-solid fa-shuffle" id="shuffleBtn"></i>
        <i class="fa-solid fa-trash" id="deletePlaylistBtn"></i>
      </div>

      <div id="playlistSongs"></div>

      <h3>Add to this playlist</h3>

      <input type="text" id="playlistSearch" placeholder="Search">

      <div id="playlistSearchResults" class="card-row"></div>

    </div>
  `;

  attachPlaylistEvents();
  renderPlaylistSongs();

}

//
// Playlist buttons
//
let isShuffleOn = false;
let shuffleOrder = [];
let shuffleIndex = 0;

function attachPlaylistEvents() {
  const deleteBtn = document.getElementById("deletePlaylistBtn");

  deleteBtn.addEventListener("click", showDeleteConfirm);

  const shuffleBtn = document.getElementById("shuffleBtn");
    shuffleBtn.addEventListener("click", () => {
    isShuffleOn = !isShuffleOn;

    shuffleBtn.classList.toggle("active");

    if (isShuffleOn) {
      queue = [...currentPlaylist];

      generateShuffleOrder();

      shuffleIndex = shuffleOrder.indexOf(currentIndex);
    }
  });

  const searchInput = document.getElementById("playlistSearch");

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (!query) {
      document.getElementById("playlistSearchResults").innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/search?q=${query}`);
      const data = await res.json();

      renderPlaylistSearch(data.tracks || []);

    } catch (err) {
      console.log("API failed, using dummy data");

      renderPlaylistSearch([
        { name: "Track 1", artist: "Artist" },
        { name: "Track 2", artist: "Artist" },
        { name: "Track 3", artist: "Artist" },
        { name: "Track 4", artist: "Artist" }
      ]);
    }
  });
}

//
// shuffle
//
function generateShuffleOrder() {
  shuffleOrder = [...Array(queue.length).keys()]; 

  for (let i = shuffleOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[i]];
  }

  shuffleIndex = shuffleOrder.indexOf(currentIndex);
}

//
// confirm delete
//
function showDeleteConfirm() {
  const popup = document.createElement("div");
  popup.className = "confirm-popup";

  popup.innerHTML = `
    <div class="confirm-box">
      <h3>Delete this Playlist?</h3>
      <button id="confirmDelete">Delete</button>
      <button id="cancelDelete">Keep</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("confirmDelete").onclick = () => {
    currentPlaylist = [];
    popup.remove();
    document.getElementById("homeContent").style.display = "none";
    document.getElementById("dynamicContent").innerHTML = "...";;
  };

  document.getElementById("cancelDelete").onclick = () => {
    popup.remove();
  };
}

//
// list of playlist songs
//
function renderPlaylistSongs() {
  const container = document.getElementById("playlistSongs");
  if (!container) return;

  container.innerHTML = "";

  currentPlaylist.forEach((song, index) => {
    const div = document.createElement("div");
    div.className = "playlist-song";

    div.innerHTML = `
      <div class="song-left">
        <div class="song-img">
          ${song.image ? `<img src="${song.image}">` : "image"}
        </div>

        <div class="song-text">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist}</div>
        </div>
      </div>

      <div class="song-actions">
        <i class="fa-solid fa-list-ul queue-btn ${song.inQueue ? "active" : ""}" data-index="${index}"></i>
        <i class="fa-solid fa-trash remove-btn" data-index="${index}"></i>
        <i class="fa-regular fa-thumbs-up like-btn" data-index="${index}"></i>
      </div>
    `;

    container.appendChild(div);
  });

  attachSongEvents();
}

//
// song options: queue, delete, like
//
function attachSongEvents() {
  document.querySelectorAll(".queue-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.index;
      const song = currentPlaylist[i];

      song.inQueue = !song.inQueue;

      if (song.inQueue) {
        if (!queue.some(q => q.title === song.title)) {
          queue.push(song);
        }

        if (isShuffleOn) {
          generateShuffleOrder();
        }

      } else {
        const index = queue.findIndex(q => q.title === song.title);
        if (index !== -1) {
          queue.splice(index, 1);
        }

        if (isShuffleOn) {
          generateShuffleOrder();
        }
      }

      renderPlaylistSongs();
      renderQueue();
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.index;
      currentPlaylist.splice(i, 1);
      renderPlaylistSongs();
    });
  });

  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });
}

//
// playlist search
//
function renderPlaylistSearch(tracks) {
  const container = document.getElementById("playlistSearchResults");
  if (!container) return;

  container.innerHTML = "";

  tracks.slice(0, 4).forEach(track => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-img">image</div>
      <div>${track.name}</div>
      <div class="card-subtitle">${track.artist}</div>
    `;

    card.addEventListener("click", () => {
      currentPlaylist.push({
        title: track.name,
        artist: track.artist,
        image: track.image,
        inQueue: false
      });

      renderPlaylistSongs();
    });

    container.appendChild(card);
  });
}

//
// open artist profile
//
async function openArtistView(artist) {
 const results = document.getElementById("results");

 results.innerHTML = `
  <div class="playlist-container">
   <h1 id="playlistName">${artist.name}</h1>

   <div class="playlist-actions">
    <i class="fa-solid fa-shuffle" id="shuffleBtn"></i>
   </div>

   <div id="playlistSongs"></div>
  </div>
 `;

 try {
  const res = await fetch(`http://127.0.0.1:8000/artist-top?name=${artist.name}`);
  const tracks = await res.json();

  currentPlaylist = tracks.map(t => ({
   title: t.name,
   artist: t.artist,
   image: t.image,
   preview: t.preview,
   inQueue: false
  }));

  renderPlaylistSongs(); 

 } catch (err) {
  console.error("Artist load failed", err);
 }
}

//
// open album
//
async function openAlbumView(album) {
 const results = document.getElementById("results");

 results.innerHTML = `
  <div class="playlist-container">
   <h1 id="playlistName">${album.name}</h1>
   <div id="playlistSongs"></div>
  </div>
 `;

 try {
  const res = await fetch(`http://127.0.0.1:8000/album-tracks?name=${album.name}`);
  const tracks = await res.json();

  currentPlaylist = tracks.map(t => ({
   title: t.name,
   artist: t.artist,
   image: t.image,
   preview: t.preview,
   inQueue: false
  }));

  renderPlaylistSongs();
 } catch (err) {
  console.error("Album load failed", err);
 }
}

//
// home screen data
//
async function loadHomeData() {
 try {
  const [topRes, recentRes, favRes, artistRes, albumRes] = await Promise.all([
    fetch("http://127.0.0.1:8000/top"),
    fetch("http://127.0.0.1:8000/recent"),
    fetch("http://127.0.0.1:8000/favorites"),
    fetch("http://127.0.0.1:8000/artists"),
    fetch("http://127.0.0.1:8000/albums")     
  ]);

  const top = await topRes.json();
  const recent = await recentRes.json();
  const favorites = await favRes.json();
  const artists = await artistRes.json();
  const albums = await albumRes.json();

  renderTrackRow("popularRow", top);
  renderTrackRow("recommendRow", top);  
  renderTrackRow("recentRow", recent);
  renderTrackRow("favSongsRow", favorites);
  renderArtistRow("favArtistsRow", artists);
  renderTrackRow("favAlbumsRow", albums);

 } catch (err) {
  console.error("Failed to load home data", err);
 }
}

loadHomeData();

//
// click home button to default home page ()
// Issue: Latency
//
const logo = document.getElementById("logo");

if (logo) {
 logo.addEventListener("click", () => {

  tab1.classList.add("active");
  tab2.classList.remove("active");

  tab1Button.classList.add("active-tab");
  tab2Button.classList.remove("active-tab");

  const results = document.getElementById("results");
  if (results) {
    results.innerHTML = `
      <div class="section">
        <h3>Popular</h3>
        <div class="card-row" id="popularRow"></div>
      </div>
      <div class="section">
        <h3>Recommendations</h3>
        <div class="card-row" id="recommendRow"></div>
      </div>
      <div class="section">
        <h3>Recently Played</h3>
        <div class="card-row" id="recentRow"></div>
      </div>
      <div class="section">
        <h3>Favorite Songs</h3>
        <div class="card-row" id="favSongsRow"></div>
      </div>
      <div class="section">
        <h3>Favorite Artists</h3>
        <div class="card-row" id="favArtistsRow"></div>
      </div>
      <div class="section">
        <h3>Favorite Albums</h3>
        <div class="card-row" id="favAlbumsRow"></div>
      </div>
      `;
  }

  loadHomeData();
 });
}

//
// Events (Random)
//
async function loadRandomEvents() {
    const res = await fetch("http://127.0.0.1:8000/events/random");
    const events = await res.json();

    console.log(events);

    renderEventCarousel("eventsTrack", events);
}

//
// Recommendations
//
async function loadRecommendedEvents() {
    const res = await fetch("http://127.0.0.1:8000/events/recommended");
    const events = await res.json();

    renderEventCarousel("forYouTrack", events);
}

//
// Render Events
//
function renderEventCarousel(trackId, events) {
    const container = document.getElementById(trackId);
    if (!container) return;

    container.innerHTML = "";

    events.forEach(event => {
        const card = document.createElement("div");
        card.className = "event";

        card.innerHTML = `
            <div class="event-img">
              <img src="${event.image}" alt="event"> 
            </div>

            <div class="event-title">${event.name || ""}</div>
            <div class="event-date">${event.date || ""}</div>
            <div class="event-venue">${event.venue || ""}</div>
        `;

        if (event.url) {
            card.addEventListener("click", () => {
                window.open(event.url, "_blank");
            });
        }

        container.appendChild(card);
    });
}

});
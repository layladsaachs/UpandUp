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

      // If backend only returns tracks (for now)
      if (Array.isArray(data)) {
      renderSearchResults({
        tracks: data,
        artists: [],
        albums: [],
        events: []
      });
      } else {
      // full response (later)
      renderSearchResults(data);
      }

    } catch (err) {
      console.warn("Backend failed → using mock data");

      // test data (DELETE LATER)
      renderSearchResults({
      tracks: [
        {
          name: "Test Song",
          artist: "Test Artist",
          album: "Test Album",
          image: "image",
          duration: 200,
          preview: ""
        },
        {
          name: "Test Song",
          artist: "Test Artist",
          album: "Test Album",
          image: "image",
          duration: 200,
          preview: ""
        },
        {
          name: "Test Song",
          artist: "Test Artist",
          album: "Test Album",
          image: "image",
          duration: 200,
          preview: ""
        },
        {
          name: "Test Song",
          artist: "Test Artist",
          album: "Test Album",
          image: "image",
          duration: 200,
          preview: ""
        },
      ],
      artists: [
        {
          name: "Test Artist",
          image: "image"
        },
        {
          name: "Test Artist",
          image: "image"
        },
        {
          name: "Test Artist",
          image: "image"
        },
        {
          name: "Test Artist",
          image: "image"
        }
      ],
      albums: [
        {
          name: "Test Album",
          artist: "Test Artist",
          image: "image"
        },
        {
          name: "Test Album",
          artist: "Test Artist",
          image: "image"
        },
        {
          name: "Test Album",
          artist: "Test Artist",
          image: "image"
        },
        {
          name: "Test Album",
          artist: "Test Artist",
          image: "image"
        },
      ],
      events: [
        {
          name: "Test Concert",
          artist: "Test Artist",
          date: "05/01/2026",
          time: "7:00 PM"
        },
        {
          name: "Test Concert",
          artist: "Test Artist",
          date: "05/02/2026",
          time: "7:00 PM"
        },
        {
          name: "Test Concert",
          artist: "Test Artist",
          date: "05/03/2026",
          time: "7:00 PM"
        },
        {
          name: "Test Concert",
          artist: "Test Artist",
          date: "05/04/2026",
          time: "7:00 PM"
        }
      ]
      });
    }
    });
}

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

 renderSongs(data.tracks || data);
 renderArtists(data.artists || []);
 renderAlbums(data.albums || []);
 renderEvents(data.events || []);
}

searchBar.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
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

 tracks.forEach(track => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-img">
      ${track.image 
        ? `<img src="${track.image}">`
        : "image"}
    </div>
    <div class="card-title">${track.name}</div>
    <div class="card-subtitle">${track.artist}</div>
  `;

  card.addEventListener("click", () => {
   if (track.preview) {
    audio.src = track.preview;
    audio.play();
   }

   queue = [{
    title: track.name,
    artist: track.artist,
    duration: track.duration,
    image: track.image
   }];

   currentIndex = 0;
   loadTrack(currentIndex);
  });

  container.appendChild(card);
 });
}

//
// Artists search results
//
function renderArtists(artists) {
 const container = document.getElementById("artistsResults");
 if (!container) return;

 container.innerHTML = "";

 artists.forEach(artist => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div>
    <img src="${artist.image}" style="width:100%; height:100%; object-fit:cover;">
   </div>
   <div>${artist.name}</div>
  `;

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

 albums.forEach(album => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div>
    <img src="${album.image}" style="width:100%; height:100%; object-fit:cover;">
   </div>
   <div>${album.name}</div>
   <div>${album.artist}</div>
  `;

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

 events.forEach(event => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
   <div>
    <img src="{album.image}" style="width: 100%; height: 100%; object-fit:cover;">
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
  { title: "Song Name", artist: "Artist Name", duration: 180, image: "" },
  { title: "Second Song", artist: "Another Artist", duration: 215, image: "" }
];

let currentIndex = 0;
let isPlaying = false;
let isLooping = false;
let currentSeconds = 0;
let timer = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function loadTrack(i) {
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

function play() {
  if (!queue[currentIndex]) return;
  isPlaying = true;
  playPauseIcon.className = "fa-solid fa-pause";

  clearInterval(timer);
  timer = setInterval(() => {
    const t = queue[currentIndex];
    currentSeconds++;
    currentTimeEl.textContent = formatTime(currentSeconds);

    if (currentSeconds >= t.duration) {
      currentSeconds = 0;
      if (!isLooping) currentIndex++;
      if (currentIndex >= queue.length) return stop();
      loadTrack(currentIndex);
    }
  }, 1000);
}

function stop() {
  isPlaying = false;
  playPauseIcon.className = "fa-solid fa-play";
  clearInterval(timer);
}

function togglePlay() {
  isPlaying ? stop() : play();
}

if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);
if (nextBtn) nextBtn.addEventListener("click", () => {
  currentIndex++;
  currentSeconds = 0;
  loadTrack(currentIndex);
});
if (prevBtn) prevBtn.addEventListener("click", () => {
  currentIndex--;
  currentSeconds = 0;
  loadTrack(currentIndex);
});

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

  data
    .filter(item => item.name.toLowerCase().includes(query))
    .forEach(item => {
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

renderRow("popularRow", ["Song 1", "Song 2", "Song 3", "Song 4"]);
renderRow("recommendRow", ["Rec 1", "Rec 2", "Rec 3", "Rec 4"]);
renderRow("recentRow", ["Recent 1", "Recent 2", "Recent 3", "Recent 4"]);
renderRow("favSongsRow", ["Song 1", "Song 2", "Song 3", "Song 4"]);
renderRow("favArtistsRow", ["Artist 1", "Artist 2", "Artist 3", "Artist 4"]);
renderRow("favAlbumsRow", ["Album 1", "Album 2", "Album 3", "Album 4"]);

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
 // If click is NOT inside settings menu or gear button → close it
 if (!settingsMenu.contains(e.target) && !gear.contains(e.target)) {
  settingsMenu.classList.add("hidden");
 }

 // If click is NOT inside profile menu or person button → close it
 if (!profileMenu.contains(e.target) && !person.contains(e.target)) {
  profileMenu.classList.add("hidden");
 }
});
}

});
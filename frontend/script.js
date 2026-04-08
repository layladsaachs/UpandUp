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
  searchButton.addEventListener("click", () => {
    const query = searchBar.value;
    console.log("User searched for:", query);

    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <h2>Search Results</h2>
        <p>Searching for: ${query}</p>
      `;
    }
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
        <div class="library-item-img">image</div>
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

if (gear && person) {
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

  document.addEventListener("click", () => {
    settingsMenu.classList.add("hidden");
    profileMenu.classList.add("hidden");
  });
}

});
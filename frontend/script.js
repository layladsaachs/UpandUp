//
//
//
// Tab 1 : Music Player Functions
//
//
//

// Obtain buttons from HTML file (document)
const tab1Button = document.getElementById("tab1Button");
const tab2Button = document.getElementById("tab2Button");
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");

// User clicks Music Player
// Show Music Player, hide Events
// Highlight Music Player
tab1Button.onclick = () => {
    tab1.classList.add("active");
    tab2.classList.remove("active");
    tab1Button.classList.add("active-tab");
    tab2Button.classList.remove("active-tab");
};

// User clicks Events
// Show Events, hide Music Player
// Highlight Events
tab2Button.onclick = () => {
    tab2.classList.add("active");
    tab1.classList.remove("active");
    tab2Button.classList.add("active-tab");
    tab1Button.classList.remove("active-tab");
};

// select all draggable boxes
// dragged = box to be moved, initialized to nothing
const cells = document.querySelectorAll(".cell");
let dragged = null;

// Loop through every box and attach drag behavior to each
cells.forEach(cell => {

    // Start dragging
    // Save box to be dragged 
    // Lower opacity for box currently undergoing drag
    cell.addEventListener("dragstart", () => {
        dragged = cell;
        cell.style.opacity = "0.5";
    });

    // End dragging
    // When done dragging box, restore original opacity 
    cell.addEventListener("dragend", () => {
        cell.style.opacity = "1";
    });

    // Drop cells into place
    cell.addEventListener("dragover",(event) => {
        event.preventDefault();
    });

    cell.addEventListener("drop", () => {
        // dragged cell does not drop onto itself
        if(dragged !== cell){
            const parent = cell.parentNode;
            const draggedIndex = [...parent.children].indexOf(dragged);
            const targetIndex = [...parent.children].indexOf(cell);

            // Reorder cells
            if(draggedIndex < targetIndex){
                parent.insertBefore(dragged, cell.nextSibling);
            }else{
                parent.insertBefore(dragged, cell);
            }
        }
    });

});

//
//
//
// Tab 2 : Event Functions
//
//
//

const arrows = document.querySelectorAll(".arrow");

arrows.forEach(button => {
    button.addEventListener("click", () => {
        
        const track = document.getElementById(button.dataset.track);
        const scrollAmount = 234;

        if(button.classList.contains("right")){   
            if(track.scrollLeft + track.clientWidth >= track.scrollWidth){
                track.scrollLeft = 0;
            }else{
                track.scrollLeft += scrollAmount;
            }
        }else{
            if(track.scrollLeft <= 0){
                track.scrollLeft = track.scrollWidth;
            }else{
                track.scrollLeft -= scrollAmount;
            }
        }
    });
});

//
//
//
// This section is for the SEARCH BAR
//
//
//
const searchButton = document.getElementById("searchButton");
const searchBar = document.getElementById("searchBar");

searchButton.addEventListener("click", () => {
    const query = searchBar.value;

    // Show in console
    console.log("User searched for:", query);

    // Temporary display on page
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <h2>Search Results</h2>
        <p>Searching for: ${query}</p>
    `;
});


// Load playlist into user library
async function loadPlaylists() {
    try {
        const response = await fetch("http://127.0.0.1:8000/playlists");
        const data = await response.json();

        console.log("Playlists:", data);

        const libraryDiv = document.getElementById("userLibrary");

        const oldSection = document.getElementById("playlistSection");
        if (oldSection) oldSection.remove();

        const playlistSection = document.createElement("div");
        playlistSection.id = "playlistSection";

        data.forEach(playlist => {
            const div = document.createElement("div");
            div.classList.add("playlist-item");

            div.innerHTML = `
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-tracks">
                    Tracks: ${playlist.tracks_total}
                </div>
            `;
            playlistSection.appendChild(div);
        });

        libraryDiv.appendChild(playlistSection);

    } catch (error) {
        console.error("Error loading playlists:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPlaylists();
});


//
//
//
// Player Functionality
//
//
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
  {
    title: "Song Name",
    artist: "Artist Name",
    duration: 180,
    image: ""
  },
  {
    title: "Second Song",
    artist: "Another Artist",
    duration: 215,
    image: ""
  }
];

let currentIndex = 0;
let isPlaying = false;
let isLooping = false;
let isLiked = false;
let currentSeconds = 0;
let progressTimer = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function loadTrack(index) {
    const track = queue[index];
    updateNowPlaying(track);

    if (!track) {
        songTitle.textContent = "Song Name";
        artistName.textContent = "Artist Name";
        durationEl.textContent = "00:00";
        currentTimeEl.textContent = "00:00";
        progressBar.value = 0;
        albumArt.src = "";
        albumArt.style.display = "none";
        albumArtFallback.style.display = "inline";
        stopPlayback();
        return;
    }

    songTitle.textContent = track.title;
    artistName.textContent = track.artist;
    durationEl.textContent = formatTime(track.duration);
    currentTimeEl.textContent = formatTime(currentSeconds);
    progressBar.value = track.duration ? (currentSeconds / track.duration) * 100 : 0;

    if (track.image) {
        albumArt.src = track.image;
        albumArt.style.display = "block";
        albumArtFallback.style.display = "none";
    } else {
        albumArt.src = "";
        albumArt.style.display = "none";
        albumArtFallback.style.display = "inline";
    }
}

function startPlayback() {
  if (!queue[currentIndex]) return;

  isPlaying = true;
  playPauseIcon.className = "fa-solid fa-pause";

  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    const track = queue[currentIndex];
    if (!track) {
      stopPlayback();
      return;
    }

    currentSeconds++;
    currentTimeEl.textContent = formatTime(currentSeconds);
    progressBar.value = (currentSeconds / track.duration) * 100;

    if (currentSeconds >= track.duration) {
      if (isLooping) {
        currentSeconds = 0;
        loadTrack(currentIndex);
      } else if (currentIndex < queue.length - 1) {
        currentIndex++;
        currentSeconds = 0;
        loadTrack(currentIndex);
      } else {
        stopPlayback();
      }
    }
  }, 1000);
}

function stopPlayback() {
  isPlaying = false;
  playPauseIcon.className = "fa-solid fa-play";
  clearInterval(progressTimer);
}

function togglePlayPause() {
  if (!queue[currentIndex]) return;

  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function goNext() {
  if (currentIndex < queue.length - 1) {
    currentIndex++;
    currentSeconds = 0;
    loadTrack(currentIndex);
    if (isPlaying) startPlayback();
  } else {
    stopPlayback();
  }
}

function goPrev() {
  if (currentSeconds > 3) {
    currentSeconds = 0;
    loadTrack(currentIndex);
    if (isPlaying) startPlayback();
    return;
  }

  if (currentIndex > 0) {
    currentIndex--;
    currentSeconds = 0;
    loadTrack(currentIndex);
    if (isPlaying) startPlayback();
  }
}

playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);

loopBtn.addEventListener("click", () => {
  isLooping = !isLooping;
  loopBtn.classList.toggle("active", isLooping);
});

likeBtn.addEventListener("click", () => {
  isLiked = !isLiked;
  likeBtn.classList.toggle("active", isLiked);
  likeIcon.className = isLiked ? "fa-solid fa-thumbs-up" : "fa-regular fa-thumbs-up";
});

progressBar.addEventListener("input", () => {
  const track = queue[currentIndex];
  if (!track) return;

  currentSeconds = Math.floor((progressBar.value / 100) * track.duration);
  currentTimeEl.textContent = formatTime(currentSeconds);
});

volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value;
  console.log("Volume:", volume);
});

loadTrack(currentIndex);

//
//
//
// Cell Left
//
//
//
const libraryList = document.getElementById("libraryList");
const searchInput = document.getElementById("librarySearch");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "playlists";

/* MOCK DATA (replace later with backend/Spotify) */
const libraryData = {
  playlists: ["Liked", "Collection 1", "Collection 2"],
  albums: ["Album A", "Album B"],
  artists: ["Artist X", "Artist Y"]
};

/* Render function */
function renderLibrary() {
  const query = searchInput.value.toLowerCase();
  const items = libraryData[currentFilter];

  libraryList.innerHTML = "";

  items
    .filter(item => item.toLowerCase().includes(query))
    .forEach(item => {
      const div = document.createElement("div");
      div.className = "library-item";

      div.innerHTML = `
        <div class="library-item-img">image</div>
        <div class="library-item-text">${item}</div>
      `;

      libraryList.appendChild(div);
    });
}

/* Filter buttons */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.type;
    renderLibrary();
  });
});

/* Search */
searchInput.addEventListener("input", renderLibrary);

/* Initial render */
renderLibrary();


//
//
//
// Cell Middle
//
//
//
/* Initial render */
renderRow(popularRow, popularData);
renderRow(recommendRow, recommendData);

function renderRow(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = item;
    container.appendChild(card);
  });
}

/* Mock data */
renderRow("popularRow", ["Song 1", "Song 2", "Song 3"]);
renderRow("recommendRow", ["Rec 1", "Rec 2", "Rec 3"]);
renderRow("recentRow", ["Recent 1", "Recent 2"]);
renderRow("favSongsRow", ["Fav Song 1", "Fav Song 2"]);
renderRow("favArtistsRow", ["Artist 1", "Artist 2"]);
renderRow("favAlbumsRow", ["Album 1", "Album 2"]);


//
//
//
// Cell Right
//
//
//
const nowImg = document.getElementById("nowPlayingImg");
const nowFallback = document.getElementById("nowPlayingFallback");
const nowTitle = document.getElementById("nowPlayingTitle");
const nowArtist = document.getElementById("nowPlayingArtist");

/* Call this whenever song changes */
function updateNowPlaying(track) {
  if (!track) return;

  nowTitle.textContent = track.title;
  nowArtist.textContent = track.artist;

  if (track.image) {
    nowImg.src = track.image;
    nowImg.style.display = "block";
    nowFallback.style.display = "none";
  } else {
    nowImg.style.display = "none";
    nowFallback.style.display = "block";
  }
}
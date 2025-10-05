// ---------- songs list ----------
// This is the main list of songs present in the songs folder (have to write the name manually)
const songsList = [
  {
    id: "s1",
    title: "Flower",
    artist: "Miley Cyrus",
    duration: "3:44",
    url: "songs/flower.mp3",
  },
  {
    id: "s2",
    title: "Shape of You",
    artist: "Ed Sheeran",
    duration: "4:24",
    url: "songs/shape_of_you.mp3",
  },
  {
    id: "s3",
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    url: "songs/blinding_lights.mp3",
  },
  {
    id: "s4",
    title: "Levitating",
    artist: "Dua Lipa",
    duration: "3:23",
    url: "songs/levitating.mp3",
  },
  {
    id: "s5",
    title: "Peaches",
    artist: "Justin Bieber",
    duration: "3:18",
    url: "songs/peaches.mp3",
  },
  {
    id: "s6",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    duration: "2:21",
    url: "songs/stay.mp3",
  },
  {
    id: "s7",
    title: "Senorita",
    artist: "Shawn Mendes, Camila Cabello",
    duration: "3:10",
    url: "songs/senorita.mp3",
  },
  {
    id: "s8",
    title: "Bad Guy",
    artist: "Billie Eilish",
    duration: "3:14",
    url: "songs/bad_guy.mp3",
  },
  {
    id: "s9",
    title: "Closer",
    artist: "The Chainsmokers",
    duration: "4:05",
    url: "songs/closer.mp3",
  },
  {
    id: "s10",
    title: "Perfect",
    artist: "Ed Sheeran",
    duration: "4:39",
    url: "songs/perfect.mp3",
  },
];

// Visible songs currently displayed in the UI
let visibleSongs = songsList.slice();

// Set the favorite songs by their IDs to make them only once at the time (doesn't conflict)
let favoriteIds = new Set();

// Predefined playlists; users can add more
let playlists = [
  { id: "p1", name: "Workout Mix", songs: [] },
  { id: "p2", name: "Chill Vibes", songs: [] },
];

// Recently played songs, stored like the object type
let recents = [];

// Index of the currently playing song in visibleSongs
let currentIdx = 0;

// song state, that is the song currently playing?
let isPlaying = false;

// which view is currently active: "all", "favorites", "playlists", "recent" (we have four)
let currentView = "all";

// ---------- Element store in variable to use later ----------
const audio = document.getElementById("audio");
const songsContainer = document.getElementById("songsContainer");
const searchInput = document.getElementById("searchInput");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toast = document.getElementById("toast");
const progressContainer = document.getElementById("progressContainer");
const progressBarFill = document.getElementById("progressBarFill");
const currentTimeDisplay = document.getElementById("currentTimeDisplay");
const durationDisplay = document.getElementById("durationDisplay");
const volumeSlider = document.getElementById("volume-slider");
const btnMute = document.getElementById("btn-mute");

// ---------- showing time of songs ----------
// Converts seconds into mm:ss format to display as usually we do for music player
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// --------- show message as showing what's going on -------------
// Simple toast message for notifications like "Added to favorites"
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("active");
  setTimeout(
    () => toast.classList.remove("active"),
    1800
  ); /* it will show and then disappear smoothly */
}

// ---------- Render / UI binding ----------
// Render the list of songs in the container (most important part)
function renderSongs(list = visibleSongs) {
  // If nothing to show — show a "no songs found" message
  if (!list || list.length === 0) {
    songsContainer.innerHTML = '<div class="loading">No songs found</div>';
    return;
  }

  // Create the HTML for each song
  songsContainer.innerHTML = list
    .map((s, idx) => {
      // Highlight the currently active (playing) song
      const isActive =
        s.id === (visibleSongs[currentIdx] && visibleSongs[currentIdx].id);
      const favClass = favoriteIds.has(s.id) ? "active" : "";
      const favIcon = favoriteIds.has(s.id) ? "❤️" : "🤍";

      return `
        <div class="song-item ${isActive ? "active" : ""}" data-index="${idx}">
          <div class="song-artwork">🎵</div>
          <div class="song-info">
            <div class="song-title">${s.title}</div>
            <div class="song-artist">${s.artist}</div>
          </div>
          <div class="song-actions">
            <button class="action-btn favorite-btn ${favClass}" data-id="${
        s.id
      }">${favIcon}</button>
            <div style="position: relative;">
              <button class="action-btn menu-btn" data-id="${s.id}">⋮</button>
              <div class="dropdown" id="dropdown-${s.id}">
                <div class="dropdown-item" data-action="playlist" data-id="${
                  s.id
                }">📋 Add to Playlist</div>
                <div class="dropdown-item" data-action="share" data-id="${
                  s.id
                }">🔗 Share Song</div>
                <div class="dropdown-item" data-action="info" data-id="${
                  s.id
                }">ℹ️ Song Info</div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach click listeners for each song row
  songsContainer.querySelectorAll(".song-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      // Ignore clicks on song actions buttons
      if (!e.target.closest(".song-actions")) {
        const idx = parseInt(item.dataset.index, 10);
        if (!isNaN(idx)) playSong(idx);
      }
    });
  });

  // Favorite button click handling
  songsContainer.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // it is very important property because, it make the click affect only to that particular thing, don’t let it go up to their parent elements.
      toggleFavorite(btn.dataset.id); /* make the song favorite by ID */
    });
  });

  // Menu button click handling
  songsContainer.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      showMenu(btn.dataset.id);
    });
  });
}

// ---------- Player controls ----------
// Play song at a specific index in visibleSongs
function playSong(index) {
  // guard index
  if (!visibleSongs || !visibleSongs.length) return;
  if (index < 0 || index >= visibleSongs.length) index = 0;

  currentIdx = index;
  const song = visibleSongs[currentIdx];
  if (!song) return;

  // Add to recents, keeping newest first, maximum 20
  if (!recents.find((s) => s.id === song.id)) {
    recents.unshift(song);
    if (recents.length > 20) recents.pop();
  }

  // Set audio source and play
  audio.src = song.url;
  audio.play().catch(() => {
    // some browsers require user gesture to play — ignore errors
  });
  isPlaying = true;
  playBtn.textContent = "⏸";

  // Update player info in small player UI
  const titleEl = document.querySelector(".player-title");
  const artistEl = document.querySelector(".player-artist");
  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;

  // Re-render songs list to show active highlight
  renderSongs();
}

// Toggle play/pause
function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "▶";
    isPlaying = false;
  } else {
    audio.play().catch(() => {
      /* ignore */
    });
    playBtn.textContent = "⏸";
    isPlaying = true;
  }
}

// Play next song (loop around)
function playNext() {
  if (!visibleSongs || visibleSongs.length === 0) return;
  currentIdx = (currentIdx + 1) % visibleSongs.length;
  playSong(currentIdx);
}

// Play previous song (loop around)
function playPrev() {
  if (!visibleSongs || visibleSongs.length === 0) return;
  currentIdx = (currentIdx - 1 + visibleSongs.length) % visibleSongs.length;
  playSong(currentIdx);
}

// ---------- Favorites ----------
// Toggle favorite status for a song
function toggleFavorite(id) {
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
    showToast("Removed from favorites");
  } else {
    favoriteIds.add(id);
    showToast("Added to favorites");
  }

  // If viewing favorites view, update visibleSongs
  if (currentView === "favorites") {
    visibleSongs = songsList.filter((s) => favoriteIds.has(s.id));
    currentIdx = 0;
  }

  renderSongs();
}

// ---------- Dropdown menu handling ----------
// Show song dropdown menu
function showMenu(id) {
  const dropdown = document.getElementById(`dropdown-${id}`);
  if (!dropdown) return;

  // Close other dropdowns
  document.querySelectorAll(".dropdown").forEach((d) => {
    if (d.id !== `dropdown-${id}`) d.classList.remove("active");
  });

  dropdown.classList.toggle("active");
}

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-btn") && !e.target.closest(".dropdown")) {
    document
      .querySelectorAll(".dropdown")
      .forEach((d) => d.classList.remove("active"));
  }
});

// Handle dropdown item clicks (delegated)
document.addEventListener("click", (e) => {
  const item = e.target.closest(".dropdown-item");
  if (!item) return;

  const action = item.dataset.action;
  const songId = item.dataset.id;
  const song = songsList.find((s) => s.id === songId);

  if (action === "playlist") {
    if (song) showAddToPlaylistModal(song);
  } else if (action === "share") {
    const shareUrl = window.location.href + "?song=" + songId;
    const shareData = {
      title: song.title,
      text: `Check out "${song.title}" by ${song.artist}`,
      url: shareUrl,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      navigator
        .share(shareData)
        .then(() => showToast("Shared successfully!"))
        .catch(() => copyToClipboard(shareUrl));
    } else {
      copyToClipboard(shareUrl);
    }
  } else if (action === "info") {
    showToast(`${song.title} - ${song.artist} (${song.duration})`);
  }

  // Close dropdowns after action
  document
    .querySelectorAll(".dropdown")
    .forEach((d) => d.classList.remove("active"));
});

// ---------- Clipboard fallback ----------
// Copy text to clipboard, with fallback for older browsers
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Link copied to clipboard!"))
      .catch(() => showToast("Could not copy link"));
    return;
  }

  // Older fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Link copied to clipboard!");
  } catch (err) {
    showToast("Could not copy link");
  }
  document.body.removeChild(ta);
}

// ---------- Playlists modal ----------
// Show modal to add song to playlist or create new playlist
function showAddToPlaylistModal(song) {
  // Create modal container
  const modal = document.createElement("div");
  modal.style.cssText =
    "position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.75); z-index:5000; display:flex; align-items:center; justify-content:center; padding:1rem;";

  // Modal inner HTML
  modal.innerHTML = `
    <div style="background: var(--bg-medium); border-radius:12px; padding:1rem; max-width:420px; width:100%; color:var(--text-primary);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <strong>Add to Playlist</strong>
        <button id="__closeModal" style="background:none; border:none; color:var(--text-secondary); font-size:1.2rem; cursor:pointer;">×</button>
      </div>
      <div style="background: rgba(99,102,241,0.06); padding:0.75rem; border-radius:8px; margin-bottom:0.75rem;">
        <div style="font-weight:600;">${song.title}</div>
        <div style="font-size:0.9rem; color:var(--text-secondary);">${
          song.artist
        }</div>
      </div>
      <div style="margin-bottom:0.75rem;">
        <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-secondary); font-size:0.85rem;">Select playlist</div>
        <div id="__playlistOptions" style="display:flex; flex-direction:column; gap:0.5rem;">
          ${
            playlists.length === 0
              ? '<div style="color:var(--text-secondary); padding:0.5rem;">No playlists yet</div>'
              : playlists
                  .map(
                    (p) => `
              <div class="__playlistOpt" data-playlist="${
                p.id
              }" style="padding:0.6rem; background:var(--bg-light); border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                <div>
                  <div style="font-weight:600;">${p.name}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${
                    p.songs.length
                  } songs</div>
                </div>
                ${
                  p.songs.includes(song.id)
                    ? '<span style="color:var(--success);">✓ Added</span>'
                    : ""
                }
              </div>
            `
                  )
                  .join("")
          }
        </div>
      </div>
      <div style="border-top:1px solid var(--border); padding-top:0.75rem;">
        <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-secondary); font-size:0.85rem;">Create new playlist</div>
        <div style="display:flex; gap:0.5rem;">
          <input id="__newPlaylistName" placeholder="Playlist name" style="flex:1; padding:0.6rem; border-radius:8px; background:var(--bg-light); border:1px solid var(--border); color:var(--text-primary);" />
          <button id="__createPlaylistBtn" style="padding:0.5rem 0.9rem; background:#6366f1; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Create</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  modal
    .querySelector("#__closeModal")
    .addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Playlist option click handlers
  modal.querySelectorAll(".__playlistOpt").forEach((opt) => {
    opt.addEventListener("click", () => {
      const pid = opt.dataset.playlist;
      const pl = playlists.find((p) => p.id === pid);
      if (!pl) return;
      if (pl.songs.includes(song.id)) {
        showToast("Already in this playlist");
      } else {
        pl.songs.push(song.id);
        showToast(`Added to ${pl.name}`);
      }
      modal.remove();
    });

    // small hover effect
    opt.addEventListener("mouseenter", () => {
      opt.style.background = "rgba(99,102,241,0.12)";
    });
    opt.addEventListener("mouseleave", () => {
      opt.style.background = "var(--bg-light)";
    });
  });

  // Create new playlist
  modal.querySelector("#__createPlaylistBtn").addEventListener("click", () => {
    const nameInput = modal.querySelector("#__newPlaylistName");
    const name = (nameInput.value || "").trim();
    if (!name) return;
    const newPl = { id: "p" + Date.now(), name, songs: [song.id] };
    playlists.push(newPl);
    showToast(`Created "${name}" and added song`);
    modal.remove();
  });

  // Allow Enter key to create playlist
  modal
    .querySelector("#__newPlaylistName")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter")
        modal.querySelector("#__createPlaylistBtn").click();
    });
}

// ---------- Search & view buttons ----------
searchInput.addEventListener("input", (e) => {
  const q = (e.target.value || "").trim().toLowerCase();
  if (!q) {
    switchToView(currentView);
    return;
  }
  visibleSongs = songsList.filter(
    (s) =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
  currentIdx = 0;
  currentView = "search";
  renderSongs();
});

// Helper to switch views: all, favorites, recent
function switchToView(view) {
  currentView = view;
  if (view === "all") visibleSongs = songsList.slice();
  else if (view === "favorites")
    visibleSongs = songsList.filter((s) => favoriteIds.has(s.id));
  else if (view === "recent") visibleSongs = recents.slice();
  currentIdx = 0;
  renderSongs();
}

// Nav buttons
document.getElementById("homeBtn").addEventListener("click", () => {
  searchInput.value = "";
  switchToView("all");
  showToast("Showing all songs");
});

document.getElementById("favoritesBtn").addEventListener("click", function () {
  switchToView("favorites");
  this.classList.add("active");
  showToast(`Showing ${visibleSongs.length} favorite songs`);
});

document.getElementById("recentsBtn").addEventListener("click", function () {
  switchToView("recent");
  showToast(
    recents.length
      ? `Showing ${recents.length} recently played`
      : "No recently played songs"
  );
});

document.getElementById("playlistBtn").addEventListener("click", function () {
  renderPlaylistsView();
});

// ---------- Playlists view ----------
function renderPlaylistsView() {
  songsContainer.innerHTML = `
    <div style="padding:1rem;">
      <h2 style="margin-bottom:0.8rem;">Your Playlists</h2>
      <div style="background: rgba(99,102,241,0.06); padding:1rem; border-radius:10px; margin-bottom:0.8rem; display:flex; gap:0.5rem;">
        <input type="text" id="newPlaylistInput" placeholder="Playlist name..." style="flex:1; padding:0.6rem; border-radius:8px; background:var(--bg-light); border:1px solid var(--border); color:var(--text-primary);" />
        <button id="createPlaylistBtn" style="padding:0.6rem 0.9rem; background:#6366f1; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Create</button>
      </div>
      <div id="playlistsList">
        ${
          playlists.length === 0
            ? '<div style="color:var(--text-secondary);">No playlists yet</div>'
            : playlists
                .map(
                  (pl) => `
            <div class="song-item" data-playlist-id="${pl.id}" style="cursor:pointer;">
              <div class="song-artwork">📋</div>
              <div class="song-info">
                <div class="song-title">${pl.name}</div>
                <div class="song-artist">${pl.songs.length} songs</div>
              </div>
              <button class="action-btn delete-playlist-btn" data-playlist-id="${pl.id}">🗑️</button>
            </div>
          `
                )
                .join("")
        }
      </div>
    </div>
  `;

  // Create new playlist
  const createBtn = document.getElementById("createPlaylistBtn");
  const input = document.getElementById("newPlaylistInput");
  createBtn.addEventListener("click", () => {
    const name = (input.value || "").trim();
    if (!name) return;
    playlists.push({ id: "p" + Date.now(), name, songs: [] });
    showToast(`Created playlist: ${name}`);
    renderPlaylistsView();
  });
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") createBtn.click();
  });

  // Delete playlist
  document.querySelectorAll(".delete-playlist-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = btn.dataset.playlistId;
      if (confirm("Delete this playlist?")) {
        playlists = playlists.filter((p) => p.id !== pid);
        showToast("Playlist deleted");
        renderPlaylistsView();
      }
    });
  });

  // Clicking playlist item -> view playlist
  document.querySelectorAll("[data-playlist-id]").forEach((item) => {
    if (!item.classList.contains("delete-playlist-btn")) {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".action-btn")) {
          const pid = item.dataset.playlistId;
          viewPlaylist(pid);
        }
      });
    }
  });
}

function viewPlaylist(playlistId) {
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  if (!pl.songs.length) {
    songsContainer.innerHTML = `<div class="loading"><p>This playlist is empty</p><button onclick="document.getElementById('homeBtn').click()" style="margin-top:1rem;padding:0.6rem 1rem;background:#6366f1;border:none;border-radius:8px;color:white;cursor:pointer;">Back to All Songs</button></div>`;
    return;
  }
  visibleSongs = songsList.filter((s) => pl.songs.includes(s.id));
  currentIdx = 0;
  currentView = "playlists";
  renderSongs();
  showToast(`Viewing: ${pl.name}`);
}

// ---------- Volume / mute ----------
audio.volume = 1;
volumeSlider.addEventListener("input", () => {
  audio.volume = parseFloat(volumeSlider.value);
  if (audio.volume === 0) btnMute.textContent = "🔇";
  else if (audio.volume < 0.5) btnMute.textContent = "🔈";
  else btnMute.textContent = "🔊";
});

btnMute.addEventListener("click", () => {
  if (audio.volume > 0) {
    audio.dataset.lastVol = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    btnMute.textContent = "🔇";
  } else {
    audio.volume = parseFloat(audio.dataset.lastVol || 1);
    volumeSlider.value = audio.volume;
    btnMute.textContent = audio.volume < 0.5 ? "🔈" : "🔊";
  }
});

// ---------- Progress bar & seeking ----------
progressContainer.addEventListener("click", (e) => {
  const w = progressContainer.clientWidth;
  const x = e.offsetX;
  const dur = audio.duration || 0;
  audio.currentTime = (x / w) * dur;
});

// Helper to update progress UI
function updateProgressUI() {
  const dur = audio.duration || 0;
  const cur = audio.currentTime || 0;
  const pct = dur ? (cur / dur) * 100 : 0;
  progressBarFill.style.width = `${pct}%`;
  currentTimeDisplay.textContent = formatTime(cur);
  durationDisplay.textContent = formatTime(dur);
}

// ---------- Audio event listeners ----------
audio.addEventListener("timeupdate", updateProgressUI);

// When audio ends -> play next automatically
audio.addEventListener("ended", () => {
  playNext();
});

// ---------- Player control buttons ----------
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", playNext);
prevBtn.addEventListener("click", playPrev);

// ---------- starting with that ----------
function init() {
  visibleSongs = songsList.slice();
  currentIdx = 0;
  renderSongs();

  // register service worker
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        /* ignore */
      });
    } catch (err) {
      /* ignore */
    }
  }
}

// run init
init();

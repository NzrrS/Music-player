// -------------------------------
// DOM ELEMENTS
// -------------------------------
const searchInput = document.getElementById("searchInput");
const suggestionSearch = document.getElementById("suggestionSearch");
const musicCurrentTime = document.getElementById("musicCurrentTime");
const musicPlayControl = document.getElementById("musicPlayControl");
const songAudio = document.getElementById("songAudio");
const replay5 = document.getElementById("replay5");
const forward5 = document.getElementById("forward5");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");

let songs = [];


// -------------------------------
// FETCH SONGS FROM DEEZER API
// -------------------------------
async function fetchSong(songName) {
  try {
    // use corsproxy.io to bypass CORS restrictions
    let res = await fetch(
      `https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(songName)}`
    );

    if (!res.ok) throw new Error("Response is not ok.");

    let data = await res.json();

    // filter results that contain song name
    songs = data.data.filter((song) =>
      song.title.toLowerCase().includes(songName)
    );
  } catch (err) {
    console.error("ERROR WHILE FETCHING SONG", err);
    songs = [];
  }
}


// -------------------------------
// SEARCH INPUT EVENT
// -------------------------------
searchInput.addEventListener("input", async function () {
  let songName = searchInput.value.trim().toLowerCase();

  // clear old suggestions
  suggestionSearch.innerHTML = "";

  if (!songName) {
    // hide suggestions if input is empty
    suggestionSearch.style.display = "none";
    return;
  }

  await fetchSong(songName);

  if (songs.length) {
    // add title for result list
    suggestionSearch.innerHTML = `<h4 style="color: white;" class="search-result-title">Search result</h4>`;
    suggestionSearch.style.display = "block";

    // build suggestion list
    songs.forEach((song) => {
      let li = document.createElement("li");
      li.classList.add("suggestion-result");

      // song image
      let divimg = document.createElement("div");
      divimg.classList.add("img-container");

      let img = document.createElement("img");
      img.src = song.album.cover_big;
      img.alt = "song img";
      img.classList.add("music-img");

      divimg.append(img);
      li.append(divimg);

      // song info
      let div = document.createElement("div");
      div.classList.add("music-result");

      let h5 = document.createElement("h5");
      h5.classList.add("song-result-name");
      h5.textContent = song.title;

      let h6 = document.createElement("h6");
      h6.classList.add("song-result-artist");
      h6.textContent = "Song- ";

      let span = document.createElement("span");
      span.classList.add("song-result-artist");
      span.textContent = song.artist.name;

      h6.append(span);
      div.append(h5, h6);
      li.append(div);

      // click event → play song
      li.addEventListener("click", () => {
        updatePlayer(song);
        playMusic(song);
      });

      suggestionSearch.append(li);
    });

  } else {
    // no results found
    suggestionSearch.innerHTML = "No result";
    suggestionSearch.style.color = "white";
    suggestionSearch.style.fontWeight = "400";
  }
});


// -------------------------------
// HIDE SUGGESTIONS WHEN CLICKING OUTSIDE
// -------------------------------
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("suggestion-result")) {
    suggestionSearch.style.display = "none";
    suggestionSearch.innerHTML = "";
  }
});


// -------------------------------
// UPDATE PLAYER UI
// -------------------------------
function updatePlayer(song) {
  searchInput.value = song.title;

  const imgSong = document.getElementById("imgSong");
  const musicInfoTitle = document.getElementById("musicInfoTitle");
  const musicInfoArtist = document.getElementById("musicInfoArtist");

  imgSong.src = song.album.cover_big;
  musicInfoTitle.textContent = song.title;
  musicInfoArtist.textContent = song.artist.name;

  // set background image
  document.body.style.background = `url("${song.album.cover_big}") no-repeat center center / cover`;
}


// -------------------------------
// PLAY / PAUSE MUSIC
// -------------------------------
function playMusic(song) {
  songAudio.src = song.preview;
  musicPlayControl.textContent = "pause";
  songAudio.play();
}

// toggle play/pause button
musicPlayControl.addEventListener("click", function () {
  if (songAudio) {
    if (songAudio.paused) {
      songAudio.play();
      musicPlayControl.textContent = "pause";
    } else {
      songAudio.pause();
      musicPlayControl.textContent = "play_arrow";
    }
  }
});


// -------------------------------
// MUSIC TIME + PROGRESS BAR
// -------------------------------
// update current time
songAudio.addEventListener("timeupdate", () => {
  let secs = Math.floor(songAudio.currentTime);
  if (secs < 10) secs = "0" + secs;
  musicCurrentTime.textContent = `00:${secs}`;

  // update progress bar width
  progress.style.width = (songAudio.currentTime / 30) * 100 + "%";
});

// click on progress bar → jump
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const newTime = (clickX / width) * 30;  
  songAudio.currentTime = newTime;
});


// -------------------------------
// REPLAY / FORWARD BUTTONS
// -------------------------------
replay5.addEventListener("click", () => {
  if (songAudio) {
    songAudio.currentTime = songAudio.currentTime - 5;
    if (songAudio.currentTime < 0) {
      songAudio.currentTime = 0;
    }
  }
});

forward5.addEventListener("click", () => {
  if (songAudio) {
    songAudio.currentTime = songAudio.currentTime + 5;
    if (songAudio.currentTime > 30) {
      songAudio.currentTime = 30;
    }
  }
});


// -------------------------------
// KEYBOARD SHORTCUTS
// -------------------------------
document.addEventListener("keydown", function (e) {
  // ignore when typing inside input/textarea
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  // spacebar → play/pause
  if (e.code === "Space") {
    if (musicPlayControl.textContent === " pause ") {
      musicPlayControl.textContent = " play_arrow ";
      songAudio.pause();
    } else {
      musicPlayControl.textContent = " pause ";
      songAudio.play();
    }
  }
});

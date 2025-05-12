const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector(".bg-green-600");
const othersongs = document.querySelector(".othersongs");
const player = document.querySelector(".player");
const progressbar = document.querySelector(".progressbar");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
let currentAudio = null;
let currentSongIndex = -1; // Initialize to -1, updated when a song is selected
let songData = []; // To store the fetched song data

function searchSongs() {
    let songName = searchInput.value;

    function getSongs(songname) {
        return fetch(
            ` https://jiosaavanserver.onrender.com/result/?query=${songname}&lyrics=true`
        ).then((da) => da.json());
    }

    getSongs(songName)
        .then((data) => {
            console.log(data);
            songData = data; // Store the fetched data
            othersongs.innerHTML = "";
            currentSongIndex = -1; // Reset song index on new search

            for (let i = 0; i < data.length; i++) {
                function formatTime(seconds) {
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = Math.floor(seconds % 60);
                    const formatUnit = (unit) =>
                        unit < 10 ? String(unit).padStart(2, "0") : String(unit);
                    return `${formatUnit(minutes)}:${formatUnit(remainingSeconds)}`;
                }

                let songTime = formatTime(data[i].duration);
                othersongs.innerHTML +=
                    ` <div class="flex justify-between items-center hover:bg-zinc-800 p-2 rounded bar cursor-pointer" id="${i}" data-index="${i}">
                        <div class="flex-1 min-w-0 mr-4">
                            <span class="block text-sm font-medium text-white truncate">${i + 1}. ${data[i].song}</span>
                            <span class="block text-xs text-gray-400 truncate">${data[i].singers}</span>
                        </div>
                        <span class="text-sm text-gray-300">${songTime}</span>
                    </div>`;
            }

            const bar = document.querySelectorAll(".bar");

            bar.forEach(function (v) {
                v.addEventListener("click", function () {
                    const index = parseInt(this.dataset.index);
                    playSong(index);
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching songs:", error);
            othersongs.innerHTML = "<p class='text-red-500'>Error loading songs.</p>";
        });
}

function playSong(index) {
    if (index >= 0 && index < songData.length) {
        currentSongIndex = index;
        const m = songData[index];

        player.innerHTML = `
           <div class="rounded relative overflow-hidden bg-black w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32">
    <img src="${m.image}" alt="${m.song} cover" class="object-cover w-full h-full" />
</div>
<div class="text-white mt-2">
    <div class="text-base sm:text-lg font-semibold truncate">${m.song}</div>
    <div class="text-sm text-gray-400 truncate">${m.singers}</div>
</div>

        `;

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const formatUnit = (unit) =>
                unit < 10 ? String(unit).padStart(2, "0") : String(unit);
            return `${formatUnit(minutes)}:${formatUnit(remainingSeconds)}`;
        }

        progressbar.innerHTML =
            `<div class="flex items-center justify-between text-gray-400 text-xs mt-2">
                <span id="currentTime">00:00</span>
                <div id="progressBar" class="flex-1 mx-3 bg-gray-600 h-1 rounded-full cursor-pointer">
                    <div id="progress" class="bg-white h-1 rounded-full w-0"></div>
                </div>
                <span id="duration">${formatTime(m.duration)}</span>
            </div>`;

        if (currentAudio) {
            currentAudio.pause();
        }

        currentAudio = new Audio(m.media_url);

        const playBtn = document.getElementById("playPauseBtn");
        const playIcon = document.getElementById("playIcon");
        const pauseIcon = document.getElementById("pauseIcon");
        const currentTimeEl = document.getElementById("currentTime");
        const durationEl = document.getElementById("duration");
        const progress = document.getElementById("progress");
        const progressBar = document.getElementById("progressBar");

        playBtn.addEventListener("click", () => {
            if (currentAudio.paused) {
                currentAudio.play();
                playIcon.classList.add("hidden");
                pauseIcon.classList.remove("hidden");
            } else {
                currentAudio.pause();
                playIcon.classList.remove("hidden");
                pauseIcon.classList.add("hidden");
            }
        });

        currentAudio.addEventListener("timeupdate", () => {
            const percent =
                (currentAudio.currentTime / currentAudio.duration) * 100;
            progress.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
        });

        currentAudio.addEventListener("loadedmetadata", () => {
            durationEl.textContent = formatTime(currentAudio.duration);
        });

        progressBar.addEventListener("click", (e) => {
            const width = progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = currentAudio.duration;
            currentAudio.currentTime = (clickX / width) * duration;
        });

        currentAudio.play();
        playIcon.classList.add("hidden");
        pauseIcon.classList.remove("hidden");
    }
}

function playPreviousSong() {
    if (songData.length > 0) {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songData.length - 1; // Loop to the last song
        }
        playSong(currentSongIndex);
    }
}

function playNextSong() {
    if (songData.length > 0) {
        currentSongIndex++;
        if (currentSongIndex >= songData.length) {
            currentSongIndex = 0; // Loop to the first song
        }
        playSong(currentSongIndex);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const volumeControl = document.querySelector("#volume");

    if (volumeControl) {
        volumeControl.addEventListener("input", () => {
            if (currentAudio) {
                currentAudio.volume = volumeControl.value;
            } else {
                console.log("Volume changed, but no audio loaded yet.");
                // You could store the volume in a variable here if needed.
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (searchButton) {
        searchButton.addEventListener("click", searchSongs);
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                searchSongs();
            }
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", playPreviousSong);
    }

    if (nextButton) {
        nextButton.addEventListener("click", playNextSong);
    }
});
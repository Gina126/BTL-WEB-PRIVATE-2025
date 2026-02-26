
let currentMovie = null;
let currentEp = "1";
let currentServer = 0;
let selectedServerIdx = 0; 

document.addEventListener("DOMContentLoaded", init);

function init() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    currentEp = params.get("ep") || "1";
    currentServer = parseInt(params.get("server") || "0");

    if (!slug) {
        showError(document.querySelector(".watch-page"), "Không tìm thấy phim!");
        return;
    }

    loadMovie(slug);
    initToolbar();
}

async function loadMovie(slug) {
    try {
        const res = await getMovieDetail(slug);
        if (!res.success) throw new Error("API failed");

        currentMovie = res.data.data.item;
        
        renderMovie();
        renderVideo();
        renderEpisodes();
        
        renderCastEnhanced(); 
        loadGallery();        
        loadRecommendations(); 
        renderRichComments(); 
        
        saveWatchHistory(currentMovie, currentEp, 0);
    } catch (e) {
        console.error("Load error:", e);
        const container = document.querySelector(".watch-page");
        if (container) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = "Lỗi tải phim: " + e.message;
            container.prepend(errorDiv);
        }
    }
}

async function renderCastEnhanced() {
    const grid = document.getElementById("cast-grid");
    if (!grid || !currentMovie) return;
    
    const simpleActors = currentMovie.actor || [];
    
    try {
        const res = await getMoviePeoples(currentMovie.slug);
        
        if (res.success && res.data?.data?.peoples && res.data.data.peoples.length > 0) {
            const peoples = res.data.data.peoples;
            
            grid.innerHTML = peoples.slice(0, 10).map(person => {
                const imgPath = person.profile_path 
                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                
                let displayName = person.name; 
                const isLatin = (str) => !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(str) && /[a-zA-Z]/.test(str);

                const candidates = [
                    person.name,
                    person.original_name,
                    ...(person.also_known_as || [])
                ];

                const bestName = candidates.find(n => n && isLatin(n));
                
                if (bestName) {
                    displayName = bestName;
                } else {
                    displayName = person.original_name || person.name;
                }
                
                const charName = person.character || "";

                return `
                    <div class="cast-item">
                        <img src="${imgPath}" 
                             alt="${displayName}" 
                             class="cast-avatar"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'">
                        <span class="cast-name">${displayName}<br><small style="color:#888">${truncateText(charName, 20)}</small></span>
                    </div>
                `;
            }).join("");
            return;
        }
    } catch (e) {
        console.error("Cast enhanced error:", e);
    }

    const validSimpleActors = simpleActors.filter(name => {
        return /[a-zA-Z]/.test(name) && !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(name);
    });

    if (validSimpleActors.length === 0) {
        grid.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;">Đang cập nhật diễn viên</p>';
        return;
    }

    grid.innerHTML = validSimpleActors.slice(0, 8).map((actor, idx) => {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
        const bgColor = colors[idx % colors.length];
        const initial = actor.charAt(0).toUpperCase();
        
        return `
        <div class="cast-item">
            <div class="cast-avatar" style="background: ${bgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                ${initial}
            </div>
            <span class="cast-name">${actor}</span>
        </div>
    `}).join("");
}



async function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid || !currentMovie) return;
    
    try {
        const res = await getMovieImages(currentMovie.slug);
        if (res.success && res.data?.data?.images && res.data.data.images.length > 0) {
            const images = res.data.data.images;
            const backdrops = images.filter(i => i.type === 'backdrop').slice(0, 6);
            const posters = images.filter(i => i.type === 'poster').slice(0, 4);
            const gallery = [...backdrops, ...posters];
            
            if (gallery.length === 0) {
                grid.innerHTML = '<p class="no-data">Không có hình ảnh</p>';
                return;
            }

            grid.innerHTML = gallery.map(img => {
                const imgUrl = `https://image.tmdb.org/t/p/${img.type === 'backdrop' ? 'w780' : 'w342'}${img.file_path}`;
                return `
                    <div class="gallery-item ${img.type}">
                        <img src="${imgUrl}" alt="Gallery Image" loading="lazy">
                    </div>
                `;
            }).join("");
            return;
        }
        grid.innerHTML = '<p class="no-data">Không có hình ảnh</p>';
    } catch(e) {
        console.error("Gallery error", e);
        grid.innerHTML = '<p class="no-data">Lỗi tải hình ảnh</p>';
    }
}

function renderMovie() {
    const safe = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    safe("movie-title", currentMovie.name);
    safe("movie-subtitle", currentMovie.origin_name || currentMovie.tmdb?.original_title || "");
    safe("imdb-score", currentMovie.imdb?.rating || currentMovie.tmdb?.vote_average || "N/A");
    
    safe("year", formatYear(currentMovie.year));
    const totalEp = currentMovie.episode_total || "??";
    const currentEpCount = currentMovie.episode_current || "??";
    safe("episode-info", `Tập ${totalEp}`);
    
    const seasonMatch = currentMovie.name.match(/Phần (\d+)/i);
    safe("season-info", seasonMatch ? `Phần ${seasonMatch[1]}` : "Phần 1");

    const sidebarRating = document.getElementById("sidebar-rating");
    if (sidebarRating) {
        sidebarRating.textContent = currentMovie.tmdb?.vote_average ? currentMovie.tmdb.vote_average.toFixed(1) : "N/A";
    }

    const statusText = document.getElementById("status-text");
    const statusIcon = document.querySelector(".completion-status i");
    if (statusText) {
        if (currentEpCount === totalEp || currentMovie.status === "completed") {
            statusText.textContent = `Đã hoàn thành: ${currentEpCount} / ${totalEp} tập`;
            statusText.parentElement.style.background = "#0f3d24"; 
            statusText.parentElement.style.color = "#2ecc71";
            if(statusIcon) statusIcon.className = "fas fa-check-circle";
        } else {
            statusText.textContent = `Đang cập nhật: ${currentEpCount} / ${totalEp} tập`;
            statusText.parentElement.style.background = "#3d2c0f"; 
            statusText.parentElement.style.color = "#f1c40f";
            if(statusIcon) statusIcon.className = "fas fa-clock";
        }
    }

    const descEl = document.getElementById("movie-description");
    if (descEl && currentMovie.content) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = currentMovie.content;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";
        
        const maxLength = 250;
        if (cleanText.length > maxLength) {
            const shortText = cleanText.substring(0, maxLength);
            descEl.innerHTML = `${shortText}<span class="description-more-link" onclick="location.href='./detail.html?slug=${currentMovie.slug}'" title="Xem thông tin chi tiết">...</span>`;
        } else {
            descEl.innerHTML = `${cleanText} <span class="description-more-link-small" onclick="location.href='./detail.html?slug=${currentMovie.slug}'" title="Xem thông tin chi tiết">[Chi tiết]</span>`;
        }
    } else if (descEl) {
        descEl.textContent = "Đang cập nhật mô tả...";
    }

    const poster = document.getElementById("movie-poster");
    if (poster) {
        const cdnUrl = "https://img.ophim.live/uploads/movies/";
        const imgPath = currentMovie.poster_url || currentMovie.thumb_url;
        poster.src = imgPath.startsWith('http') ? imgPath : (cdnUrl + imgPath);
        poster.onerror = () => poster.src = "https://placehold.co/200x300/1a1c26/666?text=Error";
    }

    const headerTitle = document.getElementById("header-movie-title");
    if (headerTitle) {
        headerTitle.textContent = currentMovie.name;
    }

    const genres = document.getElementById("movie-genres");
    if (genres && currentMovie.category) {
        genres.innerHTML = currentMovie.category
            .map(c => `<span class="genre-tag">${c.name}</span>`)
            .join("");
    }

    document.title = `${currentMovie.name} - Xem Phim - ${APP_CONFIG.APP_NAME}`;
}
function renderVideo() {
    const episodes = currentMovie.episodes;
    if (!episodes || episodes.length === 0) return;

    const server = episodes[currentServer];
    if (!server) return;

    const ep = server.server_data.find(e => e.name === currentEp) || server.server_data[0];
    if (!ep) return;

    const iframe = document.getElementById("video-iframe");
    const video = document.getElementById("hls-player");
    
    const m3u8Url = ep.link_m3u8;
    const embedUrl = ep.link_embed;

    if (m3u8Url && m3u8Url.includes('.m3u8')) {
        if (iframe) iframe.style.display = "none";
        const qualitySelector = document.getElementById("quality-selector");
        
        if (video) {
            video.style.display = "block";
            if (Hls.isSupported()) {
                const hls = new Hls({
                    capLevelToPlayerSize: false, 
                    startLevel: -1 
                });
                hls.loadSource(m3u8Url);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(e => console.log("Autoplay blocked"));
                    
                    if (qualitySelector) {
                        qualitySelector.style.display = "block";
                        setupQualitySelector(hls);
                    }

                    initCustomControls(video);
                });
                hls.on(Hls.Events.LEVEL_SWITCHED, function(event, data) {
                    const label = document.getElementById("current-quality-label");
                    if (label && hls.autoLevelEnabled) {
                        const height = hls.levels[data.level].height;
                        label.textContent = `Auto (${height}p)`;
                    }
                });

                video.onended = () => {
                    console.log("Video ended, triggering auto-next...");
                    playNextEpisode();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = m3u8Url;
                if (qualitySelector) qualitySelector.style.display = "none";
                video.addEventListener('loadedmetadata', function() {
                    video.play().catch(e => console.log("Autoplay blocked"));
                });
                
                video.onended = () => playNextEpisode();
            }
        }
    } else {
        const qualitySelector = document.getElementById("quality-selector");
        if (qualitySelector) qualitySelector.style.display = "none";

        if (video) {
            video.pause();
            video.style.display = "none";
        }
        if (iframe) {
            iframe.style.display = "block";
            iframe.src = embedUrl || "";
        }
    }

    const url = `${window.location.pathname}?slug=${currentMovie.slug}&ep=${ep.name}&server=${currentServer}`;
    window.history.pushState({}, "", url);
}

function setupQualitySelector(hls) {
    const selectorContainer = document.getElementById("quality-selector");
    const currentBtn = document.getElementById("quality-current-btn");
    const menu = document.getElementById("quality-menu");
    const label = document.getElementById("current-quality-label");

    if (!currentBtn || !menu || !selectorContainer) return;

    const levels = hls.levels;
    
    if (levels.length <= 1) {
        selectorContainer.style.display = "none";
        return;
    }

    selectorContainer.style.display = "block";

    currentBtn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    };

    document.addEventListener("click", () => menu.classList.remove("active"));

    let html = `<div class="quality-item ${hls.autoLevelEnabled ? 'active' : ''}" data-level="-1">Tự động (Auto)</div>`;
    
    const sortedLevels = [...levels].map((level, index) => ({ ...level, index })).sort((a, b) => b.height - a.height);

    html += sortedLevels.map(level => {
        return `<div class="quality-item ${!hls.autoLevelEnabled && hls.currentLevel === level.index ? 'active' : ''}" data-level="${level.index}">
            ${level.height}p ${level.height >= 1080 ? ' <small style="color:#ffd875">FHD</small>' : ''}
        </div>`;
    }).join("");

    menu.innerHTML = html;

    menu.querySelectorAll(".quality-item").forEach(item => {
        item.onclick = function() {
            const level = parseInt(this.getAttribute("data-level"));
            hls.currentLevel = level;
            
            menu.querySelectorAll(".quality-item").forEach(i => i.classList.remove("active"));
            this.classList.add("active");
            
            if (level === -1) {
                label.textContent = "Auto";
            } else {
                label.textContent = `${levels[level].height}p`;
            }
            
            menu.classList.remove("active");
        };
    });
}

function initCustomControls(video) {
    const container = document.getElementById("player-container");
    const controls = document.getElementById("custom-controls");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const rewindBtn = document.getElementById("rewind-btn");
    const forwardBtn = document.getElementById("forward-btn");
    const volumeBtn = document.getElementById("volume-btn");
    const volumeSlider = document.getElementById("volume-slider");
    const seekbar = document.getElementById("seekbar");
    const seekbarProgress = document.getElementById("seekbar-progress");
    const currentTimeEl = document.getElementById("current-time");
    const durationTimeEl = document.getElementById("duration-time");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const autoNextToggle = document.getElementById("auto-next-toggle");

    if (!video || !controls) return;

    controls.style.display = "flex";

    const togglePlay = () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    };

    playPauseBtn.onclick = togglePlay;
    video.onclick = togglePlay;

    rewindBtn.onclick = () => { video.currentTime -= 10; };
    forwardBtn.onclick = () => { video.currentTime += 10; };

    volumeSlider.oninput = (e) => {
        video.volume = e.target.value;
        updateVolumeIcon(video.volume);
    };

    volumeBtn.onclick = () => {
        if (video.volume > 0) {
            video.dataset.lastVolume = video.volume;
            video.volume = 0;
            volumeSlider.value = 0;
        } else {
            video.volume = parseFloat(video.dataset.lastVolume) || 1;
            volumeSlider.value = video.volume;
        }
        updateVolumeIcon(video.volume);
    };

    function updateVolumeIcon(vol) {
        const icon = volumeBtn.querySelector("i");
        if (vol === 0) icon.className = "fas fa-volume-mute";
        else if (vol < 0.5) icon.className = "fas fa-volume-down";
        else icon.className = "fas fa-volume-up";
    }

    video.ontimeupdate = () => {
        const percent = (video.currentTime / video.duration) * 100;
        seekbar.value = percent;
        seekbarProgress.style.width = percent + "%";
        currentTimeEl.textContent = formatTime(video.currentTime);
    };

    video.onloadedmetadata = () => {
        durationTimeEl.textContent = formatTime(video.duration);
    };

    seekbar.oninput = (e) => {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
    };

    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                alert(`Error: ${err.message}`);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    };

    video.onended = () => {
        if (autoNextToggle.checked) {
            console.log("Auto-next enabled, switching...");
            playNextEpisode();
        } else {
            console.log("Auto-next disabled, stopping.");
            playPauseBtn.innerHTML = '<i class="fas fa-redo"></i>';
        }
    };

    let timeout;
    container.onmousemove = () => {
        controls.classList.add("active");
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!video.paused) controls.classList.remove("active");
        }, 3000);
    };

    document.onkeydown = (e) => {
        if (document.activeElement.tagName === "INPUT") return;
        
        if (e.code === "Space") { e.preventDefault(); togglePlay(); }
        if (e.code === "ArrowRight") video.currentTime += 10;
        if (e.code === "ArrowLeft") video.currentTime -= 10;
        if (e.code === "ArrowUp") { e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); volumeSlider.value = video.volume; updateVolumeIcon(video.volume); }
        if (e.code === "ArrowDown") { e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); volumeSlider.value = video.volume; updateVolumeIcon(video.volume); }
    };
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function loadSeasons(movieName, currentSeasonNum) {
    const seasonList = document.getElementById("season-list");
    if (!seasonList) return;

    const baseName = movieName.replace(/[\(\[\-]?\s*Phần \d+\s*[\)\]]?/yi, "").trim();
    
    try {
        const res = await searchMovies(baseName);
        if (res.success && res.data?.data?.items) {
            const related = res.data.data.items.filter(m => m.name.toLowerCase().includes(baseName.toLowerCase()));
            
            const seasonsMap = [];
            
            related.forEach(m => {
                const match = m.name.match(/Phần (\d+)/i);
                let sNum = 1;
                if (match) {
                    sNum = parseInt(match[1]);
                } else {
                    if (m.name.length < baseName.length + 5) sNum = 1; 
                    else return; 
                }
                
                seasonsMap.push({
                    num: sNum,
                    name: `Phần ${sNum}`,
                    slug: m.slug,
                    id: m._id
                });
            });

            if (seasonsMap.length > 0) {
                const uniqueSeasons = Array.from(new Map(seasonsMap.map(item => [item.num, item])).values());
                uniqueSeasons.sort((a,b) => a.num - b.num);
                
                seasonList.innerHTML = uniqueSeasons.map(s => {
                    const isActive = s.num === currentSeasonNum;
                    return `
                        <a href="${isActive ? '#' : `watch.html?slug=${s.slug}`}" 
                           class="season-item ${isActive ? 'active' : ''}">
                           ${s.name}
                        </a>
                    `;
                }).join("");
            }
        }
    } catch (e) {
        console.error("Error loading seasons:", e);
    }
}

function toggleSeasonDropdown() {
    const dropdown = document.querySelector('.season-selector');
    const content = document.getElementById("season-dropdown-content");
    if (dropdown && content) {
        const isShowing = content.classList.contains("show");
        if (isShowing) {
            content.classList.remove("show");
            dropdown.classList.remove("active");
        } else {
            content.classList.add("show");
            dropdown.classList.add("active");
        }
    }
}

function initEpisodeControls(episodes) {
    const serverTabs = document.getElementById("server-tabs");
    const seasonList = document.getElementById("season-list");
    const currentSeasonText = document.getElementById("current-season-text");

    if (!serverTabs) return;

    serverTabs.innerHTML = episodes.map((server, idx) => `
        <button class="server-btn ${idx === selectedServerIdx ? 'active' : ''}" 
                onclick="switchServerTab(${idx})">
            ${server.server_name}
        </button>
    `).join("");

    if (seasonList && currentSeasonText) {
        const seasonMatch = currentMovie.name.match(/Phần (\d+)/i);
        const currentSeasonNum = seasonMatch ? parseInt(seasonMatch[1]) : 1;
        const currentSeasonName = `Phần ${currentSeasonNum}`;
        
        currentSeasonText.textContent = currentSeasonName;
        
        seasonList.innerHTML = `<a href="#" class="season-item active">${currentSeasonName}</a>`;

        loadSeasons(currentMovie.name, currentSeasonNum);
    }

    document.addEventListener('click', function(e) {
        const dropdown = document.querySelector('.season-selector');
        const content = document.getElementById("season-dropdown-content");
        if (dropdown && content && !dropdown.contains(e.target)) {
            content.classList.remove('show');
            dropdown.classList.remove('active');
        }
    });
}

function selectSeason(seasonName) {
    document.getElementById("current-season-text").textContent = seasonName;
    document.getElementById("season-dropdown-content").classList.remove("show");
}

function switchServerTab(idx) {
    selectedServerIdx = idx;
    
    document.querySelectorAll(".server-btn").forEach((btn, i) => {
        if (i === idx) btn.classList.add("active");
        else btn.classList.remove("active");
    });

    renderEpisodes();
}

function renderEpisodes() {
    const grid = document.getElementById("episodes-grid");
    if (!grid || !currentMovie) return;

    const episodes = currentMovie.episodes;
    if (!episodes || episodes.length === 0) {
        grid.innerHTML = '<p class="no-data">Chưa có tập phim</p>';
        return;
    }

    if (grid.innerHTML === "") {
        initEpisodeControls(episodes);
    }

    grid.innerHTML = "";
    
    const currentServerData = episodes[selectedServerIdx];
    if (!currentServerData) return;

    currentServerData.server_data.forEach(ep => {
        const isPlaying = (ep.name === currentEp && selectedServerIdx === currentServer);
        
        const card = document.createElement("div");
        card.className = `episode-card ${isPlaying ? "active" : ""}`;
        card.innerHTML = `<span class="ep-number">${ep.name}</span>`;
        
        card.onclick = () => playEpisode(ep.name, selectedServerIdx);
        grid.appendChild(card);
    });
}

function playEpisode(epName, serverIdx) {
    currentEp = epName;
    currentServer = serverIdx;
    selectedServerIdx = serverIdx; 
    renderVideo();
    
    document.querySelectorAll(".server-btn").forEach((btn, i) => {
        if (i === serverIdx) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    
    renderEpisodes();
    
    saveWatchHistory(currentMovie, epName, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function playNextEpisode() {
    if (!currentMovie) return;
    
    const episodes = currentMovie.episodes;
    const currentServerData = episodes[currentServer];
    if (!currentServerData) return;

    const serverData = currentServerData.server_data;
    const currentIndex = serverData.findIndex(e => e.name === currentEp);
    
    if (currentIndex !== -1 && currentIndex < serverData.length - 1) {
        const nextEp = serverData[currentIndex + 1];
        console.log("Auto-next: Playing episode", nextEp.name);
        playEpisode(nextEp.name, currentServer);
    } else {
        console.log("Reached last episode of the current server.");
    }
}

async function loadRecommendations() {
    const list = document.getElementById("recommendations-list");
    if (!list) return;

    renderSkeleton("recommendations-list", 6);

    try {
        const res = await getRecommendedMovies(currentMovie.category || [], 6);
        if (!res.success || !res.data?.data?.items) {
            list.innerHTML = '<p class="no-data">Không có đề xuất</p>';
            return;
        }

        list.innerHTML = res.data.data.items.slice(0, 6).map(m => createMovieCard(m)).join("");
    } catch (e) {
        console.error("Recommendations error:", e);
        list.innerHTML = '<p class="no-data">Lỗi tải đề xuất</p>';
    }
}

function initToolbar() {
    const lightsBtn = document.getElementById("lights-btn");
    lightsBtn?.addEventListener("click", () => {
        document.body.classList.toggle("lights-off");
        const isOff = document.body.classList.contains("lights-off");
        if (lightsBtn.querySelector("span")) {
            lightsBtn.querySelector("span").textContent = isOff ? "Bật đèn" : "Tắt đèn";
        }
    });

    const favBtn = document.getElementById("favorite-btn");
    favBtn?.addEventListener("click", () => {
        if (!currentMovie) return;
        toggleFavorite(currentMovie);
        updateFavButton();
    });

    const shareBtn = document.getElementById("share-btn");
    shareBtn?.addEventListener("click", async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: currentMovie?.name || "Xem phim",
                    url: window.location.href
                });
            } catch (e) {}
        } else {
            const success = await copyToClipboard(window.location.href);
            showToast(success ? "Đã copy link!" : "Lỗi copy", success ? "success" : "error");
        }
    });
}

function updateFavButton() {
    const btn = document.getElementById("favorite-btn");
    if (!btn || !currentMovie) return;

    const icon = btn.querySelector("i");
    const isFav = isInFavorites(currentMovie.slug);
    

    if (icon) {
        icon.className = isFav ? "fas fa-heart" : "far fa-heart";
    }
}

const COMMENT_DATA = [
    {
        id: 1,
        type: 'comment',
        user: "ngiahan0407",
        avatar: "assets/images/defaults/default-avatar1.jpg",
        badges: [{icon: "fas fa-infinity", color: "#f1c40f"}],
        sentiment: { text: "Tuyệt vời", class: "sentiment-awesome" }, 
        time: "42 phút trước",
        content: "mêeeeee",
        replies: 0
    },
    {
        id: 2,
        type: 'comment',
        user: "Thanh Thảo",
        avatar: "assets/images/defaults/default-avatar2.jpg",
        badges: [{icon: "fas fa-venus", color: "#e84393"}], 
        sentiment: { text: "Tuyệt vời", class: "sentiment-awesome" },
        time: "một ngày trước",
        content: "kết happy ending, ai cũng dễ thương, chờ tỏ tình mòn mỏi",
        replies: 0
    },
    {
        id: 3,
        type: 'comment',
        user: "Thu Lee Anh",
        avatar: "assets/images/defaults/default-avatar3.jpg",
        badges: [{icon: "fas fa-venus", color: "#e84393"}],
        sentiment: { text: "Tuyệt vời", class: "sentiment-awesome" },
        time: "một ngày trước",
        content: "Lâu lắm rồi mới tìm được phim hợp gu",
        replies: 0
    }
];

const RATING_DATA = [
    {
        id: 101,
        type: 'rating',
        user: "Minh Khôi",
        avatar: "assets/images/defaults/default-avatar4.jpg",
        badges: [],
        rating: 10,
        time: "2 giờ trước",
        content: "Phim quá đỉnh, 10/10 không bàn cãi!",
        replies: 0
    },
    {
        id: 102,
        type: 'rating',
        user: "Hải Yến",
        avatar: "assets/images/defaults/default-avatar5.jpg",
        badges: [{icon: "fas fa-venus", color: "#e84393"}],
        rating: 9,
        time: "5 giờ trước",
        content: "Cốt truyện hay, nhạc phim xuất sắc.",
        replies: 0
    }
];

let activeCommentTab = 'comments'; 

function renderRichComments() {
    const list = document.getElementById("rich-comment-list");
    const countDisplay = document.getElementById("comment-count-display");
    const titleText = document.querySelector(".cmt-tab-btn"); 
    if (!list) return;

    const data = activeCommentTab === 'comments' ? COMMENT_DATA : RATING_DATA;
    const count = data.length;
    
    if (countDisplay) countDisplay.textContent = count;
    if (titleText) {
        titleText.innerHTML = `<i class="fas fa-comment-alt"></i> ${activeCommentTab === 'comments' ? 'Bình luận' : 'Đánh giá'} ( <span id="comment-count-display">${count}</span> )`;
    }

    list.innerHTML = data.map(c => {
        const badgesHtml = (c.badges || []).map(b => `<i class="${b.icon}" style="color: ${b.color}; margin-left:5px; font-size:12px;"></i>`).join("");
        
        let sentimentHtml = "";
        if (c.sentiment) {
            sentimentHtml = `<span class="sentiment-badge ${c.sentiment.class}"><i class="fas fa-fire-alt"></i> ${c.sentiment.text}</span>`;
        } else if (c.rating) {
            sentimentHtml = `<span class="sentiment-badge sentiment-good"><i class="fas fa-star"></i> ${c.rating}/10</span>`;
        }

        return `
        <div class="comment-item-rich">
            <img src="${c.avatar}" class="user-avatar" alt="${c.user}" style="background:#333; padding:2px;">
            <div class="comment-content-wrapper">
                <div class="comment-header">
                    ${sentimentHtml}
                    <span class="user-name" style="margin-left: 8px;">${c.user}</span>
                    ${badgesHtml}
                    <span class="time-text" style="margin-left: 8px; opacity: 0.6;">${c.time}</span>
                </div>
                <div class="comment-body" style="margin-top: 5px;">${c.content}</div>
                <div class="comment-actions" style="margin-top: 8px;">
                    <div class="action-link"><i class="fas fa-arrow-up circle-icon"></i></div>
                    <div class="action-link"><i class="fas fa-arrow-down circle-icon"></i></div>
                    <div class="action-link" style="font-size:12px; font-weight:500;"><i class="fas fa-reply"></i> Trả lời</div>
                    <div class="action-link"><i class="fas fa-ellipsis-h"></i> Thêm</div>
                </div>
            </div>
        </div>
    `}).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll('.toggle-pill .pill-btn');
    pills.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            pills.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (index === 0) { 
                activeCommentTab = 'comments';
            } else { 
                activeCommentTab = 'ratings';
            }
            renderRichComments();
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const scrollToComments = () => {
        const section = document.getElementById('comments-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    document.getElementById('btn-rate-action')?.addEventListener('click', scrollToComments);
    document.getElementById('btn-comment-scroll')?.addEventListener('click', scrollToComments);
});

document.addEventListener("click", (e) => {
    if (e.target.closest(".send-btn")) {
        e.preventDefault();
        showToast("Vui lòng đăng nhập để bình luận", "info");
    }
});

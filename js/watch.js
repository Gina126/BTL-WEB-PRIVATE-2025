/**
 * watch.js - Watch Page Logic
 * Sử dụng: api.js, utils.js, config.js, main.js
 */

// State
let currentMovie = null;
let currentEp = "1";
let currentServer = 0; // Index of the server in dataset
let selectedServerIdx = 0; // Selected tab index

// Initialize
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
    // initTabs(); // Removed main tab logic
    initToolbar();
}

// Load movie data using api.js
async function loadMovie(slug) {
    try {
        const res = await getMovieDetail(slug);
        if (!res.success) throw new Error("API failed");

        // IMPORTANT: API structure is res.data.data.item
        currentMovie = res.data.data.item;
        
        // Render immediately
        renderMovie();
        renderVideo();
        renderEpisodes();
        
        // Load additional data async
        renderCastEnhanced(); 
        loadGallery();        
        loadRecommendations(); 
        renderRichComments(); 
        
        // Save to history
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

// Render Cast Enhanced (TMDB Peoples)
async function renderCastEnhanced() {
    const grid = document.getElementById("cast-grid");
    if (!grid || !currentMovie) return;
    
    // First try to load minimal cast from currentMovie (names only)
    const simpleActors = currentMovie.actor || [];
    
    try {
        // Try fetching detailed peoples data
        const res = await getMoviePeoples(currentMovie.slug);
        
        // If success and has cast data
        if (res.success && res.data?.data?.peoples && res.data.data.peoples.length > 0) {
            const peoples = res.data.data.peoples;
            
            grid.innerHTML = peoples.slice(0, 10).map(person => {
                // Image Path: Use TMDB if available, else generic placeholder
                const imgPath = person.profile_path 
                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                
                // Name prioritization logic: prefer Latin (ASCII) names
                let displayName = person.name; // Default
                
                // Helper to check if string is Latin-based (not CJK)
                // We check if it has NO Chinese/Japanese/Korean chars and at least SOME alphabetic chars
                const isLatin = (str) => !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(str) && /[a-zA-Z]/.test(str);

                const candidates = [
                    person.name,
                    person.original_name,
                    ...(person.also_known_as || [])
                ];

                // Find first Latin name
                const bestName = candidates.find(n => n && isLatin(n));
                
                if (bestName) {
                    displayName = bestName;
                } else {
                    // Fallback to original_name if no Latin found
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

    // Fallback to simple list if API fails or empty
    // Filter out non-Latin names to avoid Chinese/Japanese characters
    // Regex matches common CJK ranges
    const validSimpleActors = simpleActors.filter(name => {
        // Must contain at least one Latin letter AND must NOT contain CJK chars
        return /[a-zA-Z]/.test(name) && !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(name);
    });

    if (validSimpleActors.length === 0) {
        grid.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;">Đang cập nhật diễn viên</p>';
        return;
    }

    // Original logic for simple actors
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



// Load Gallery
async function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid || !currentMovie) return;
    
    try {
        const res = await getMovieImages(currentMovie.slug);
        if (res.success && res.data?.data?.images && res.data.data.images.length > 0) {
            const images = res.data.data.images;
            // Mix posters and backdrops
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

// Tab switching - REMOVED (Layout is now vertical)
// function initTabs() { ... }

// Render movie info using utils.js formatters
function renderMovie() {
    const safe = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    safe("movie-title", currentMovie.name);
    safe("movie-subtitle", currentMovie.origin_name || currentMovie.tmdb?.original_title || "");
    
    // IMDb Score: Prioritize IMDb field, fallback to TMDB only if missing
    // User requested distinction between IMDb and TMDB
    safe("imdb-score", currentMovie.imdb?.rating || currentMovie.tmdb?.vote_average || "N/A");
    
    // safe("quality", currentMovie.quality || "HD"); // Removed old badges
    
    safe("year", formatYear(currentMovie.year));
    // safe("duration", formatDuration(currentMovie.time)); // Removed

    // Episode Info
    const totalEp = currentMovie.episode_total || "??";
    const currentEpCount = currentMovie.episode_current || "??";
    safe("episode-info", `Tập ${totalEp}`);
    
    // Update Season Info (Mock logic if empty, usually part of name)
    const seasonMatch = currentMovie.name.match(/Phần (\d+)/i);
    safe("season-info", seasonMatch ? `Phần ${seasonMatch[1]}` : "Phần 1");

    // Populate Sidebar TMDB Rating
    const sidebarRating = document.getElementById("sidebar-rating");
    if (sidebarRating) {
        sidebarRating.textContent = currentMovie.tmdb?.vote_average ? currentMovie.tmdb.vote_average.toFixed(1) : "N/A";
    }

    // Completion Status
    const statusText = document.getElementById("status-text");
    const statusIcon = document.querySelector(".completion-status i");
    if (statusText) {
        if (currentEpCount === totalEp || currentMovie.status === "completed") {
            statusText.textContent = `Đã hoàn thành: ${currentEpCount} / ${totalEp} tập`;
            statusText.parentElement.style.background = "#0f3d24"; // Green
            statusText.parentElement.style.color = "#2ecc71";
            if(statusIcon) statusIcon.className = "fas fa-check-circle";
        } else {
            statusText.textContent = `Đang cập nhật: ${currentEpCount} / ${totalEp} tập`;
            statusText.parentElement.style.background = "#3d2c0f"; // Yellow/Orange
            statusText.parentElement.style.color = "#f1c40f";
            if(statusIcon) statusIcon.className = "fas fa-clock";
        }
    }

    // Description - strip HTML tags properly
    const descEl = document.getElementById("movie-description");
    if (descEl && currentMovie.content) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = currentMovie.content;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";
        descEl.textContent = truncateText(cleanText, 300);
    } else if (descEl) {
        descEl.textContent = "Đang cập nhật...";
    }


    // Poster
    const poster = document.getElementById("movie-poster");
    if (poster) {
        const cdnUrl = "https://img.ophim.live/uploads/movies/";
        const imgPath = currentMovie.poster_url || currentMovie.thumb_url;
        // Add CDN domain if path doesn't start with http
        poster.src = imgPath.startsWith('http') ? imgPath : (cdnUrl + imgPath);
        poster.onerror = () => poster.src = "https://placehold.co/200x300/1a1c26/666?text=Error";
    }

    // Header Title (New Back to Movie Header)
    const headerTitle = document.getElementById("header-movie-title");
    if (headerTitle) {
        headerTitle.textContent = currentMovie.name;
    }

    // Genres
    const genres = document.getElementById("movie-genres");
    if (genres && currentMovie.category) {
        genres.innerHTML = currentMovie.category
            .map(c => `<span class="genre-tag">${c.name}</span>`)
            .join("");
    }

    // Update title
    document.title = `${currentMovie.name} - Xem Phim - ${APP_CONFIG.APP_NAME}`;
}

// Render video player
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
        // Use Hls.js if supported
        if (iframe) iframe.style.display = "none";
        const qualitySelector = document.getElementById("quality-selector");
        
        if (video) {
            video.style.display = "block";
            if (Hls.isSupported()) {
                const hls = new Hls({
                    capLevelToPlayerSize: false, // Ensure full quality is available
                    startLevel: -1 // Auto
                });
                hls.loadSource(m3u8Url);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(e => console.log("Autoplay blocked"));
                    
                    // Setup Quality Selector
                    if (qualitySelector) {
                        qualitySelector.style.display = "block";
                        setupQualitySelector(hls);
                    }
                });

                // Listen for level switch to update label
                hls.on(Hls.Events.LEVEL_SWITCHED, function(event, data) {
                    const label = document.getElementById("current-quality-label");
                    if (label && hls.autoLevelEnabled) {
                        const height = hls.levels[data.level].height;
                        label.textContent = `Auto (${height}p)`;
                    }
                });

                // Auto-next on video end
                video.onended = () => {
                    console.log("Video ended, triggering auto-next...");
                    playNextEpisode();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari (HLS native support doesn't provide level info easily)
                video.src = m3u8Url;
                if (qualitySelector) qualitySelector.style.display = "none";
                video.addEventListener('loadedmetadata', function() {
                    video.play().catch(e => console.log("Autoplay blocked"));
                });
                
                // Auto-next for Safari
                video.onended = () => playNextEpisode();
            }
        }
    } else {
        // Fallback to Iframe
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

    // Update URL
    const url = `${window.location.pathname}?slug=${currentMovie.slug}&ep=${ep.name}&server=${currentServer}`;
    window.history.pushState({}, "", url);
}

/**
 * Setup Quality Selector UI and Logic
 */
function setupQualitySelector(hls) {
    const selectorContainer = document.getElementById("quality-selector");
    const currentBtn = document.getElementById("quality-current-btn");
    const menu = document.getElementById("quality-menu");
    const label = document.getElementById("current-quality-label");

    if (!currentBtn || !menu || !selectorContainer) return;

    // Populate levels
    const levels = hls.levels;
    
    // If only one level, hide the whole selector but keep HLS optimizations active
    if (levels.length <= 1) {
        selectorContainer.style.display = "none";
        return;
    }

    selectorContainer.style.display = "block";

    // Toggle menu
    currentBtn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    };

    // Close menu on click outside
    document.addEventListener("click", () => menu.classList.remove("active"));

    let html = `<div class="quality-item ${hls.autoLevelEnabled ? 'active' : ''}" data-level="-1">Tự động (Auto)</div>`;
    
    // Sort levels high to low
    const sortedLevels = [...levels].map((level, index) => ({ ...level, index })).sort((a, b) => b.height - a.height);

    html += sortedLevels.map(level => {
        return `<div class="quality-item ${!hls.autoLevelEnabled && hls.currentLevel === level.index ? 'active' : ''}" data-level="${level.index}">
            ${level.height}p ${level.height >= 1080 ? ' <small style="color:#ffd875">FHD</small>' : ''}
        </div>`;
    }).join("");

    menu.innerHTML = html;

    // Item click handler
    menu.querySelectorAll(".quality-item").forEach(item => {
        item.onclick = function() {
            const level = parseInt(this.getAttribute("data-level"));
            hls.currentLevel = level;
            
            // Update UI
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

// Load Seasons Logic
async function loadSeasons(movieName, currentSeasonNum) {
    const seasonList = document.getElementById("season-list");
    if (!seasonList) return;

    // 1. Extract base name (remove "Phần X", "Part X", etc.)
    const baseName = movieName.replace(/[\(\[\-]?\s*Phần \d+\s*[\)\]]?/yi, "").trim();
    
    // 2. Search for related movies
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

            // 4. Sort and Render ONLY if we found something reasonable
            if (seasonsMap.length > 0) {
                const uniqueSeasons = Array.from(new Map(seasonsMap.map(item => [item.num, item])).values());
                uniqueSeasons.sort((a,b) => a.num - b.num);
                
                // If we only found 1 season (current one), we still re-render to ensure consistency
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
        // On error, keep the default list (Current Season) created in init
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

// Update initEpisodeControls to handle outside click removal of active class
function initEpisodeControls(episodes) {
    const serverTabs = document.getElementById("server-tabs");
    const seasonList = document.getElementById("season-list");
    const currentSeasonText = document.getElementById("current-season-text");

    if (!serverTabs) return;

    // Render Server Tabs
    serverTabs.innerHTML = episodes.map((server, idx) => `
        <button class="server-btn ${idx === selectedServerIdx ? 'active' : ''}" 
                onclick="switchServerTab(${idx})">
            ${server.server_name}
        </button>
    `).join("");

    // Render Season List
    if (seasonList && currentSeasonText) {
        // Detect current season
        const seasonMatch = currentMovie.name.match(/Phần (\d+)/i);
        const currentSeasonNum = seasonMatch ? parseInt(seasonMatch[1]) : 1;
        const currentSeasonName = `Phần ${currentSeasonNum}`;
        
        currentSeasonText.textContent = currentSeasonName;
        
        // Initial state: just show current
        seasonList.innerHTML = `<a href="#" class="season-item active">${currentSeasonName}</a>`;

        // Load other seasons async
        loadSeasons(currentMovie.name, currentSeasonNum);
    }

    // Close dropdown when clicking outside
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
    // Logic to fetch/switch season data would go here
}

// Switch Server Tab
function switchServerTab(idx) {
    selectedServerIdx = idx;
    
    // Update active tab style
    document.querySelectorAll(".server-btn").forEach((btn, i) => {
        if (i === idx) btn.classList.add("active");
        else btn.classList.remove("active");
    });

    renderEpisodes();
}

// Render episodes grid (Updated)
function renderEpisodes() {
    const grid = document.getElementById("episodes-grid");
    if (!grid || !currentMovie) return;

    const episodes = currentMovie.episodes;
    if (!episodes || episodes.length === 0) {
        grid.innerHTML = '<p class="no-data">Chưa có tập phim</p>';
        return;
    }

    // Init controls if first render
    if (grid.innerHTML === "") {
        initEpisodeControls(episodes);
    }

    grid.innerHTML = "";
    
    // Get episodes from SELECTED server tab
    const currentServerData = episodes[selectedServerIdx];
    if (!currentServerData) return;

    currentServerData.server_data.forEach(ep => {
        // Check if this episode is currently playing
        const isPlaying = (ep.name === currentEp && selectedServerIdx === currentServer);
        
        const card = document.createElement("div");
        card.className = `episode-card ${isPlaying ? "active" : ""}`;
        card.innerHTML = `<span class="ep-number">${ep.name}</span>`;
        
        card.onclick = () => playEpisode(ep.name, selectedServerIdx);
        grid.appendChild(card);
    });
}

// Play episode
function playEpisode(epName, serverIdx) {
    currentEp = epName;
    currentServer = serverIdx;
    selectedServerIdx = serverIdx; // Sync selection
    renderVideo();
    
    // Re-render to update active state
    // Update tabs UI too
    document.querySelectorAll(".server-btn").forEach((btn, i) => {
        if (i === serverIdx) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    
    renderEpisodes();
    
    saveWatchHistory(currentMovie, epName, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Handle Auto-next Episode
 */
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

// Load recommendations async
async function loadRecommendations() {
    const list = document.getElementById("recommendations-list");
    if (!list) return;

    list.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        const res = await getRecommendedMovies(currentMovie.category || [], 6);
        if (!res.success || !res.data?.data?.items) {
            list.innerHTML = '<p class="no-data">Không có đề xuất</p>';
            return;
        }

        list.innerHTML = res.data.data.items.slice(0, 6).map(m => {
            const cdnUrl = "https://img.ophim.live/uploads/movies/";
            const imgPath = m.poster_url || m.thumb_url;
            const imgSrc = imgPath.startsWith('http') ? imgPath : (cdnUrl + imgPath);
            
            // Metadata parsing
            const originName = m.origin_name || m.tmdb?.original_title || "";
            const year = m.year || "????";
            
            // Season/Episode Logic
            const seasonMatch = m.name.match(/Phần (\d+)/i);
            const seasonText = seasonMatch ? `Phần ${seasonMatch[1]}` : "Phần 1";
            
            // Episode text logic
            // Use episode_current if available, else generic
            // Episode text logic
            let epText = m.quality || 'HD';
            if (m.episode_current) {
                const epLower = m.episode_current.toLowerCase();
                // Check for special keywords to display AS IS (no "Tập" prefix)
                if (epLower.includes("tập") || 
                    epLower.includes("full") || 
                    epLower.includes("trailer") || 
                    epLower.includes("hoàn tất") ||
                    epLower.includes("trọn bộ")) {
                    epText = m.episode_current;
                } else {
                    // Standard numbers get "Tập" prefix
                    epText = `Tập ${m.episode_current}`;
                }
            }

            return `
            <div class="rec-item" onclick="location.href='watch.html?slug=${m.slug}'">
                <img src="${imgSrc}" alt="${m.name}" 
                     loading="lazy"
                     onerror="this.src='https://placehold.co/100x140/1a1c26/666?text=POSTER'">
                <div class="rec-info">
                    <h4>${truncateText(m.name, 50)}</h4>
                    <p class="rec-subtitle">${originName}</p>
                    <div class="rec-meta">
                        <span class="meta-tag min-tag">${year}</span>
                        <span class="meta-bullet">•</span>
                        <span class="meta-text">${seasonText}</span>
                        <span class="meta-bullet">•</span>
                        <span class="meta-text">${epText}</span>
                    </div>
                </div>
            </div>
        `}).join("");
    } catch (e) {
        console.error("Recommendations error:", e);
        list.innerHTML = '<p class="no-data">Lỗi tải đề xuất</p>';
    }
}

// Toolbar interactions
function initToolbar() {
    // Lights off
    const lightsBtn = document.getElementById("lights-btn");
    lightsBtn?.addEventListener("click", () => {
        document.body.classList.toggle("lights-off");
        const isOff = document.body.classList.contains("lights-off");
        if (lightsBtn.querySelector("span")) {
            lightsBtn.querySelector("span").textContent = isOff ? "Bật đèn" : "Tắt đèn";
        }
    });

    // Favorite - using main.js
    const favBtn = document.getElementById("favorite-btn");
    favBtn?.addEventListener("click", () => {
        if (!currentMovie) return;
        toggleFavorite(currentMovie);
        updateFavButton();
    });

    // Share - using utils.js
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

// Update favorite button state
function updateFavButton() {
    const btn = document.getElementById("favorite-btn");
    if (!btn || !currentMovie) return;

    const icon = btn.querySelector("i");
    const isFav = isInFavorites(currentMovie.slug);
    

    if (icon) {
        icon.className = isFav ? "fas fa-heart" : "far fa-heart";
    }
}

// Rich Comments/Ratings Render
const COMMENT_DATA = [
    {
        id: 1,
        type: 'comment',
        user: "ngiahan0407",
        avatar: "assets/images/defaults/default-avatar1.jpg",
        badges: [{icon: "fas fa-infinity", color: "#f1c40f"}], // Infinity
        sentiment: { text: "Tuyệt vời", class: "sentiment-awesome" }, // Pink/Purple gradient
        time: "42 phút trước",
        content: "mêeeeee",
        replies: 0
    },
    {
        id: 2,
        type: 'comment',
        user: "Thanh Thảo",
        avatar: "assets/images/defaults/default-avatar2.jpg",
        badges: [{icon: "fas fa-venus", color: "#e84393"}], // Female
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

let activeCommentTab = 'comments'; // 'comments' or 'ratings'

function renderRichComments() {
    const list = document.getElementById("rich-comment-list");
    const countDisplay = document.getElementById("comment-count-display");
    const titleText = document.querySelector(".cmt-tab-btn"); // The main title button
    
    if (!list) return;

    const data = activeCommentTab === 'comments' ? COMMENT_DATA : RATING_DATA;
    const count = data.length;
    
    // Update Header Text & Count
    if (countDisplay) countDisplay.textContent = count;
    if (titleText) {
        // Update the label part if needed, currently it says "Bình luận" hardcoded in HTML
        // We can just update the count span inside it
        titleText.innerHTML = `<i class="fas fa-comment-alt"></i> ${activeCommentTab === 'comments' ? 'Bình luận' : 'Đánh giá'} ( <span id="comment-count-display">${count}</span> )`;
    }

    list.innerHTML = data.map(c => {
        // Generate Badges HTML
        const badgesHtml = (c.badges || []).map(b => `<i class="${b.icon}" style="color: ${b.color}; margin-left:5px; font-size:12px;"></i>`).join("");
        
        // Generate Sentiment HTML
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

// Init Tabs for Comment Section
document.addEventListener("DOMContentLoaded", () => {
    // Pill Toggle Logic
    const pills = document.querySelectorAll('.toggle-pill .pill-btn');
    pills.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            // Update UI state
            pills.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Switch Data
            if (index === 0) { // First button = Bình luận
                activeCommentTab = 'comments';
            } else { // Second button = Đánh giá
                activeCommentTab = 'ratings';
            }
            renderRichComments();
        });
    });
});

// Sidebar Interaction Events
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

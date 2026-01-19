/**
 * detail.js - Logic riêng cho trang chi tiết phim
 * 
 * File này xử lý:
 * - Hiển thị thông tin chi tiết phim
 * - Player video
 * - Danh sách tập phim
 * - Phim đề xuất
 * - Review/Comment (nếu có)
 */

// Biến global cho trang detail
let currentMovie = null;
let currentEpisode = 1;
let currentServer = 0;

/**
 * Khởi tạo trang chi tiết phim
 */
async function initDetailPage() {
    console.log('Initializing detail page...');
    
    // Lấy slug từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const episode = parseInt(urlParams.get('ep')) || 1;
    
    if (!slug) {
        showError(document.querySelector('main'), 'Không tìm thấy thông tin phim.');
        return;
    }
    
    // Load thông tin phim
    await loadMovieDetail(slug);
    
    // Load episode nếu có
    if (episode && currentMovie) {
        currentEpisode = episode;
        loadEpisode(episode);
    }
}

/**
 * Load thông tin chi tiết phim
 * @param {string} slug - Movie slug
 */
async function loadMovieDetail(slug) {
    const container = document.querySelector('main');
    showLoading(container);
    
    try {
        const result = await getMovieDetail(slug);
        
        if (result.success) {
            currentMovie = result.data.movie;
            renderMovieDetail(currentMovie, container);
            
            // Load phim đề xuất
            loadRecommendedMovies(currentMovie.category);
        } else {
            showError(container, 'Không thể tải thông tin phim.');
        }
    } catch (error) {
        console.error('Error loading movie detail:', error);
        showError(container, 'Đã xảy ra lỗi.');
    }
}

/**
 * Render thông tin chi tiết phim
 * @param {Object} movie - Movie object
 * @param {HTMLElement} container - Container element
 */
function renderMovieDetail(movie, container) {
    const html = `
        <div class="movie-detail">
            <!-- Video Player -->
            <div class="player-section">
                <div id="video-player" class="video-player">
                    <div class="player-placeholder">
                        <i class="fa-solid fa-play-circle"></i>
                        <p>Click vào tập phim bên dưới để xem</p>
                    </div>
                </div>
            </div>
            
            <!-- Movie Info -->
            <div class="movie-info-section">
                <div class="movie-header">
                    <div class="movie-poster">
                        <img src="${movie.poster_url || movie.thumb_url}" alt="${movie.name}" onerror="this.src='./assets/images/placeholder.jpg'">
                    </div>
                    
                    <div class="movie-meta">
                        <h1 class="movie-title">${movie.name}</h1>
                        <p class="movie-origin-name">${movie.origin_name || ''}</p>
                        
                        <div class="movie-stats">
                            ${movie.quality ? `<span class="badge">${movie.quality}</span>` : ''}
                            ${movie.lang ? `<span class="badge">${movie.lang}</span>` : ''}
                            ${movie.year ? `<span class="badge">${movie.year}</span>` : ''}
                            ${movie.time ? `<span class="badge"><i class="fa-regular fa-clock"></i> ${movie.time}</span>` : ''}
                        </div>
                        
                        <div class="movie-actions">
                            <button class="btn btn-primary" onclick="playFirstEpisode()">
                                <i class="fa-solid fa-play"></i> Xem Phim
                            </button>
                            <button class="btn btn-outline" onclick="toggleMovieFavorite()">
                                <i class="fa-${isInFavorites(movie.slug) ? 'solid' : 'regular'} fa-heart"></i>
                                ${isInFavorites(movie.slug) ? 'Đã yêu thích' : 'Yêu thích'}
                            </button>
                            <button class="btn btn-outline" onclick="shareMovie()">
                                <i class="fa-solid fa-share"></i> Chia sẻ
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Movie Details -->
                <div class="movie-details">
                    <div class="detail-row">
                        <span class="detail-label">Trạng thái:</span>
                        <span class="detail-value">${movie.episode_current || 'Đang cập nhật'}</span>
                    </div>
                    ${movie.category && movie.category.length > 0 ? `
                        <div class="detail-row">
                            <span class="detail-label">Thể loại:</span>
                            <span class="detail-value">
                                ${movie.category.map(cat => `<a href="/category.html?slug=${cat.slug}">${cat.name}</a>`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    ${movie.country && movie.country.length > 0 ? `
                        <div class="detail-row">
                            <span class="detail-label">Quốc gia:</span>
                            <span class="detail-value">
                                ${movie.country.map(c => `<a href="/country.html?slug=${c.slug}">${c.name}</a>`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    ${movie.director && movie.director.length > 0 ? `
                        <div class="detail-row">
                            <span class="detail-label">Đạo diễn:</span>
                            <span class="detail-value">${movie.director.join(', ')}</span>
                        </div>
                    ` : ''}
                    ${movie.actor && movie.actor.length > 0 ? `
                        <div class="detail-row">
                            <span class="detail-label">Diễn viên:</span>
                            <span class="detail-value">${movie.actor.join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Description -->
                ${movie.content ? `
                    <div class="movie-description">
                        <h3>Nội dung phim</h3>
                        <div class="description-content">${movie.content}</div>
                    </div>
                ` : ''}
                
                <!-- Episodes List -->
                ${movie.episodes && movie.episodes.length > 0 ? renderEpisodesList(movie.episodes) : ''}
            </div>
            
            <!-- Recommended Movies -->
            <div class="recommended-section">
                <h2>Phim Đề Xuất</h2>
                <div id="recommended-movies" class="movies-grid">
                    <div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render danh sách tập phim
 * @param {Array} episodes - Mảng episodes
 * @returns {string} - HTML string
 */
function renderEpisodesList(episodes) {
    if (!episodes || episodes.length === 0) return '';
    
    let html = '<div class="episodes-section"><h3>Danh sách tập</h3>';
    
    episodes.forEach((server, serverIndex) => {
        html += `
            <div class="server-group">
                <h4 class="server-name">${server.server_name || `Server ${serverIndex + 1}`}</h4>
                <div class="episodes-grid">
                    ${server.server_data.map((ep, index) => `
                        <button 
                            class="episode-btn ${index === currentEpisode - 1 ? 'active' : ''}" 
                            onclick="loadEpisode(${index + 1}, ${serverIndex})"
                            data-episode="${index + 1}"
                        >
                            ${ep.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Play tập đầu tiên
 */
function playFirstEpisode() {
    if (currentMovie && currentMovie.episodes && currentMovie.episodes.length > 0) {
        loadEpisode(1, 0);
        smoothScrollTo(document.getElementById('video-player'), 80);
    }
}

/**
 * Load và play một tập phim
 * @param {number} episodeNumber - Số tập
 * @param {number} serverIndex - Index của server
 */
async function loadEpisode(episodeNumber, serverIndex = 0) {
    if (!currentMovie || !currentMovie.episodes) return;
    
    currentEpisode = episodeNumber;
    currentServer = serverIndex;
    
    const server = currentMovie.episodes[serverIndex];
    if (!server) return;
    
    const episode = server.server_data[episodeNumber - 1];
    if (!episode) return;
    
    // Update active state cho buttons
    document.querySelectorAll('.episode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.episode-btn[data-episode="${episodeNumber}"]`)?.classList.add('active');
    
    // Render video player
    const playerContainer = document.getElementById('video-player');
    const embedUrl = episode.link_embed || episode.link_m3u8;
    
    if (embedUrl) {
        playerContainer.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                class="video-iframe"
            ></iframe>
        `;
        
        // Lưu lịch sử xem
        saveWatchHistory(currentMovie, episodeNumber);
        
        // Update URL
        const newUrl = `${window.location.pathname}?slug=${currentMovie.slug}&ep=${episodeNumber}`;
        window.history.pushState({}, '', newUrl);
    }
}

/**
 * Toggle favorite cho phim hiện tại
 */
function toggleMovieFavorite() {
    if (!currentMovie) return;
    
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    const text = button.querySelector('span') || button;
    
    if (isInFavorites(currentMovie.slug)) {
        removeFromFavorites(currentMovie.slug);
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        button.innerHTML = '<i class="fa-regular fa-heart"></i> Yêu thích';
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
    } else {
        addToFavorites({
            slug: currentMovie.slug,
            name: currentMovie.name,
            poster_url: currentMovie.poster_url || currentMovie.thumb_url
        });
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        button.innerHTML = '<i class="fa-solid fa-heart"></i> Đã yêu thích';
        showToast('Đã thêm vào danh sách yêu thích', 'success');
    }
}

/**
 * Chia sẻ phim
 */
async function shareMovie() {
    if (!currentMovie) return;
    
    const shareData = {
        title: currentMovie.name,
        text: `Xem phim ${currentMovie.name} trên RoPhim`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: Copy link
            const copied = await copyToClipboard(window.location.href);
            if (copied) {
                showToast('Đã copy link phim', 'success');
            }
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
}

/**
 * Load phim đề xuất
 * @param {Array} categories - Categories của phim hiện tại
 */
async function loadRecommendedMovies(categories) {
    const container = document.getElementById('recommended-movies');
    if (!container) return;
    
    try {
        const result = await getRecommendedMovies(categories, 12);
        
        if (result.success) {
            const movies = result.data.items || result.data.data?.items || [];
            const filteredMovies = movies.filter(m => m.slug !== currentMovie.slug).slice(0, 12);
            
            container.innerHTML = filteredMovies.map(movie => createMovieCard(movie)).join('');
        }
    } catch (error) {
        console.error('Error loading recommended movies:', error);
        container.innerHTML = '<p class="error-message">Không thể tải phim đề xuất</p>';
    }
}

// Tự động khởi tạo khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPage);
} else {
    initDetailPage();
}

// Export các hàm
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDetailPage,
        loadMovieDetail,
        loadEpisode,
        toggleMovieFavorite,
        shareMovie
    };
}

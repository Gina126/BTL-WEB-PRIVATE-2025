function truncateText(text, maxLength = APP_CONFIG.MAX_DESCRIPTION_LENGTH) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

function formatYear(year) {
  if (!year) return "Đang cập nhật";
  return year.toString();
}

function formatDuration(time) {
  if (!time) return "Đang cập nhật";
  return time;
}

function formatQuality(quality) {
  if (!quality) return "";

  const qualityClass = quality.toLowerCase().includes("hd")
    ? "quality-hd"
    : "quality-cam";
  return `<span class="badge ${qualityClass}">${quality}</span>`;
}

function formatStatus(status) {
  if (!status) return "";
  return `<span class="badge badge-status">${status}</span>`;
}

function formatCategories(categories) {
  if (!categories || categories.length === 0) return "Đang cập nhật";
  return categories.map((cat) => cat.name).join(", ");
}

function formatCountries(countries) {
  if (!countries || countries.length === 0) return "Đang cập nhật";
  return countries.map((country) => country.name).join(", ");
}

function createSlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function debounce(func, wait = APP_CONFIG.SEARCH_DEBOUNCE_TIME) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit = 1000) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
}

function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

function addToFavorites(movie) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);

  const exists = favorites.some((fav) => fav.slug === movie.slug);
  if (exists) return false;

  favorites.unshift({
    slug: movie.slug,
    name: movie.name,
    poster: movie.poster_url,
    addedAt: new Date().toISOString(),
  });

  return saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
}

function removeFromFavorites(slug) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);
  const filtered = favorites.filter((fav) => fav.slug !== slug);
  return saveToStorage(STORAGE_KEYS.FAVORITES, filtered);
}

function isInFavorites(slug) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);
  return favorites.some((fav) => fav.slug === slug);
}

function saveWatchHistory(movie, episode = 1, progress = 0) {
  const history = getFromStorage(STORAGE_KEYS.WATCH_HISTORY, []);

  const filtered = history.filter((item) => item.slug !== movie.slug);

  filtered.unshift({
    slug: movie.slug,
    name: movie.name,
    poster: movie.poster_url,
    episode: episode,
    progress: progress,
    watchedAt: new Date().toISOString(),
  });

  const limited = filtered.slice(0, 50);

  return saveToStorage(STORAGE_KEYS.WATCH_HISTORY, limited);
}

function showLoading(element) {
  if (!element) return;
  element.innerHTML =
    '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>';
}

function showError(element, message = "Có lỗi xảy ra. Vui lòng thử lại sau.") {
  if (!element) return;
  element.innerHTML = `<div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${message}</div>`;
}

function smoothScrollTo(element, offset = 0) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

function formatNumber(num) {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function createMovieCard(movie) {
  const thumb = movie.poster_url || movie.thumb_url || movie.poster || "";
  const finalImg = thumb.startsWith("http")
    ? thumb
    : `${API_CONFIG.IMAGE_HOST}${thumb}`;

  const slug = movie.slug || "";
  const safeSlug = encodeURIComponent(slug);
  const badge = movie.episode_current || movie.quality || "HD";
  const name = movie.name || "";
  const originName = movie.origin_name || "";
  const year = movie.year || "2026";

  const isFav = isInFavorites(slug);

  return `
    <div class="movie-card" data-slug="${slug}">
      <div class="movie-poster" onclick="location.href='./detail.html?slug=${safeSlug}'">
        <img src="${finalImg}" alt="${name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
        <div class="poster-overlay">
          <div class="play-icon"><i class="fas fa-play"></i></div>
        </div>
      </div>
      <div class="movie-badges">
        <span class="badge badge-quality">${badge}</span>
      </div>
      <button class="btn-favorite ${isFav ? "active" : ""}" 
              data-movie='${JSON.stringify({ slug, name, poster_url: thumb }).replace(/'/g, "&apos;")}'
              title="${isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}">
        <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
      </button>
      <div class="movie-info" onclick="location.href='./detail.html?slug=${safeSlug}'">
        <h3 class="movie-title" title="${name}">${name}</h3>
        <p class="movie-origin-name">${originName}</p>
        <div class="movie-meta">
          <span>${year}</span>
        </div>
      </div>
    </div>
  `;
}

function renderSkeleton(gridId, count = 6) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  let html = "";
  for (let i = 0; i < count; i++) {
    html += `
            <div class="skeleton-card">
                <div class="skeleton-poster skeleton-loading"></div>
                <div class="skeleton-title skeleton-loading"></div>
                <div class="skeleton-meta skeleton-loading"></div>
            </div>
        `;
  }
  grid.innerHTML = html;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    truncateText,
    formatYear,
    formatDuration,
    formatQuality,
    formatStatus,
    formatCategories,
    formatCountries,
    createSlug,
    debounce,
    throttle,
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    saveWatchHistory,
    showLoading,
    showError,
    smoothScrollTo,
    copyToClipboard,
    formatNumber,
    createMovieCard,
  };
}

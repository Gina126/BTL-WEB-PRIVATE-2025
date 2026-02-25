/**
 * utils.js - Các hàm utility dùng chung
 *
 * File này chứa các hàm phụ trợ như format ngày tháng,
 * rút gọn text, xử lý localStorage, debounce, throttle...
 */

/**
 * Rút gọn text về độ dài tối đa
 * @param {string} text - Text cần rút gọn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Text đã được rút gọn
 */
function truncateText(text, maxLength = APP_CONFIG.MAX_DESCRIPTION_LENGTH) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Format năm phát hành
 * @param {string|number} year - Năm
 * @returns {string} - Năm đã format
 */
function formatYear(year) {
  if (!year) return "Đang cập nhật";
  return year.toString();
}

/**
 * Format thời lượng phim
 * @param {string} time - Thời lượng (ví dụ: "120 phút")
 * @returns {string} - Thời lượng đã format
 */
function formatDuration(time) {
  if (!time) return "Đang cập nhật";
  return time;
}

/**
 * Format chất lượng phim
 * @param {string} quality - Chất lượng (HD, FullHD, CAM, etc.)
 * @returns {string} - HTML badge cho chất lượng
 */
function formatQuality(quality) {
  if (!quality) return "";

  const qualityClass = quality.toLowerCase().includes("hd")
    ? "quality-hd"
    : "quality-cam";
  return `<span class="badge ${qualityClass}">${quality}</span>`;
}

/**
 * Format trạng thái phim (Hoàn thành, Đang chiếu, etc.)
 * @param {string} status - Trạng thái
 * @returns {string} - HTML badge cho trạng thái
 */
function formatStatus(status) {
  if (!status) return "";
  return `<span class="badge badge-status">${status}</span>`;
}

/**
 * Format danh sách thể loại
 * @param {Array} categories - Mảng các category
 * @returns {string} - Chuỗi các thể loại ngăn cách bởi dấu phẩy
 */
function formatCategories(categories) {
  if (!categories || categories.length === 0) return "Đang cập nhật";
  return categories.map((cat) => cat.name).join(", ");
}

/**
 * Format danh sách quốc gia
 * @param {Array} countries - Mảng các country
 * @returns {string} - Chuỗi các quốc gia
 */
function formatCountries(countries) {
  if (!countries || countries.length === 0) return "Đang cập nhật";
  return countries.map((country) => country.name).join(", ");
}

/**
 * Tạo URL slug từ title
 * @param {string} title - Tiêu đề phim
 * @returns {string} - Slug
 */
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

/**
 * Debounce function - Trì hoãn thực thi hàm
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Hàm đã được debounce
 */
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

/**
 * Throttle function - Giới hạn số lần gọi hàm
 * @param {Function} func - Hàm cần throttle
 * @param {number} limit - Giới hạn thời gian (ms)
 * @returns {Function} - Hàm đã được throttle
 */
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

/**
 * Lưu dữ liệu vào localStorage
 * @param {string} key - Key
 * @param {any} value - Giá trị cần lưu
 * @returns {boolean} - true nếu thành công
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
}

/**
 * Lấy dữ liệu từ localStorage
 * @param {string} key - Key
 * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
 * @returns {any} - Dữ liệu đã parse
 */
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
}

/**
 * Xóa dữ liệu khỏi localStorage
 * @param {string} key - Key cần xóa
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

/**
 * Thêm phim vào danh sách yêu thích
 * @param {Object} movie - Đối tượng phim
 * @returns {boolean} - true nếu thêm thành công
 */
function addToFavorites(movie) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);

  // Kiểm tra xem phim đã có trong favorites chưa
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

/**
 * Xóa phim khỏi danh sách yêu thích
 * @param {string} slug - Slug của phim
 * @returns {boolean} - true nếu xóa thành công
 */
function removeFromFavorites(slug) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);
  const filtered = favorites.filter((fav) => fav.slug !== slug);
  return saveToStorage(STORAGE_KEYS.FAVORITES, filtered);
}

/**
 * Kiểm tra xem phim có trong danh sách yêu thích không
 * @param {string} slug - Slug của phim
 * @returns {boolean} - true nếu có trong favorites
 */
function isInFavorites(slug) {
  const favorites = getFromStorage(STORAGE_KEYS.FAVORITES, []);
  return favorites.some((fav) => fav.slug === slug);
}

/**
 * Lưu lịch sử xem phim
 * @param {Object} movie - Thông tin phim
 * @param {number} episode - Số tập đang xem
 * @param {number} progress - Tiến độ xem (seconds)
 */
function saveWatchHistory(movie, episode = 1, progress = 0) {
  const history = getFromStorage(STORAGE_KEYS.WATCH_HISTORY, []);

  // Xóa entry cũ nếu có
  const filtered = history.filter((item) => item.slug !== movie.slug);

  // Thêm entry mới lên đầu
  filtered.unshift({
    slug: movie.slug,
    name: movie.name,
    poster: movie.poster_url,
    episode: episode,
    progress: progress,
    watchedAt: new Date().toISOString(),
  });

  // Giới hạn 50 phim gần nhất
  const limited = filtered.slice(0, 50);

  return saveToStorage(STORAGE_KEYS.WATCH_HISTORY, limited);
}

/**
 * Hiển thị loading spinner
 * @param {HTMLElement} element - Element cần hiển thị loading
 */
function showLoading(element) {
  if (!element) return;
  element.innerHTML =
    '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>';
}

/**
 * Hiển thị thông báo lỗi
 * @param {HTMLElement} element - Element hiển thị lỗi
 * @param {string} message - Thông báo lỗi
 */
function showError(element, message = "Có lỗi xảy ra. Vui lòng thử lại sau.") {
  if (!element) return;
  element.innerHTML = `<div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${message}</div>`;
}

/**
 * Scroll mượt đến element
 * @param {HTMLElement} element - Element đích
 * @param {number} offset - Offset từ top (px)
 */
function smoothScrollTo(element, offset = 0) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Copy text vào clipboard
 * @param {string} text - Text cần copy
 * @returns {Promise<boolean>} - true nếu copy thành công
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

/**
 * Format số thành chuỗi có dấu phân cách
 * @param {number} num - Số cần format
 * @returns {string} - Số đã format
 */
function formatNumber(num) {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Tạo thẻ phim (Movie Card) chuẩn dùng chung cho toàn dự án
 * @param {Object} movie - Đối tượng phim
 * @returns {string} - HTML của thẻ phim
 */
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


/**
 * Render skeleton loading items
 * @param {string} gridId - ID của container grid
 * @param {number} count - Số lượng thẻ skeleton muốn hiện
 */
function renderSkeleton(gridId, count = 6) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    let html = '';
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

// Export các hàm
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

/**
 * api.js - Tất cả các hàm gọi API
 *
 * File này CHỈ chứa logic gọi API, không xử lý UI hay business logic khác
 * Tất cả các hàm đều trả về Promise
 */

/**
 * Hàm helper để gọi API với error handling
 * @param {string} url - URL đầy đủ của API
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise chứa data hoặc error
 */
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy danh sách phim mới cập nhật
 * @param {number} page - Số trang (mặc định: 1)
 * @returns {Promise} - Promise chứa danh sách phim
 */
async function getNewMovies(page = 1) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOVIES_LIST}?page=${page}`;
  return await fetchAPI(url);
}

/**
 * Lấy danh sách tất cả thể loại từ API
 * @returns {Promise} - Promise chứa danh sách thể loại
 */
async function getCategoriesList() {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES_LIST}`;
  return await fetchAPI(url);
}

/**
 * Lấy danh sách tất cả quốc gia từ API
 * @returns {Promise} - Promise chứa danh sách quốc gia
 */
async function getCountriesList() {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNTRIES_LIST}`;
  return await fetchAPI(url);
}

/**
 * Lấy chi tiết một bộ phim
 * @param {string} slug - Slug của phim (ví dụ: 'one-piece')
 * @returns {Promise} - Promise chứa thông tin chi tiết phim
 */
async function getMovieDetail(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_DETAIL.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return await fetchAPI(url);
}

/**
 * Tìm kiếm phim theo từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} page - Số trang
 * @returns {Promise} - Promise chứa kết quả tìm kiếm
 */
async function searchMovies(keyword, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.SEARCH.replace(
    "[keyword]",
    encodeURIComponent(keyword),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}&page=${page}`;
  return await fetchAPI(url);
}

/**
 * Lấy danh sách phim theo thể loại
 * @param {string} categorySlug - Slug của thể loại (ví dụ: 'hanh-dong')
 * @param {number} page - Số trang
 * @returns {Promise} - Promise chứa danh sách phim theo thể loại
 */
async function getMoviesByCategory(categorySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.CATEGORY.replace(
    "[slug]",
    encodeURIComponent(categorySlug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

/**
 * Lấy danh sách phim theo quốc gia
 * @param {string} countrySlug - Slug của quốc gia (ví dụ: 'han-quoc')
 * @param {number} page - Số trang
 * @returns {Promise} - Promise chứa danh sách phim theo quốc gia
 */
async function getMoviesByCountry(countrySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.COUNTRY.replace(
    "[slug]",
    encodeURIComponent(countrySlug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

/**
 * Lấy danh sách phim lẻ
 * Phim lẻ được xử lý như một thể loại trong API
 * @param {number} page - Số trang (hỗ trợ pagination)
 * @returns {Promise} - Promise chứa danh sách phim lẻ
 */
async function getSingleMovies(page = 1) {
  // Gọi API thể loại với slug 'phim-le', truyền page để hỗ trợ phân trang
  return await getMoviesByCategory("phim-le", page);
}

/**
 * Lấy danh sách phim bộ
 * Phim bộ được xử lý như một thể loại trong API
 * @param {number} page - Số trang (hỗ trợ pagination)
 * @returns {Promise} - Promise chứa danh sách phim bộ
 */
async function getSeriesMovies(page = 1) {
  // Gọi API thể loại với slug 'phim-bo', truyền page để hỗ trợ phân trang
  return await getMoviesByCategory("phim-bo", page);
}

/**
 * Lấy link xem phim (cho video player)
 * @param {string} slug - Slug của phim
 * @param {number} episode - Số tập (mặc định: 1 cho phim lẻ)
 * @returns {Promise} - Promise chứa link xem phim
 */
async function getMovieStreamLink(slug, episode = 1) {
  // Lấy thông tin chi tiết phim trước
  const result = await getMovieDetail(slug);

  if (!result.success) {
    return result;
  }

  try {
    const movie = result.data.movie;

    // Kiểm tra xem phim có episodes không
    if (!movie.episodes || movie.episodes.length === 0) {
      return { success: false, error: "Không tìm thấy tập phim" };
    }

    // Lấy server đầu tiên (thường là server chính)
    const serverData = movie.episodes[0];

    // Tìm tập phim theo số tập
    const episodeData = serverData.server_data.find(
      (ep) => ep.name === episode.toString(),
    );

    if (!episodeData) {
      return { success: false, error: "Không tìm thấy tập này" };
    }

    return {
      success: true,
      data: {
        link: episodeData.link_embed || episodeData.link_m3u8,
        slug: episodeData.slug,
        name: episodeData.name,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Lấy danh sách phim đề xuất (phim tương tự)
 * Dựa trên category của phim hiện tại
 * @param {Array} categories - Mảng các category của phim
 * @param {number} limit - Số lượng phim đề xuất
 * @returns {Promise} - Promise chứa danh sách phim đề xuất
 */
async function getRecommendedMovies(categories, limit = 12) {
  if (!categories || categories.length === 0) {
    return await getNewMovies(1);
  }

  // Lấy phim từ category đầu tiên
  const firstCategory = categories[0];
  return await getMoviesByCategory(firstCategory.slug, 1);
}

// Export các hàm để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchAPI,
    getNewMovies,
    getCategoriesList,
    getCountriesList,
    getMovieDetail,
    searchMovies,
    getMoviesByCategory,
    getMoviesByCountry,
    getSingleMovies,
    getSeriesMovies,
    getMovieStreamLink,
    getRecommendedMovies,
  };
}

/**
 * search.js - Logic cho trang kết quả tìm kiếm
 */

document.addEventListener("DOMContentLoaded", initSearch);

async function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("q");

  const titleElement = document.getElementById("searchTitle");
  const grid = document.getElementById("searchResultGrid");

  if (!keyword || keyword.trim() === "") {
    if (titleElement) titleElement.textContent = "Vui lòng nhập từ khóa";
    return;
  }

  if (titleElement) {
    titleElement.textContent = `Kết quả tìm kiếm cho: "${keyword}"`;
  }

  renderSearchResults(keyword);
}

async function renderSearchResults(keyword) {
  const grid = document.getElementById("searchResultGrid");
  if (!grid) return;

  grid.innerHTML = '<div class="loading-full"><i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm phim...</div>';

  try {
    const res = await searchMovies(keyword);
    
    if (!res.success || !res.data?.data?.items || res.data.data.items.length === 0) {
      grid.innerHTML = `<div class="no-results">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy phim nào với từ khóa "<strong>${keyword}</strong>"</p>
                <a href="index.html" class="btn-back-home">Quay lại trang chủ</a>
            </div>`;
      return;
    }

    const movies = res.data.data.items;
    const IMAGE_HOST = "https://img.ophim.live/uploads/movies/";

    grid.innerHTML = movies.map(movie => {
      const thumb = movie.thumb_url.startsWith('http') 
        ? movie.thumb_url 
        : `${IMAGE_HOST}${movie.thumb_url}`;
      
      const badge = movie.episode_current ? `Tập ${movie.episode_current}` : (movie.quality || "HD");
      const year = movie.year || "2024";

      return `
        <div class="movie-card" onclick="location.href='detail.html?slug=${movie.slug}'">
            <div class="badge">${badge}</div>
            <div class="movie-poster">
                <img src="${thumb}" alt="${movie.name}" loading="lazy" onerror="this.src='https://placehold.co/200x300/1a1c26/666?text=Lỗi+Ảnh'">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="movie-info">
                <h3 title="${movie.name}">${movie.name}</h3>
                <p>${year}</p>
            </div>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("Search Page Error:", error);
    grid.innerHTML = '<div class="error-message">Đã có lỗi xảy ra khi tải kết quả tìm kiếm.</div>';
  }
}

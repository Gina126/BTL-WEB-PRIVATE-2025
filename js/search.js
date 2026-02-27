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

  renderSkeleton("searchResultGrid", 12);

  try {
    const res = await searchMovies(keyword);

    if (
      !res.success ||
      !res.data?.data?.items ||
      res.data.data.items.length === 0
    ) {
      grid.innerHTML = `<div class="no-results">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy phim nào với từ khóa "<strong>${keyword}</strong>"</p>
                <a href="index.html" class="btn-back-home">Quay lại trang chủ</a>
            </div>`;
      return;
    }

    const movies = res.data.data.items;
    grid.innerHTML = movies.map((movie) => createMovieCard(movie)).join("");
  } catch (error) {
    console.error("Search Page Error:", error);
    grid.innerHTML =
      '<div class="error-message">Đã có lỗi xảy ra khi tải kết quả tìm kiếm.</div>';
  }
}

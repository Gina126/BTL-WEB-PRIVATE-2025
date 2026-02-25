const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-bo";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

let seriesGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  seriesGrid = document.getElementById("series-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  setupPaginationEvents();
  loadSeries(1);
});

async function loadSeries(page = 1) {
  currentPage = page;
  seriesGrid.innerHTML = `<p style="padding:20px">📺 Đang tải phim bộ...</p>`;

  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const json = await res.json();

    if (!json?.data?.items) {
      throw new Error("Không có dữ liệu phim bộ");
    }

    const totalItems = json.data.params.pagination.totalItems;
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    renderSeries(json.data.items);
    updatePagination();
  } catch (err) {
    console.error(err);
    seriesGrid.innerHTML = `
      <p style="padding:20px;color:red">
        ❌ Không thể tải danh sách phim bộ
      </p>
    `;
  }
}

function renderSeries(seriesList) {
  seriesGrid.innerHTML = "";

  seriesList.forEach((movie) => {
    const poster = movie.thumb_url
      ? `https://img.ophim1.com/uploads/movies/${movie.thumb_url}`
      : "https://placehold.co/300x450?text=No+Image";

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <div class="movie-badges">
        <span class="badge badge-episode">
          ${movie.episode_current || "Đang cập nhật"}
        </span>
        <span class="badge badge-subbed">
          ${movie.lang || "Vietsub"}
        </span>
      </div>

      <button class="btn-favorite">
        <i class="fa-regular fa-heart"></i>
      </button>

      <div class="movie-poster">
        <img 
          src="${poster}" 
          alt="${movie.name}"
          loading="lazy"
          onerror="this.src='https://placehold.co/300x450?text=No+Image'"
        />
        <div class="poster-overlay">
          <div class="play-icon">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
      </div>

      <div class="movie-info">
        <h3 class="movie-title">${movie.name}</h3>
        <p class="movie-origin-name">${movie.origin_name || ""}</p>

        <div class="movie-meta">
          <span>${movie.year || "?"}</span>
          <span>${movie.episode_total || "?"} tập</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `./detail.html?slug=${encodeURIComponent(movie.slug)}`;
    });

    seriesGrid.appendChild(card);
  });
}

function updatePagination() {
  currentPageEl.textContent = currentPage;
  totalPageEl.textContent = totalPages;

  firstBtn.disabled = currentPage === 1;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  lastBtn.disabled = currentPage === totalPages;
}

function setupPaginationEvents() {
  firstBtn.onclick = () => loadSeries(1);
  lastBtn.onclick = () => loadSeries(totalPages);

  prevBtn.onclick = () => {
    if (currentPage > 1) loadSeries(currentPage - 1);
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) loadSeries(currentPage + 1);
  };
}

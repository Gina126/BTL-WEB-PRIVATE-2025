const HISTORY_KEY = "watch_history";
const ITEMS_PER_PAGE = 12;

let currentPage = 1;
let totalPages = 1;
let historyData = [];

let historyGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  initElements();
  setupPaginationEvents();
  loadHistory();
});

function initElements() {
  historyGrid = document.getElementById("history-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");
}

function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    historyData = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("History parse error:", error);
    historyData = [];
  }

  historyData.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

  totalPages = Math.max(1, Math.ceil(historyData.length / ITEMS_PER_PAGE));

  if (currentPage > totalPages) currentPage = totalPages;

  renderHistory(currentPage);
  updatePagination();
}

function renderHistory(page) {
  historyGrid.innerHTML = "";

  if (historyData.length === 0) {
    historyGrid.innerHTML = `
      <div style="padding:40px;text-align:center;color:#aaa">
        <i class="fa-solid fa-film" style="font-size:48px;margin-bottom:12px;"></i>
        <p>Bạn chưa xem phim nào.</p>
        <a href="/movies.html" style="color:var(--primary-color)">
          Xem phim ngay →
        </a>
      </div>
    `;
    return;
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentItems = historyData.slice(start, end);

  currentItems.forEach((movie) => {
    const card = createMovieCard(movie);
    historyGrid.appendChild(card);
  });
}

function createMovieCard(movie) {
  const poster = movie.poster || "https://placehold.co/300x450?text=No+Image";

  const progressText =
    movie.progress && movie.progress > 0
      ? `Đã xem ${Math.floor(movie.progress)}%`
      : movie.episode
        ? `Đã xem Tập ${movie.episode}`
        : "Đã xem";

  const card = document.createElement("div");
  card.className = "movie-card";

  card.innerHTML = `
    <div class="movie-badges">
      <span class="badge badge-episode">${progressText}</span>
    </div>

    <button class="btn-favorite remove-btn" title="Xoá khỏi lịch sử">
      <i class="fa-solid fa-trash"></i>
    </button>

    <div class="movie-poster">
      <img 
        src="${poster}"
        alt="${movie.name}"
        loading="lazy"
        onerror="this.src='https://placehold.co/300x450?text=No+Image'"
      >
      <div class="poster-overlay">
        <div class="play-icon">
          <i class="fa-solid fa-play"></i>
        </div>
      </div>
    </div>

    <div class="movie-info">
      <h3 class="movie-title">${movie.name}</h3>
      <div class="movie-meta">
        <span>Xem lần cuối: ${formatDate(movie.watchedAt)}</span>
      </div>
    </div>
  `;

  card.querySelector(".movie-poster").addEventListener("click", () => {
    window.location.href = `/detail.html?slug=${movie.slug}`;
  });

  card.querySelector(".remove-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    removeFromHistory(movie.slug);
  });

  return card;
}

function removeFromHistory(slug) {
  historyData = historyData.filter((item) => item.slug !== slug);
  saveHistory();
  loadHistory();
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
}

function clearAllHistory() {
  if (!confirm("Bạn có chắc muốn xoá toàn bộ lịch sử?")) return;

  historyData = [];
  saveHistory();
  loadHistory();
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
  firstBtn.addEventListener("click", () => changePage(1));
  lastBtn.addEventListener("click", () => changePage(totalPages));

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) changePage(currentPage - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) changePage(currentPage + 1);
  });
}

function changePage(page) {
  currentPage = page;
  renderHistory(page);
  updatePagination();
}

function formatDate(dateString) {
  if (!dateString) return "Không rõ";

  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

// ================== TEST DATA ==================
// function addTestHistory() {
//   const testData = [
//     {
//       slug: "naruto",
//       name: "Naruto",
//       poster: "https://placehold.co/300x450?text=Naruto",
//       watchedAt: new Date().toISOString(),
//       progress: 60,
//       episode: 120,
//     },
//     {
//       slug: "one-piece",
//       name: "One Piece",
//       poster: "https://placehold.co/300x450?text=One+Piece",
//       watchedAt: new Date(Date.now() - 86400000).toISOString(),
//       progress: 30,
//       episode: 1000,
//     },
//   ];

//   localStorage.setItem(HISTORY_KEY, JSON.stringify(testData));
// }
// addTestHistory();

const HISTORY_KEY = "watch_history";
const ITEMS_PER_PAGE = 12;

let currentPage = 1;
let totalPages = 1;
let historyData = [];

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  loadHistory();
});

function loadHistory() {
  const grid = document.getElementById("history-grid");

  try {
    historyData = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    historyData = [];
  }

  historyData.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

  totalPages = Math.max(1, Math.ceil(historyData.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  renderHistory();
  updatePagination();
}

function renderHistory() {
  const grid = document.getElementById("history-grid");
  grid.innerHTML = "";

  if (!historyData.length) {
    grid.innerHTML = `
      <div style="padding:40px;text-align:center;color:#aaa">
        <i class="fa-solid fa-film" style="font-size:48px"></i>
        <p>Bạn chưa xem phim nào.</p>
        <a href="/movies.html" style="color:var(--primary-color)">
          Xem phim ngay →
        </a>
      </div>
    `;
    return;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const items = historyData.slice(start, start + ITEMS_PER_PAGE);

  for (let movie of items) {
    const poster = movie.poster || "https://placehold.co/300x450?text=No+Image";

    const progressText =
      movie.progress > 0
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

      <button class="btn-favorite remove-btn">
        <i class="fa-solid fa-trash"></i>
      </button>

      <div class="movie-poster">
        <img src="${poster}" alt="${movie.name}">
      </div>

      <div class="movie-info">
        <h3>${movie.name}</h3>
        <span>Xem lần cuối: ${formatDate(movie.watchedAt)}</span>
      </div>
    `;
    card.querySelector(".movie-poster").onclick = () => goToDetail(movie.slug);
    card.querySelector(".movie-info h3").onclick = () => goToDetail(movie.slug);

    card.querySelector(".remove-btn").onclick = (e) => {
      e.stopPropagation();
      removeFromHistory(movie.slug);
    };

    grid.appendChild(card);
  }
}

function goToDetail(slug) {
  window.location.href = `/detail.html?slug=${encodeURIComponent(slug)}`;
}

function removeFromHistory(slug) {
  historyData = historyData.filter((item) => item.slug !== slug);
  saveHistory();
  loadHistory();
}

function clearAllHistory() {
  if (!confirm("Bạn có chắc muốn xoá toàn bộ lịch sử?")) return;
  historyData = [];
  saveHistory();
  loadHistory();
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
}

function updatePagination() {
  document.getElementById("currentPage").textContent = currentPage;
  document.getElementById("totalPage").textContent = totalPages;

  document.getElementById("firstPage").disabled = currentPage === 1;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
  document.getElementById("lastPage").disabled = currentPage === totalPages;
}

function setupEvents() {
  document.getElementById("firstPage").onclick = () => changePage(1);
  document.getElementById("lastPage").onclick = () => changePage(totalPages);
  document.getElementById("prevPage").onclick = () =>
    currentPage > 1 && changePage(currentPage - 1);
  document.getElementById("nextPage").onclick = () =>
    currentPage < totalPages && changePage(currentPage + 1);
}

function changePage(page) {
  currentPage = page;
  renderHistory();
  updatePagination();
}

function formatDate(dateString) {
  return dateString
    ? new Date(dateString).toLocaleDateString("vi-VN")
    : "Không rõ";
}

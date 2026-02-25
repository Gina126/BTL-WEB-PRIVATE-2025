// ================== CONFIG ==================
const HISTORY_KEY = "rophim_watch_history";
const ITEMS_PER_PAGE = 12;

// ================== STATE ==================
let currentPage = 1;
let totalPages = 1;
let historyData = [];

// ================== ELEMENTS ==================
let historyGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  initElements();
  setupPaginationEvents();
  loadHistory();
});

// ================== INIT ELEMENTS ==================
function initElements() {
  historyGrid = document.getElementById("history-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");
}

// ================== LOAD HISTORY ==================
function loadHistory() {
  // Hiển thị skeleton loading
  renderSkeleton("history-grid", 12);

  // Tạo một khoảng trễ nhỏ để giả lập quá trình nạp dữ liệu mượt mà
  setTimeout(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      historyData = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("History parse error:", error);
      historyData = [];
    }

    // Sắp xếp mới nhất trước
    historyData.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    totalPages = Math.max(1, Math.ceil(historyData.length / ITEMS_PER_PAGE));

    if (currentPage > totalPages) currentPage = totalPages;

    renderHistory(currentPage);
    updatePagination();
  }, 400);
}

// ================== RENDER ==================
function renderHistory(page) {
  historyGrid.innerHTML = "";

  if (historyData.length === 0) {
    historyGrid.innerHTML = `
      <div style="padding:40px;text-align:center;color:#aaa">
        <i class="fa-solid fa-film" style="font-size:48px;margin-bottom:12px;"></i>
        <p>Bạn chưa xem phim nào.</p>
        <a href="movies.html" style="color:var(--primary-color)">
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
    // Sử dụng card chuẩn
    const cardHtml = createMovieCard(movie);
    const temp = document.createElement("div");
    temp.innerHTML = cardHtml.trim();
    const card = temp.firstChild;

    // Bổ sung nút xóa lịch sử cạnh nút yêu thích
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove-history";
    removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    removeBtn.title = "Xóa khỏi lịch sử";
    removeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0,0,0,0.7);
      color: #fff;
      border: none;
      z-index: 10;
      cursor: pointer;
    `;
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeFromHistory(movie.slug);
    };
    card.appendChild(removeBtn);

    // Thay đổi link mặc định cho Poster (về watch thay vì detail)
    const poster = card.querySelector(".movie-poster");
    poster.onclick = () => {
      window.location.href = `watch.html?slug=${movie.slug}&ep=${movie.episode || "1"}`;
    };

    historyGrid.appendChild(card);
  });
}

// ================== REMOVE ==================
function removeFromHistory(slug) {
  historyData = historyData.filter((item) => item.slug !== slug);
  saveHistory();
  loadHistory();
}

// ================== SAVE ==================
function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
}

// ================== CLEAR ALL ==================
function clearAllHistory() {
  if (!confirm("Bạn có chắc muốn xoá toàn bộ lịch sử?")) return;

  historyData = [];
  saveHistory();
  loadHistory();
}

// ================== PAGINATION ==================
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

// ================== FORMAT DATE ==================
function formatDate(dateString) {
  if (!dateString) return "Không rõ";

  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

// ================== TEST DATA ==================
function addTestHistory() {
  const testData = [
    {
      slug: "naruto",
      name: "Naruto",
      poster: "https://placehold.co/300x450?text=Naruto",
      watchedAt: new Date().toISOString(),
      progress: 60,
      episode: 120,
    },
    {
      slug: "one-piece",
      name: "One Piece",
      poster: "https://placehold.co/300x450?text=One+Piece",
      watchedAt: new Date(Date.now() - 86400000).toISOString(),
      progress: 30,
      episode: 1000,
    },
  ];

  localStorage.setItem(HISTORY_KEY, JSON.stringify(testData));
}

// addTestHistory(); // ← Bỏ comment này để test, nhớ xóa sau

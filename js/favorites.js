// ================== CONFIG ==================
const FAVORITES_KEY =
  (typeof STORAGE_KEYS !== "undefined" && STORAGE_KEYS.FAVORITES) ||
  "rophim_favorites";
const ITEMS_PER_PAGE = 12;

// ================== STATE ==================
let currentPage = 1;
let totalPages = 1;
let favoritesData = [];

// ================== ELEMENTS ==================
let favoritesGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;
let clearFavoritesBtn;

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  initElements();
  setupPaginationEvents();
  setupActions();
  loadFavorites();
});

// ================== INIT ELEMENTS ==================
function initElements() {
  favoritesGrid = document.getElementById("favorites-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
}

// ================== ACTIONS ==================
function setupActions() {
  if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener("click", clearAllFavorites);
  }
}

// ================== LOAD ==================
function loadFavorites() {
  if (typeof renderSkeleton === "function") {
    renderSkeleton("favorites-grid", 12);
  }

  setTimeout(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      favoritesData = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(favoritesData)) favoritesData = [];
    } catch (error) {
      console.error("Favorites parse error:", error);
      favoritesData = [];
    }

    // Mới thêm trước (theo addedAt)
    favoritesData.sort(
      (a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0),
    );

    totalPages = Math.max(1, Math.ceil(favoritesData.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    renderFavorites(currentPage);
    updatePagination();
  }, 250);
}

// ================== RENDER ==================
function renderFavorites(page) {
  if (!favoritesGrid) return;
  favoritesGrid.innerHTML = "";

  if (favoritesData.length === 0) {
    favoritesGrid.innerHTML = `
      <div style="padding:40px;text-align:center;color:#aaa;grid-column:1/-1">
        <i class="fa-solid fa-heart-crack" style="font-size:48px;margin-bottom:12px;"></i>
        <p>Bạn chưa có phim yêu thích nào.</p>
        <a href="movies.html" style="color:var(--primary-color)">
          Khám phá phim ngay →
        </a>
      </div>
    `;
    return;
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentItems = favoritesData.slice(start, end);

  currentItems.forEach((movie) => {
    // createMovieCard dùng chung của project
    const cardHtml = createMovieCard(movie);
    const temp = document.createElement("div");
    temp.innerHTML = cardHtml.trim();
    const card = temp.firstElementChild;

    if (!card) return;

    // ✅ Ẩn icon/nút trái tim mặc định trên card ở trang Yêu thích
    const heartBtn =
      card.querySelector(".favorite-btn") ||
      card.querySelector(".btn-favorite") ||
      card.querySelector(".favorite-icon") ||
      card.querySelector("[data-favorite-btn]");

    if (heartBtn) {
      heartBtn.style.display = "none";
      // hoặc xóa hẳn: heartBtn.remove();
    }

    // ✅ Nút xóa riêng (góc trái) để user thao tác nhanh
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove-favorite-page";
    removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    removeBtn.title = "Xóa khỏi yêu thích";
    removeBtn.style.cssText = `
      position:absolute;
      top:10px;
      left:10px;
      width:32px;
      height:32px;
      border-radius:50%;
      background:rgba(0,0,0,0.7);
      color:#fff;
      border:none;
      z-index:11;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
    `;
    removeBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeFavoriteAndReload(movie.slug);
    };

    card.appendChild(removeBtn);

    // Option: thêm dòng ngày thêm (nếu muốn hiện)
    const info = card.querySelector(".movie-info");
    if (info && movie.addedAt) {
      const added = document.createElement("div");
      added.style.cssText = "font-size:12px;color:#aaa;margin-top:4px;";
      added.textContent = `Đã thêm: ${formatDate(movie.addedAt)}`;
      info.appendChild(added);
    }

    favoritesGrid.appendChild(card);
  });
}

// ================== REMOVE ==================
function removeFavoriteAndReload(slug) {
  if (typeof removeFromFavorites === "function") {
    removeFromFavorites(slug);
  } else {
    // fallback nếu utils chưa load vì lý do nào đó
    favoritesData = favoritesData.filter((item) => item.slug !== slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesData));
  }

  if (typeof showToast === "function") {
    showToast("Đã xóa khỏi danh sách yêu thích", "info");
  }

  // reload lại từ storage để đồng bộ UI / dữ liệu
  loadFavorites();
}

// ================== CLEAR ALL ==================
function clearAllFavorites() {
  if (favoritesData.length === 0) {
    if (typeof showToast === "function") {
      showToast("Danh sách yêu thích đang trống", "info");
    }
    return;
  }

  if (!confirm("Bạn có chắc muốn xoá toàn bộ danh sách yêu thích?")) return;

  localStorage.removeItem(FAVORITES_KEY);

  if (typeof showToast === "function") {
    showToast("Đã xóa toàn bộ danh sách yêu thích", "success");
  }

  currentPage = 1;
  loadFavorites();
}

// ================== PAGINATION ==================
function setupPaginationEvents() {
  if (firstBtn) firstBtn.addEventListener("click", () => changePage(1));
  if (lastBtn) lastBtn.addEventListener("click", () => changePage(totalPages));

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) changePage(currentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) changePage(currentPage + 1);
    });
  }
}

function changePage(page) {
  currentPage = page;
  renderFavorites(page);
  updatePagination();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updatePagination() {
  if (currentPageEl) currentPageEl.textContent = currentPage;
  if (totalPageEl) totalPageEl.textContent = totalPages;

  if (firstBtn) firstBtn.disabled = currentPage === 1;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  if (lastBtn) lastBtn.disabled = currentPage === totalPages;
}

// ================== FORMAT ==================
function formatDate(dateString) {
  if (!dateString) return "Không rõ";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return date.toLocaleDateString("vi-VN");
}

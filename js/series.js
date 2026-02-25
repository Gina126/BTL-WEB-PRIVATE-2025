// ================== CONFIG ==================
const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-bo";
const ITEMS_PER_PAGE = 24;

// ================== STATE ==================
let currentPage = 1;
let totalPages = 1;

// ================== ELEMENTS ==================
let seriesGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

// ================== INIT ==================
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

// ================== FETCH ==================
async function loadSeries(page = 1) {
  currentPage = page;
  renderSkeleton("series-grid", 12);

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

// ================== RENDER ==================
function renderSeries(seriesList) {
  seriesGrid.innerHTML = seriesList
    .map((movie) => createMovieCard(movie))
    .join("");
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
  firstBtn.onclick = () => loadSeries(1);
  lastBtn.onclick = () => loadSeries(totalPages);

  prevBtn.onclick = () => {
    if (currentPage > 1) loadSeries(currentPage - 1);
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) loadSeries(currentPage + 1);
  };
}

// ================== CONFIG ==================
const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-le";
const ITEMS_PER_PAGE = 24;

// ================== STATE ==================
let currentPage = 1;
let totalPages = 1;

// ================== ELEMENTS ==================
let moviesGrid;
let currentPageEl;
let totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  moviesGrid = document.getElementById("movies-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  setupPaginationEvents();
  loadMovies(1);
});

// ================== FETCH MOVIES ==================
async function loadMovies(page = 1) {
  currentPage = page;
  renderSkeleton("movies-grid", 12);

  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const json = await res.json();

    if (!json?.data?.items) {
      throw new Error("API không trả về dữ liệu");
    }

    const totalItems = json.data.params.pagination.totalItems;
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    renderMovies(json.data.items);
    updatePagination();
  } catch (error) {
    console.error(error);
    moviesGrid.innerHTML = `
      <p style="padding:20px;color:red">
        ❌ Không thể tải danh sách phim
      </p>
    `;
  }
}

// ================== RENDER ==================
function renderMovies(movies) {
  moviesGrid.innerHTML = movies.map((movie) => createMovieCard(movie)).join("");
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
  firstBtn.addEventListener("click", () => loadMovies(1));
  lastBtn.addEventListener("click", () => loadMovies(totalPages));

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) loadMovies(currentPage - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) loadMovies(currentPage + 1);
  });
}

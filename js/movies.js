const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-le";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

let moviesGrid, currentPageEl, totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  moviesGrid = document.getElementById("movies-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  firstBtn.onclick = () => loadMovies(1);
  lastBtn.onclick = () => loadMovies(totalPages);
  prevBtn.onclick = () => currentPage > 1 && loadMovies(currentPage - 1);
  nextBtn.onclick = () =>
    currentPage < totalPages && loadMovies(currentPage + 1);

  loadMovies(1);
});

async function loadMovies(page = 1) {
  currentPage = page;
  moviesGrid.innerHTML = "📺 Đang tải phim...";

  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const data = await res.json();
    const items = data?.data?.items;
    const totalItems = data?.data?.params?.pagination?.totalItems;

    if (!items?.length) {
      moviesGrid.innerHTML = "❌ Không có dữ liệu phim";
      totalPages = 1;
      return updatePagination();
    }

    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    moviesGrid.innerHTML = items.map(createMovieCard).join("");
    updatePagination();
  } catch (err) {
    console.error(err);
    moviesGrid.innerHTML = "❌ Không thể tải danh sách phim";
  }
}

function updatePagination() {
  currentPageEl.textContent = currentPage;
  totalPageEl.textContent = totalPages;

  firstBtn.disabled = prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = lastBtn.disabled = currentPage === totalPages;
}

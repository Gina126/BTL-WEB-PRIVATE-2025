const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-bo";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

let seriesGrid, currentPageEl, totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  seriesGrid = document.getElementById("series-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  firstBtn.onclick = () => loadSeries(1);
  lastBtn.onclick = () => loadSeries(totalPages);
  prevBtn.onclick = () => currentPage > 1 && loadSeries(currentPage - 1);
  nextBtn.onclick = () =>
    currentPage < totalPages && loadSeries(currentPage + 1);

  loadSeries(1);
});

async function loadSeries(page = 1) {
  currentPage = page;
  seriesGrid.innerHTML = "📺 Đang tải phim bộ...";

  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const data = await res.json();
    const items = data?.data?.items;
    const totalItems = data?.data?.params?.pagination?.totalItems;

    if (!items?.length) {
      seriesGrid.innerHTML = "❌ Không có dữ liệu phim bộ";
      totalPages = 1;
      return updatePagination();
    }

    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    seriesGrid.innerHTML = items.map(createMovieCard).join("");

    updatePagination();
  } catch (err) {
    console.error(err);
    seriesGrid.innerHTML = "❌ Không thể tải danh sách phim bộ";
  }
}

function updatePagination() {
  currentPageEl.textContent = currentPage;
  totalPageEl.textContent = totalPages;

  firstBtn.disabled = prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = lastBtn.disabled = currentPage === totalPages;
}

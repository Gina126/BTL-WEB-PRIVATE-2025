const API_URL = "https://ophim1.com/v1/api/danh-sach/phim-le";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", function () {
  setupEvents();
  loadMovies(1);
});

async function loadMovies(page = 1) {
  currentPage = page;

  const grid = document.getElementById("movies-grid");
  const currentEl = document.getElementById("currentPage");
  const totalEl = document.getElementById("totalPage");

  grid.innerHTML = "🎬 Đang tải phim...";

  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const data = await res.json();

    const items = data?.data?.items;
    const totalItems = data?.data?.params?.pagination?.totalItems;

    if (!items || items.length === 0) throw new Error("Không có dữ liệu");

    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    renderMovies(items);
    updatePagination(currentEl, totalEl);
  } catch (err) {
    console.error(err);
    grid.innerHTML = "❌ Không thể tải danh sách phim";
  }
}

function renderMovies(list) {
  const grid = document.getElementById("movies-grid");
  grid.innerHTML = "";

  for (let movie of list) {
    const poster = movie.thumb_url
      ? `https://img.ophim1.com/uploads/movies/${movie.thumb_url}`
      : "https://placehold.co/300x450?text=No+Image";

    grid.innerHTML += `
      <div class="movie-card" onclick="goToDetail('${movie.slug}')">
        <div class="movie-badges">
          <span class="badge badge-quality">${movie.quality || "HD"}</span>
          <span class="badge badge-subbed">${movie.lang || "Vietsub"}</span>
        </div>

        <button class="btn-favorite" onclick="toggleFavorite(event, '${movie.slug}')">
          <i id="heart-${movie.slug}">♡</i>
        </button>

        <div class="movie-poster">
          <img 
            src="${poster}" 
            alt="${movie.name}" 
          >
        </div>

        <div class="movie-info">
          <h3>${movie.name}</h3>
          <p>${movie.origin_name || ""}</p>
          <div>
            <span>${movie.year || "?"}</span>
            <span>${movie.time || "Đang cập nhật"}</span>
          </div>
        </div>
      </div>
    `;
  }
}

function toggleFavorite(event, slug) {
  event.stopPropagation();
  const heart = document.getElementById("heart-" + slug);
  if (heart.innerText === "♡") {
    heart.innerText = "♥";
    alert("Đã thêm vào yêu thích: " + slug);
  } else {
    heart.innerText = "♡";
    alert("Đã xóa khỏi yêu thích: " + slug);
  }
}

function goToDetail(slug) {
  window.location.href = `./detail.html?slug=${encodeURIComponent(slug)}`;
}

function updatePagination(currentEl, totalEl) {
  currentEl.textContent = currentPage;
  totalEl.textContent = totalPages;

  document.getElementById("firstPage").disabled = currentPage === 1;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
  document.getElementById("lastPage").disabled = currentPage === totalPages;
}

function setupEvents() {
  document.getElementById("firstPage").onclick = () => loadMovies(1);
  document.getElementById("lastPage").onclick = () => loadMovies(totalPages);
  document.getElementById("prevPage").onclick = () => {
    if (currentPage > 1) loadMovies(currentPage - 1);
  };
  document.getElementById("nextPage").onclick = () => {
    if (currentPage < totalPages) loadMovies(currentPage + 1);
  };
}

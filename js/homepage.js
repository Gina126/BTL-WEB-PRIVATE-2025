// js/homepage.js
/**
 * Render phim ra lưới
 */
function renderMoviesToGrid(movies, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!movies || movies.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; padding: 20px; color: #777;">Đang cập nhật phim...</p>`;
    return;
  }

  grid.innerHTML = movies.map((movie) => createMovieCard(movie)).join("");
}

async function initHomePage() {
  try {
    console.log("--- Khởi tạo trang chủ chuyên nghiệp ---");

    // Hiển thị Skeleton Loading trong khi chờ API
    renderSkeleton("movieGrid", 6);
    renderSkeleton("phimLeGrid", 6);
    renderSkeleton("phimBoGrid", 6);

    // 1. Danh sách URL API
    const API_NEW = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1";
    const API_SINGLE = "https://ophim1.com/v1/api/danh-sach/phim-le?page=1";
    const API_SERIES = "https://ophim1.com/v1/api/danh-sach/phim-bo?page=1";

    // 2. Gọi fetch đồng thời 3 danh sách
    const [resNew, resSingle, resSeries] = await Promise.all([
      fetch(API_NEW).then((r) => r.json()),
      fetch(API_SINGLE).then((r) => r.json()),
      fetch(API_SERIES).then((r) => r.json()),
    ]);

    const getMovies = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.items && Array.isArray(data.items)) return data.items;
      if (data.data && data.data.items && Array.isArray(data.data.items))
        return data.data.items;
      return [];
    };

    // 3. Xử lý Phim Mới & Banner
    const itemsNew = getMovies(resNew);
    if (itemsNew.length > 0) {
      // LẤY CHI TIẾT PHIM ĐẦU TIÊN để có IMDb, Content, Diễn viên làm Banner
      fetchDetailForHero(itemsNew[0].slug);
      renderMoviesToGrid(itemsNew.slice(0, 6), "movieGrid");
    } else {
      renderMoviesToGrid([], "movieGrid");
    }

    // 4. Xử lý Phim Lẻ
    const itemsSingle = getMovies(resSingle);
    renderMoviesToGrid(itemsSingle.slice(0, 6), "phimLeGrid");

    // 5. Xử lý Phim Bộ
    const itemsSeries = getMovies(resSeries);
    renderMoviesToGrid(itemsSeries.slice(0, 6), "phimBoGrid");
  } catch (error) {
    console.error("Lỗi khởi tạo:", error);
  }
}

/**
 * Hàm lấy chi tiết phim từ slug để hiển thị đầy đủ thông số lên Banner
 */
async function fetchDetailForHero(slug) {
  try {
    if (!slug) return;

    const res = await fetch(
      `https://ophim1.com/v1/api/phim/${encodeURIComponent(slug)}`,
    ).then((r) => r.json());

    if (res && res.data && res.data.item) {
      updateHero(res.data.item);
    }
  } catch (error) {
    console.error("Lỗi lấy chi tiết Banner:", error);
  }
}

/**
 * Cập nhật Banner với IMDb, Thể loại, Năm và Nội dung
 */
function updateHero(movie) {
  const title = document.getElementById("heroTitle");
  const desc = document.getElementById("heroDesc");
  const banner = document.getElementById("heroBanner");

  // Các phần tử Meta (nếu bạn đã thêm vào HTML)
  const imdb = document.getElementById("heroIMDb");
  const year = document.getElementById("heroYear");
  const category = document.getElementById("heroCategory");
  const quality = document.getElementById("heroQuality");

  if (title) title.innerText = (movie.name || "").toUpperCase();

  // Đổ thông số chi tiết
  if (imdb)
    imdb.innerText = movie.tmdb?.vote_average || movie.imdb?.count || "N/A";
  if (year) year.innerText = movie.year || "2026";
  if (quality) {
    const q = movie.quality || "";
    const lang = movie.lang ? ` (${movie.lang})` : "";
    quality.innerText = q ? q + lang : "HD";
  }

  // Đổ thể loại (Nối các tên thể loại bằng dấu chấm tròn)
  if (category && movie.category) {
    category.innerText = movie.category.map((c) => c.name).join(" • ");
  }

  if (desc) {
    let rawContent = movie.content || "Nội dung phim đang được cập nhật...";
    let cleanContent = String(rawContent).replace(/<[^>]*>?/gm, "");

    if (cleanContent.length > 250) {
      cleanContent = cleanContent.substring(0, 250) + "...";
    }
    desc.innerText = cleanContent;
  }

  if (banner) {
    // Poster ngang của OPhim thường là banner chất lượng cao
    const bg = movie.poster_url || movie.thumb_url || "";
    const finalBanner = bg.startsWith("http") ? bg : `${IMAGE_HOST}${bg}`;
    banner.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 100%), url('${finalBanner}')`;
  }
}


document.addEventListener("DOMContentLoaded", initHomePage);

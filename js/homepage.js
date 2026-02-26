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
    renderSkeleton("movieGrid", 6);
    renderSkeleton("phimLeGrid", 6);
    renderSkeleton("phimBoGrid", 6);

    const API_NEW = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1";
    const API_SINGLE = "https://ophim1.com/v1/api/danh-sach/phim-le?page=1";
    const API_SERIES = "https://ophim1.com/v1/api/danh-sach/phim-bo?page=1";

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

    const itemsNew = getMovies(resNew);
    if (itemsNew.length > 0) {
      fetchDetailForHero(itemsNew[0].slug);
      renderMoviesToGrid(itemsNew.slice(0, 6), "movieGrid");
    } else {
      renderMoviesToGrid([], "movieGrid");
    }

    const itemsSingle = getMovies(resSingle);
    renderMoviesToGrid(itemsSingle.slice(0, 6), "phimLeGrid");

    const itemsSeries = getMovies(resSeries);
    renderMoviesToGrid(itemsSeries.slice(0, 6), "phimBoGrid");
  } catch (error) {
    console.error("Lỗi khởi tạo:", error);
  }
}

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

function updateHero(movie) {
  const title = document.getElementById("heroTitle");
  const desc = document.getElementById("heroDesc");
  const banner = document.getElementById("heroBanner");

  const imdb = document.getElementById("heroIMDb");
  const year = document.getElementById("heroYear");
  const category = document.getElementById("heroCategory");
  const quality = document.getElementById("heroQuality");

  if (title) title.innerText = (movie.name || "").toUpperCase();

  if (imdb)
    imdb.innerText = movie.tmdb?.vote_average || movie.imdb?.count || "N/A";
  if (year) year.innerText = movie.year || "2026";
  if (quality) {
    const q = movie.quality || "";
    const lang = movie.lang ? ` (${movie.lang})` : "";
    quality.innerText = q ? q + lang : "HD";
  }

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
    const bg = movie.poster_url || movie.thumb_url || "";
    const finalBanner = bg.startsWith("http") ? bg : `${IMAGE_HOST}${bg}`;
    banner.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 100%), url('${finalBanner}')`;
  }
}

document.addEventListener("DOMContentLoaded", initHomePage);

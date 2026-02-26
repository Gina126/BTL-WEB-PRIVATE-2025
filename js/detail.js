const IMAGE_HOST = "https://img.ophim.live/uploads/movies/";

document.addEventListener("DOMContentLoaded", async () => {
  const slug = new URLSearchParams(window.location.search).get("slug");

  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const contentEl = document.getElementById("content");

  if (!slug) {
    showError("Không tìm thấy phim.");
    return;
  }

  try {
    const response = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);

    const res = await response.json();

    if (!res.status || !res.data) {
      showError("Không có dữ liệu phim.");
      return;
    }

    const movie = res.data.item;

    let episodes = movie.episodes || res.data.episodes || [];

    renderMovie(movie, episodes);

    loadRecommendations(movie.category);

    loadingEl.style.display = "none";
    contentEl.style.display = "block";
  } catch (err) {
    console.error(err);
    showError("Lỗi tải dữ liệu.");
  }

  function showError(msg) {
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    errorEl.textContent = msg;
  }
});

function renderMovie(movie, episodes) {
  const posterRaw = movie.poster_url || movie.thumb_url || "";
  const posterUrl = posterRaw.startsWith("http")
    ? posterRaw
    : IMAGE_HOST + posterRaw;

  document.getElementById("title").textContent = movie.name || "";
  document.getElementById("poster").src = posterUrl;

  const hero = document.getElementById("heroBanner");
  if (hero) {
    hero.style.backgroundImage = `url(${posterUrl})`;
  }

  document.getElementById("meta").innerHTML = `
    <span class="chip">${movie.year || ""}</span>
    <span class="chip">${movie.time || ""}</span>
    <span class="chip">${movie.quality || "HD"}</span>
    <span class="chip">${movie.lang || ""}</span>
  `;

  document.getElementById("desc").innerHTML = movie.content || "Chưa có mô tả.";

  document.getElementById("categories").textContent =
    movie.category?.map((c) => c.name).join(", ") || "";

  document.getElementById("countries").textContent =
    movie.country?.map((c) => c.name).join(", ") || "";

  document.getElementById("actors").textContent = Array.isArray(movie.actor)
    ? movie.actor.join(", ")
    : movie.actor || "";

  document.getElementById("directors").textContent = Array.isArray(
    movie.director,
  )
    ? movie.director.join(", ")
    : movie.director || "";

  renderEpisodes(movie.slug, episodes);

  const watchBtn = document.getElementById("watchBtn");

  if (watchBtn) {
    watchBtn.onclick = () => {
      if (!episodes || episodes.length === 0) {
        window.location.href = `watch.html?slug=${movie.slug}&ep=1`;
        return;
      }

      const firstServer = episodes[0];
      const firstEp = firstServer.server_data[0];

      window.location.href = `watch.html?slug=${movie.slug}&ep=${firstEp.slug}`;
    };
  }
}

function renderEpisodes(slug, episodes) {
  const container = document.getElementById("episodeList");

  if (!container) return;

  if (!episodes || episodes.length === 0) {
    container.innerHTML = `
      <button class="episode-btn"
        onclick="goToWatch('${slug}','1')">
        Xem phim
      </button>
    `;
    return;
  }

  let html = "";

  episodes.forEach((server) => {
    html += `
      <div style="margin:15px 0 8px;font-weight:600;">
        ${server.server_name}
      </div>
    `;

    server.server_data.forEach((ep) => {
      html += `
        <button class="episode-btn"
          onclick="goToWatch('${slug}','${ep.slug}')">
          Tập ${ep.name}
        </button>
      `;
    });
  });

  container.innerHTML = html;
}

function goToWatch(slug, ep) {
  window.location.href = `watch.html?slug=${slug}&ep=${ep}`;
}

async function loadRecommendations(categories) {
  const grid = document.getElementById("recommendationGrid");
  if (!grid) return;

  if (typeof renderSkeleton === "function") {
    renderSkeleton("recommendationGrid", 6);
  }

  try {
    const res = await getRecommendedMovies(categories, 6);

    if (res.success && res.data?.data?.items) {
      const movies = res.data.data.items;

      if (movies.length > 0) {
        grid.innerHTML = movies
          .slice(0, 6)
          .map((movie) => createMovieCard(movie))
          .join("");
      } else {
        grid.innerHTML =
          '<p style="grid-column: 1/-1; padding: 20px; color: #777;">Không có đề xuất phù hợp.</p>';
      }
    } else {
      throw new Error("Không thể lấy dữ liệu đề xuất");
    }
  } catch (error) {
    console.error("Error loading recommendations:", error);
    grid.innerHTML =
      '<p style="grid-column: 1/-1; padding: 20px; color: #777;">Lỗi tải phim đề xuất.</p>';
  }
}

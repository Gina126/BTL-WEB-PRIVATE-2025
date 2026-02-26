function initializeApp() {
  setupMobileMenu();
  setupSearch();
  setupCategoryDropdown();
  setupCountryDropdown();
  setupScrollEffects();
  renderMenuDropdowns();
  setupGlobalFavoriteHandler();
  setupComingSoonFeatures();
}

function setupGlobalFavoriteHandler() {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn-favorite");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      const movieData = JSON.parse(btn.getAttribute("data-movie"));
      const isFav = toggleFavorite(movieData);

      const allBtns = document.querySelectorAll(
        `.btn-favorite[data-slug="${movieData.slug}"], .btn-favorite[data-movie*='"slug":"${movieData.slug}"']`,
      );

      allBtns.forEach((b) => {
        if (isFav) {
          b.classList.add("active");
          b.querySelector("i").className = "fa-solid fa-heart";
          b.title = "Xóa khỏi yêu thích";
        } else {
          b.classList.remove("active");
          b.querySelector("i").className = "fa-regular fa-heart";
          b.title = "Thêm vào yêu thích";
        }
      });
    } catch (err) {
      console.error("Lỗi xử lý yêu thích:", err);
    }
  });
}

function setupMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.getElementById("main_menu");

  if (menuToggle && mainMenu) {
    menuToggle.addEventListener("click", function () {
      mainMenu.classList.toggle("active");

      const icon = this.querySelector("i");
      if (icon) {
        if (icon.classList.contains("fa-bars")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mainMenu.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });
  }
}

function setupSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchBox = document.getElementById("search");
  const searchInput = document.getElementById("main-search");

  if (searchToggle && searchBox) {
    searchToggle.addEventListener("click", function () {
      searchBox.classList.toggle("active");
      if (searchBox.classList.contains("active")) {
        searchInput?.focus();
      }
    });
  }

  if (searchInput) {
    const debouncedSearch = debounce(
      handleSearch,
      APP_CONFIG.SEARCH_DEBOUNCE_TIME,
    );

    searchInput.addEventListener("input", function (e) {
      const keyword = e.target.value.trim();
      if (keyword.length >= 2) {
        debouncedSearch(keyword);
      } else {
        hideSearchResults();
      }
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const keyword = e.target.value.trim();
        if (keyword) {
          goToSearchPage(keyword);
        }
      }
    });

    document.addEventListener("click", function (e) {
      const searchBox = document.getElementById("search");
      if (searchBox && !searchBox.contains(e.target)) {
        hideSearchResults();
      }
    });
  }
}

async function handleSearch(keyword) {
  if (!keyword || keyword.trim().length < 2) {
    hideSearchResults();
    return;
  }

  const result = await searchMovies(keyword);
  if (result.success && result.data?.data?.items) {
    showSearchResults(result.data.data.items, keyword);
  } else {
    hideSearchResults();
  }
}

function showSearchResults(movies, keyword) {
  let searchBox = document.getElementById("search");
  let resultsDropdown = document.getElementById("search-results-dropdown");

  if (!resultsDropdown) {
    resultsDropdown = document.createElement("div");
    resultsDropdown.id = "search-results-dropdown";
    resultsDropdown.className = "search-results-dropdown";
    searchBox.appendChild(resultsDropdown);
  }

  resultsDropdown.classList.add("active");

  if (movies.length === 0) {
    resultsDropdown.innerHTML = `<div class="search-no-results">Không tìm thấy phim cho "${keyword}"</div>`;
    return;
  }

  const IMAGE_HOST = "https://img.ophim.live/uploads/movies/";
  const limitedMovies = movies.slice(0, 5);

  let html = limitedMovies
    .map((movie) => {
      const thumb = movie.thumb_url.startsWith("http")
        ? movie.thumb_url
        : `${IMAGE_HOST}${movie.thumb_url}`;

      return `
      <div class="search-result-item" onclick="location.href='detail.html?slug=${movie.slug}'">
        <div class="search-result-thumb">
          <img src="${thumb}" alt="${movie.name}" onerror="this.src='https://placehold.co/45x65/1a1c26/666?text=?'">
        </div>
        <div class="search-result-info">
          <div class="search-result-title">${movie.name}</div>
          <div class="search-result-meta">${movie.year || "2024"} • ${movie.episode_current || "Full"}</div>
        </div>
      </div>
    `;
    })
    .join("");

  html += `
    <div class="search-view-all">
      <a href="search.html?q=${encodeURIComponent(keyword)}">Xem tất cả kết quả cho "${keyword}"</a>
    </div>
  `;

  resultsDropdown.innerHTML = html;
}

function hideSearchResults() {
  const resultsDropdown = document.getElementById("search-results-dropdown");
  if (resultsDropdown) {
    resultsDropdown.classList.remove("active");
  }
}

function goToSearchPage(keyword) {
  window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
}

function setupCategoryDropdown() {
  // Sẽ implement khi có UI dropdown
}

function setupCountryDropdown() {
  // Sẽ implement khi có UI dropdown
}

async function renderMenuDropdowns() {
  const dropdownConfigs = [
    {
      id: "nav-categories",
      type: "api",
      fetchFn: getCategoriesList,
      urlPrefix: "category.html?slug=",
      fallbackData: CATEGORIES,
    },
    {
      id: "nav-countries",
      type: "api",
      fetchFn: getCountriesList,
      urlPrefix: "country.html?slug=",
      fallbackData: COUNTRIES,
    },
    {
      id: "nav-more",
      type: "static",
      extraClass: "dropdown-narrow",
      items: [
        {
          url: "favorites.html",
          icon: "fa-solid fa-heart",
          text: "Phim yêu thích",
        },
        {
          url: "history.html",
          icon: "fa-solid fa-clock-rotate-left",
          text: "Lịch sử xem",
        },
      ],
    },
  ];

  for (const config of dropdownConfigs) {
    renderDropdown(config);
  }
}

async function renderDropdown(config) {
  const { id, type, extraClass = "" } = config;
  const container = document.getElementById(id);
  if (!container) return;

  const dropdownContent = document.createElement("div");
  dropdownContent.className = `dropdown-content ${extraClass}`.trim();

  let html = "";

  if (type === "api") {
    const { fetchFn, urlPrefix, fallbackData } = config;
    const result = await fetchFn();
    let items = [];

    if (result.success && result.data) {
      const data = result.data;
      items =
        (data.status === "success" && data.data && data.data.items) ||
        data.items ||
        (Array.isArray(data) ? data : []);
    }

    if (items.length === 0) items = fallbackData;

    html = '<div class="dropdown-grid">';
    items.forEach((item) => {
      html += `<a href="${urlPrefix}${item.slug}" class="dropdown-item">${item.name}</a>`;
    });
    html += "</div>";
  } else if (type === "static") {
    const { items } = config;
    html = '<div class="dropdown-grid" style="grid-template-columns: 1fr;">';
    items.forEach((item) => {
      html += `
        <a href="${item.url}" class="dropdown-item">
          <i class="${item.icon} me-2"></i> ${item.text}
        </a>`;
    });
    html += "</div>";
  }

  dropdownContent.innerHTML = html;
  container.appendChild(dropdownContent);
}

function setupScrollEffects() {
  const header = document.getElementById("header");
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  let lastScroll = 0;

  const handleScroll = throttle(function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header?.classList.add("sticky");
    } else {
      header?.classList.remove("sticky");
    }

    if (scrollToTopBtn) {
      if (currentScroll > 300) {
        scrollToTopBtn.classList.add("visible");
      } else {
        scrollToTopBtn.classList.remove("visible");
      }
    }

    lastScroll = currentScroll;
  }, 100);

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("scroll", handleScroll);
}

function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${getToastIcon(type)}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-removing");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "fa-circle-check";
    case "error":
      return "fa-circle-exclamation";
    case "warning":
      return "fa-triangle-exclamation";
    default:
      return "fa-circle-info";
  }
}

function toggleFavorite(movie) {
  if (isInFavorites(movie.slug)) {
    if (removeFromFavorites(movie.slug)) {
      showToast("Đã xóa khỏi danh sách yêu thích", "info");
      return false;
    }
  } else {
    if (addToFavorites(movie)) {
      showToast("Đã thêm vào danh sách yêu thích", "success");
      return true;
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeApp,
    showToast,
    toggleFavorite,
  };
}

function setupComingSoonFeatures() {
  const basketball = document.getElementById("nav-basketball");
  if (basketball) {
    basketball.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Tính năng hiện đang cập nhật", "info");
    });
  }

  document.addEventListener("click", (e) => {
    const memberBtn = e.target.closest(".button-login");
    if (memberBtn) {
      e.preventDefault();
      e.stopPropagation();
      showToast("Vui lòng đăng nhập để sử dụng tính năng này", "info");
      return;
    }

    const item = e.target.closest(".dropdown-item");
    if (!item) return;

    const isUnderConstruction = item.closest("#nav-categories, #nav-countries");

    if (isUnderConstruction) {
      e.preventDefault();
      e.stopPropagation();
      showToast("Tính năng hiện đang cập nhật", "info");
    }
  });
}

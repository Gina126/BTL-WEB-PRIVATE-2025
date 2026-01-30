function initHomePage() {
  console.log("RoPhim - Trang chủ đã sẵn sàng");

  // TODO: Thêm logic render phim ở đây
  // Ví dụ: loadMovies(), renderMovieGrid(), etc.
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomePage);
} else {
  initHomePage();
}

/**
 * home.js - File cơ bản cho trang chủ
 * 
 * File này chỉ chứa logic khởi tạo cơ bản
 * Những người khác có thể mở rộng thêm sau
 */

// Khởi tạo trang chủ
function initHomePage() {
    console.log('RoPhim - Trang chủ đã sẵn sàng');
    
    // TODO: Thêm logic render phim ở đây
    // Ví dụ: loadMovies(), renderMovieGrid(), etc.
}

// Tự động khởi tạo khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}

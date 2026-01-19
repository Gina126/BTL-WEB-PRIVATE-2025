/**
 * main.js - Logic chung cho toàn bộ website
 * 
 * File này chứa logic chung như:
 * - Xử lý menu (mobile menu, dropdown)
 * - Xử lý search
 * - Xử lý scroll
 * - Dark mode (nếu có)
 * - Và các tương tác UI chung khác
 */

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Khởi tạo ứng dụng
 */
function initializeApp() {
    setupMobileMenu();
    setupSearch();
    setupCategoryDropdown();
    setupCountryDropdown();
    setupScrollEffects();
    renderMenuDropdowns();
}

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main_menu');
    
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
            
            // Toggle icon giữa bars và times
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Đóng menu khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mainMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.getElementById('search');
    const searchInput = document.getElementById('main-search');
    
    // Toggle search box trên mobile
    if (searchToggle && searchBox) {
        searchToggle.addEventListener('click', function() {
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                searchInput?.focus();
            }
        });
    }
    
    // Xử lý tìm kiếm
    if (searchInput) {
        // Debounce search để tránh gọi API quá nhiều
        const debouncedSearch = debounce(handleSearch, APP_CONFIG.SEARCH_DEBOUNCE_TIME);
        
        searchInput.addEventListener('input', function(e) {
            const keyword = e.target.value.trim();
            if (keyword.length >= 2) {
                debouncedSearch(keyword);
            } else {
                hideSearchResults();
            }
        });
        
        // Enter để search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const keyword = e.target.value.trim();
                if (keyword) {
                    goToSearchPage(keyword);
                }
            }
        });
    }
}

/**
 * Xử lý tìm kiếm (gọi API và hiển thị kết quả)
 * @param {string} keyword - Từ khóa tìm kiếm
 */
async function handleSearch(keyword) {
    console.log('Searching for:', keyword);
    
    // TODO: Tạo dropdown hiển thị kết quả tìm kiếm nhanh
    // Hiện tại chỉ log ra, sẽ implement UI sau
    
    const result = await searchMovies(keyword);
    if (result.success) {
        console.log('Search results:', result.data);
        // showSearchResults(result.data);
    }
}

/**
 * Ẩn kết quả tìm kiếm
 */
function hideSearchResults() {
    // TODO: Implement UI
    console.log('Hide search results');
}

/**
 * Chuyển đến trang kết quả tìm kiếm
 * @param {string} keyword - Từ khóa
 */
function goToSearchPage(keyword) {
    window.location.href = `/search.html?q=${encodeURIComponent(keyword)}`;
}

/**
 * Render dropdown thể loại
 */
function setupCategoryDropdown() {
    // Sẽ implement khi có UI dropdown
}

/**
 * Render dropdown quốc gia
 */
function setupCountryDropdown() {
    // Sẽ implement khi có UI dropdown
}

/**
 * Render các dropdown menu (load từ API)
 */
async function renderMenuDropdowns() {
    await renderCategoriesDropdown();
    await renderCountriesDropdown();
}

/**
 * Render dropdown thể loại vào menu (load từ API)
 */
async function renderCategoriesDropdown() {
    const categoryMenuItems = document.querySelectorAll('.menu-item-sub .dropdown');
    
    categoryMenuItems.forEach(async dropdown => {
        const linkText = dropdown.querySelector('a')?.textContent.trim();
        
        if (linkText && linkText.includes('Thể loại')) {
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            
            // Load danh sách thể loại từ API
            const result = await getCategoriesList();
            
            if (result.success && result.data) {
                let categories = [];
                
                // Parse response structure từ OPHIM API
                // Response format: { status: "success", data: { items: [...] } }
                if (result.data.status === 'success' && result.data.data && result.data.data.items) {
                    categories = result.data.data.items;
                } else if (result.data.items) {
                    // Fallback: nếu structure đơn giản hơn
                    categories = result.data.items;
                } else if (Array.isArray(result.data)) {
                    // Fallback: nếu trả về array trực tiếp
                    categories = result.data;
                }
                
                if (categories.length > 0) {
                    let html = '<div class="dropdown-grid">';
                    categories.forEach(category => {
                        html += `<a href="/category.html?slug=${category.slug}" class="dropdown-item">${category.name}</a>`;
                    });
                    html += '</div>';
                    
                    dropdownContent.innerHTML = html;
                    dropdown.appendChild(dropdownContent);
                } else {
                    // Fallback: nếu parse thất bại, dùng data hardcode từ config.js
                    let html = '<div class="dropdown-grid">';
                    CATEGORIES.forEach(category => {
                        html += `<a href="/category.html?slug=${category.slug}" class="dropdown-item">${category.name}</a>`;
                    });
                    html += '</div>';
                    
                    dropdownContent.innerHTML = html;
                    dropdown.appendChild(dropdownContent);
                }
            } else {
                // Fallback: nếu API lỗi, dùng data hardcode từ config.js
                let html = '<div class="dropdown-grid">';
                CATEGORIES.forEach(category => {
                    html += `<a href="/category.html?slug=${category.slug}" class="dropdown-item">${category.name}</a>`;
                });
                html += '</div>';
                
                dropdownContent.innerHTML = html;
                dropdown.appendChild(dropdownContent);
            }
        }
    });
}

/**
 * Render dropdown quốc gia vào menu (load từ API)
 */
async function renderCountriesDropdown() {
    const countryMenuItems = document.querySelectorAll('.menu-item-sub .dropdown');
    
    countryMenuItems.forEach(async dropdown => {
        const linkText = dropdown.querySelector('a')?.textContent.trim();
        
        if (linkText && linkText.includes('Quốc gia')) {
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            
            // Load danh sách quốc gia từ API
            const result = await getCountriesList();
            
            if (result.success && result.data) {
                let countries = [];
                
                // Parse response structure từ OPHIM API
                // Response format: { status: "success", data: { items: [...] } }
                if (result.data.status === 'success' && result.data.data && result.data.data.items) {
                    countries = result.data.data.items;
                } else if (result.data.items) {
                    countries = result.data.items;
                } else if (Array.isArray(result.data)) {
                    countries = result.data;
                }
                
                if (countries.length > 0) {
                    let html = '<div class="dropdown-grid">';
                    countries.forEach(country => {
                        html += `<a href="/country.html?slug=${country.slug}" class="dropdown-item">${country.name}</a>`;
                    });
                    html += '</div>';
                    
                    dropdownContent.innerHTML = html;
                    dropdown.appendChild(dropdownContent);
                } else {
                    // Fallback: nếu parse thất bại, dùng data hardcode từ config.js
                    let html = '<div class="dropdown-grid">';
                    COUNTRIES.forEach(country => {
                        html += `<a href="/country.html?slug=${country.slug}" class="dropdown-item">${country.name}</a>`;
                    });
                    html += '</div>';
                    
                    dropdownContent.innerHTML = html;
                    dropdown.appendChild(dropdownContent);
                }
            } else {
                // Fallback: nếu API lỗi, dùng data hardcode từ config.js
                let html = '<div class="dropdown-grid">';
                COUNTRIES.forEach(country => {
                    html += `<a href="/country.html?slug=${country.slug}" class="dropdown-item">${country.name}</a>`;
                });
                html += '</div>';
                
                dropdownContent.innerHTML = html;
                dropdown.appendChild(dropdownContent);
            }
        }
    });
}

/**
 * Render dropdown quốc gia vào menu
 */
function renderCountriesDropdown() {
    const countryMenuItems = document.querySelectorAll('.menu-item-sub .dropdown');
    
    countryMenuItems.forEach(dropdown => {
        const linkText = dropdown.querySelector('a')?.textContent.trim();
        
        if (linkText && linkText.includes('Quốc gia')) {
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            
            let html = '<div class="dropdown-grid">';
            COUNTRIES.forEach(country => {
                html += `<a href="/country.html?slug=${country.slug}" class="dropdown-item">${country.name}</a>`;
            });
            html += '</div>';
            
            dropdownContent.innerHTML = html;
            dropdown.appendChild(dropdownContent);
        }
    });
}

/**
 * Setup scroll effects (header sticky, scroll to top button, etc.)
 */
function setupScrollEffects() {
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    // Throttle scroll event để tối ưu performance
    const handleScroll = throttle(function() {
        const currentScroll = window.pageYOffset;
        
        // Thêm class sticky khi scroll xuống
        if (currentScroll > 100) {
            header?.classList.add('sticky');
        } else {
            header?.classList.remove('sticky');
        }
        
        // Hide header khi scroll xuống, show khi scroll lên (optional)
        // if (currentScroll > lastScroll && currentScroll > 500) {
        //     header?.classList.add('hidden');
        // } else {
        //     header?.classList.remove('hidden');
        // }
        
        lastScroll = currentScroll;
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
}

/**
 * Hiển thị toast notification
 * @param {string} message - Thông báo
 * @param {string} type - Loại (success, error, info)
 */
function showToast(message, type = 'info') {
    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Thêm vào body
    document.body.appendChild(toast);
    
    // Hiển thị toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Tự động ẩn sau 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Lấy icon cho toast
 * @param {string} type - Loại toast
 * @returns {string} - Class icon
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-circle-check';
        case 'error': return 'fa-circle-exclamation';
        case 'warning': return 'fa-triangle-exclamation';
        default: return 'fa-circle-info';
    }
}

/**
 * Toggle favorite
 * @param {Object} movie - Movie object
 */
function toggleFavorite(movie) {
    if (isInFavorites(movie.slug)) {
        if (removeFromFavorites(movie.slug)) {
            showToast('Đã xóa khỏi danh sách yêu thích', 'info');
            return false;
        }
    } else {
        if (addToFavorites(movie)) {
            showToast('Đã thêm vào danh sách yêu thích', 'success');
            return true;
        }
    }
}

// Export các hàm cần thiết
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        showToast,
        toggleFavorite
    };
}

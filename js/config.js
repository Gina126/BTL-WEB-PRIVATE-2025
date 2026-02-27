const API_CONFIG = {
  BASE_URL: "https://ophim1.com",
  IMAGE_HOST: "https://img.ophim1.com/uploads/movies/",

  BACKUP_URL: "https://ophim18.cc",

  ENDPOINTS: {
    CATEGORIES_LIST: "/v1/api/the-loai",

    COUNTRIES_LIST: "/v1/api/quoc-gia",

    MOVIES_LIST: "/v1/api/home",

    MOVIE_DETAIL: "/v1/api/phim/[slug]",

    SEARCH: "/v1/api/tim-kiem?keyword=[keyword]",

    CATEGORY: "/v1/api/the-loai/[slug]",

    COUNTRY: "/v1/api/quoc-gia/[slug]",

    SINGLE_MOVIES: "/v1/api/danh-sach/phim-le",

    SERIES_MOVIES: "/v1/api/danh-sach/phim-bo",

    MOVIE_IMAGES: "/v1/api/phim/[slug]/images",
    MOVIE_PEOPLES: "/v1/api/phim/[slug]/peoples",
    MOVIE_KEYWORDS: "/v1/api/phim/[slug]/keywords",
    MOVIE_LIST: "/v1/api/danh-sach/[slug]",
  },

  DEFAULT_PARAMS: {
    page: 1,
    limit: 24,
  },
};

const APP_CONFIG = {
  APP_NAME: "RoPhim",

  ITEMS_PER_PAGE: 24,

  MAX_DESCRIPTION_LENGTH: 200,

  SEARCH_DEBOUNCE_TIME: 500,

  SLIDER_ITEMS: 10,

  AUTO_SLIDE_INTERVAL: 5000,
};

const CATEGORIES = [
  { slug: "hanh-dong", name: "Hành Động" },
  { slug: "tinh-cam", name: "Tình Cảm" },
  { slug: "hai-huoc", name: "Hài Hước" },
  { slug: "co-trang", name: "Cổ Trang" },
  { slug: "tam-ly", name: "Tâm Lý" },
  { slug: "hinh-su", name: "Hình Sự" },
  { slug: "chien-tranh", name: "Chiến Tranh" },
  { slug: "the-thao", name: "Thể Thao" },
  { slug: "vo-thuat", name: "Võ Thuật" },
  { slug: "vien-tuong", name: "Viễn Tưởng" },
  { slug: "phieu-luu", name: "Phiêu Lưu" },
  { slug: "khoa-hoc", name: "Khoa Học" },
  { slug: "kinh-di", name: "Kinh Dị" },
  { slug: "am-nhac", name: "Âm Nhạc" },
  { slug: "than-thoai", name: "Thần Thoại" },
  { slug: "tai-lieu", name: "Tài Liệu" },
  { slug: "gia-dinh", name: "Gia Đình" },
  { slug: "chinh-kich", name: "Chính kịch" },
  { slug: "bi-an", name: "Bí ẩn" },
  { slug: "hoc-duong", name: "Học Đường" },
  { slug: "kinh-dien", name: "Kinh Điển" },
  { slug: "phim-18", name: "Phim 18+" },
  { slug: "short-drama", name: "Short Drama" },
];

const COUNTRIES = [
  { slug: "trung-quoc", name: "Trung Quốc" },
  { slug: "han-quoc", name: "Hàn Quốc" },
  { slug: "nhat-ban", name: "Nhật Bản" },
  { slug: "thai-lan", name: "Thái Lan" },
  { slug: "au-my", name: "Âu Mỹ" },
  { slug: "dai-loan", name: "Đài Loan" },
  { slug: "hong-kong", name: "Hồng Kông" },
  { slug: "an-do", name: "Ấn Độ" },
  { slug: "anh", name: "Anh" },
  { slug: "phap", name: "Pháp" },
  { slug: "canada", name: "Canada" },
  { slug: "duc", name: "Đức" },
  { slug: "tay-ban-nha", name: "Tây Ban Nha" },
  { slug: "tho-nhi-ky", name: "Thổ Nhĩ Kỳ" },
  { slug: "viet-nam", name: "Việt Nam" },
  { slug: "ha-lan", name: "Hà Lan" },
  { slug: "indonesia", name: "Indonesia" },
  { slug: "nga", name: "Nga" },
  { slug: "mexico", name: "Mexico" },
  { slug: "ba-lan", name: "Ba lan" },
  { slug: "uc", name: "Úc" },
  { slug: "thuy-dien", name: "Thụy Điển" },
  { slug: "malaysia", name: "Malaysia" },
  { slug: "brazil", name: "Brazil" },
  { slug: "philippines", name: "Philippines" },
  { slug: "bo-dao-nha", name: "Bồ Đào Nha" },
  { slug: "y", name: "Ý" },
  { slug: "dan-mach", name: "Đan Mạch" },
  { slug: "uae", name: "UAE" },
  { slug: "na-uy", name: "Na Uy" },
  { slug: "thuy-si", name: "Thụy Sĩ" },
  { slug: "chau-phi", name: "Châu Phi" },
  { slug: "nam-phi", name: "Nam Phi" },
  { slug: "ukraina", name: "Ukraina" },
  { slug: "a-rap-xe-ut", name: "Ả Rập Xê Út" },
  { slug: "bi", name: "Bỉ" },
  { slug: "ireland", name: "Ireland" },
  { slug: "colombia", name: "Colombia" },
  { slug: "phan-lan", name: "Phần Lan" },
  { slug: "chile", name: "Chile" },
  { slug: "hy-lap", name: "Hy Lạp" },
  { slug: "nigeria", name: "Nigeria" },
  { slug: "argentina", name: "Argentina" },
  { slug: "singapore", name: "Singapore" },
  { slug: "quoc-gia-khac", name: "Quốc Gia Khác" },
];

const STORAGE_KEYS = {
  FAVORITES: "rophim_favorites",
  WATCH_HISTORY: "rophim_watch_history",
  USER_PREFERENCES: "rophim_user_prefs",
  CONTINUE_WATCHING: "rophim_continue_watching",
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    API_CONFIG,
    APP_CONFIG,
    CATEGORIES,
    COUNTRIES,
    STORAGE_KEYS,
  };
}

# 🎬 Hướng Dẫn Đóng Góp - RoPhim

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án **RoPhim**! Chúng tôi rất vui mừng được đón nhận sự đóng góp từ cộng đồng. Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp một cách hiệu quả.

## 📋 Mục Lục

- [Code of Conduct](#code-of-conduct)
- [Bắt Đầu Nhanh](#bat-dau-nhanh)
- [Git Flow Workflow](#git-flow-workflow)
- [Quy Trình Đóng Góp](#quy-trinh-dong-gop)
- [Tiêu Chuẩn Code](#tieu-chuan-code)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Câu Hỏi Thường Gặp](#cau-hoi-thuong-gap)

## 📜 Code of Conduct

Dự án này tuân thủ các nguyên tắc:

- **Tôn trọng**: Đối xử tôn trọng với tất cả các thành viên trong cộng đồng
- **Xây dựng**: Đưa ra phản hồi mang tính xây dựng và tiếp nhận phản hồi một cách cởi mở
- **Hợp tác**: Làm việc cùng nhau để tạo ra sản phẩm tốt nhất
- **Chuyên nghiệp**: Duy trì thái độ chuyên nghiệp trong mọi tương tác

<a id="bat-dau-nhanh"></a>

## 🚀 Bắt Đầu Nhanh

### ⚡ Quick Start Checklist

**Làm theo thứ tự để tránh lỗi phổ biến:**

#### ✅ Bước 1: Clone và Setup Git

```bash
# 1. Fork repository về GitHub của bạn (trên web)

# 2. Clone repository đã fork
git clone https://github.com/YOUR_USERNAME/BTL-WEB-PRIVATE-2025.git
cd BTL-WEB-PRIVATE-2025

# 3. Thêm upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/BTL-WEB-PRIVATE-2025.git

# 4. QUAN TRỌNG: Verify .gitignore đang hoạt động
git status
# → Không thấy node_modules/, .DS_Store, .vscode/settings.json = ✅ OK
```

#### ✅ Bước 2: Cài Extensions (VS Code)

```bash
# Mở project trong VS Code
code .

# Popup sẽ xuất hiện: "This workspace has extension recommendations"
# → Click "Install All"
# → Reload window khi được yêu cầu
```

**Extensions sẽ được cài:**

- Live Server, Prettier, GitLens, Auto Rename Tag, Material Icon Theme

#### ✅ Bước 3: Config Prettier (Sau khi cài extensions)

```
File → Preferences → Settings
→ Search "Format On Save" → BẬT ✅
→ Search "Default Formatter" → Chọn "Prettier"
```

#### ✅ Bước 4: Kiểm Tra Trước Khi Code

```bash
# Check Git status (không có file lạ)
git status
# → Output: "nothing to commit, working tree clean" ✅

# Test Live Server
# Click chuột phải vào index.html → "Open with Live Server"
# → Browser mở http://localhost:5500 ✅

# Test Prettier
# Mở file .js → Sửa code → Ctrl+S
# → Code tự động format ✅
```

#### 🚫 Tránh 3 Lỗi Phổ Biến:

| Lỗi                                 | Nguyên Nhân               | Cách Tránh                                |
| ----------------------------------- | ------------------------- | ----------------------------------------- |
| **1. Files cá nhân bị commit nhầm** | Không check `git status`  | Luôn chạy `git status` trước `git commit` |
| **2. .gitignore không hoạt động**   | File đã được commit trước | Xem [Git Ignore Guide](#git-ignore-guide) |
| **3. Code không được format**       | Chưa config Prettier      | Follow Bước 3 ở trên                      |

#### 🎯 Checklist Hoàn Tất

- [ ] Clone repo và add upstream remote
- [ ] Verify `.gitignore` hoạt động (`git status` sạch)
- [ ] Cài đặt 5 VS Code extensions
- [ ] Config Prettier format-on-save
- [ ] Test Live Server chạy OK
- [ ] Đọc [Git Flow Workflow](#git-flow-workflow)

---

<a id="git-flow-workflow"></a>

## 🔄 Git Flow Workflow

Dự án này sử dụng workflow đơn giản với 2 branches chính.

### Cấu Trúc Branches

```
main (production)     ← Code đã release, stable, được gắn tags
  ↑
develop (integration) ← Branch chính để phát triển
  ↑
feat/...             ← Tính năng mới
fix/...              ← Sửa bug
ref/...              ← Cải thiện code
```

### Branch Types

| Branch Type | Tạo từ    | Merge vào          | Naming                  |
| ----------- | --------- | ------------------ | ----------------------- |
| `main`      | -         | -                  | `main`                  |
| `develop`   | `main`    | `main` (với tags)  | `develop`               |
| `feat/*`    | `develop` | `develop`          | `feat/add-favorites`    |
| `fix/*`     | `develop` | `develop`          | `fix/player-bug`        |
| `hotfix/*`  | `main`    | `main` + `develop` | `hotfix/critical-error` |

### Quy Trình Release

Team nhỏ của chúng ta sử dụng quy trình đơn giản:

1. Develop trên branch `develop`
2. Khi sẵn sàng release, merge `develop` → `main`
3. Gắn tag cho version trên `main` (ví dụ: `v1.0.0`, `v1.1.0`)
4. Deploy từ `main`

```bash
# Khi sẵn sàng release
git checkout main
git pull origin main
git merge develop
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

<a id="quy-trinh-dong-gop"></a>

## 🔄 Quy Trình Đóng Góp

### 1. Sync Develop Branch

Luôn đảm bảo bạn có code mới nhất từ `develop`:

```bash
# Thêm upstream nếu chưa có
git remote add upstream https://github.com/ORIGINAL_OWNER/BTL-WEB-PRIVATE-2025.git

# Fetch tất cả branches từ upstream
git fetch upstream

# Checkout develop và cập nhật
git checkout develop
git pull upstream develop

# Push develop về fork của bạn
git push origin develop
```

### 2. Tạo Feature/Fix Branch

Tạo branch mới từ `develop` (KHÔNG phải từ `main`):

```bash
# Đảm bảo đang ở develop và đã updated
git checkout develop
git pull upstream develop

# Tạo feature branch (dùng viết tắt feat)
git checkout -b feat/user-authentication

# Hoặc fix branch
git checkout -b fix/video-playback-issue

# Hoặc refactor branch
git checkout -b ref/api-module
```

### 3. Branch Naming Convention

**Format**: `<type>/<short-description>`

**⚠️ Quan trọng**: Dùng **viết tắt** như commit convention (feat, fix, ref,...)

**Branch Types:**

- ✨ `feat/`: Tính năng mới (feature)
  - `feat/add-favorite-movies`
  - `feat/user-profile-page`
  - `feat/video-recommendations`

- 🐛 `fix/`: Sửa bug trong develop
  - `fix/video-player-autoplay`
  - `fix/search-results-pagination`
  - `fix/mobile-menu-overlay`

- 🚨 `hotfix/`: Sửa lỗi KHẨN CẤP trong production (từ `main`)
  - `hotfix/critical-security-patch`
  - `hotfix/server-crash-fix`

- ♻️ `ref/`: Refactor code (không thêm feature, không fix bug)
  - `ref/api-module-structure`
  - `ref/css-variables`
  - `ref/utils-functions`

- 📝 `docs/`: Cập nhật documentation
  - `docs/update-readme`
  - `docs/api-documentation`

- 💄 `style/`: Thay đổi UI/CSS
  - `style/movie-card-design`
  - `style/responsive-header`

- ⚡ `perf/`: Cải thiện performance
  - `perf/lazy-loading`
  - `perf/image-optimization`

- ✅ `test/`: Thêm hoặc sửa tests
  - `test/api-module`
  - `test/user-authentication`

- 🔧 `build/`: Build system, dependencies
  - `build/webpack-config`
  - `build/package-updates`

- 🔨 `chore/`: Maintenance, misc tasks
  - `chore/update-deps`
  - `chore/cleanup-code`

**Quy tắc đặt tên:**

- Dùng **viết tắt** (`feat/`, `ref/`, `perf/`,...)
- Lowercase, dùng dấu gạch ngang `-`
- Mô tả ngắn gọn, rõ ràng
- Bằng tiếng Anh
- Không quá 50 ký tự
- Nhất quán với commit message type

### 4. Thực Hiện Thay Đổi

#### ⚠️ Phân biệt CORE vs PAGE files

**🔴 CORE Files** (Ảnh hưởng TOÀN BỘ dự án - Cẩn thận!):

```
components/, css/, js/{components,config,utils,api,main}.js
```

- **BẮT BUỘC:** Thông báo team trước khi sửa
- **BẮT BUỘC:** Test nhiều trang sau khi sửa
- Ví dụ: Đổi tên function trong `utils.js` → tất cả trang bị lỗi!

**✅ PAGE Files** (An toàn, chỉ ảnh hưởng 1 trang):

```
index.html, detail.html, watch.html, js/{home,detail,watch}.js
```

- Tự do sửa, không ảnh hưởng trang khác
- Naming: Prefix biến theo trang (`homeMovies`, `detailMovie`)

---

#### 🛡️ Quy trình sửa CORE files an toàn

**1. Thông báo trước** (Slack/Discord):

```
"@team Sẽ sửa utils.js - thêm formatCurrency()
Ai đang làm việc với file này không?
Plan merge: 10h sáng mai"
```

**2. Backward compatible** - Quy tắc SỬA an toàn:

**✅ Case 1: THÊM function mới** (An toàn)

```javascript
function formatCurrency(amount) { ... }  // Không ảnh hưởng code cũ
```

**⚠️ Case 2: SỬA function hiện có** (NGUY HIỂM - Làm theo 4 bước!)

**Bước 1:** Tìm TẤT CẢ nơi dùng function:

```bash
# Search trong dự án (VS Code: Ctrl+Shift+F)
grep -r "formatDate" js/ *.html
```

**Bước 2:** Sửa KHÔNG thay đổi signature:

```javascript
// ❌ ĐỪNG thay đổi params
function formatDate(dateString) { ... }  // Cũ
function formatDate(dateString, format) { ... }  // Mới → LỖI!

// ✅ Dùng default params
function formatDate(dateString, format = 'DD/MM/YYYY') { ... }
// → Code cũ: formatDate(date) vẫn OK
// → Code mới: formatDate(date, 'YYYY-MM-DD') cũng OK
```

**Bước 3:** Test TẤT CẢ nơi tìm được ở Bước 1

**Bước 4:** Commit ghi rõ:

```bash
git commit -m "refactor(utils): improve formatDate with format option

- Add optional format parameter (default: DD/MM/YYYY)
- Backward compatible - existing code still works
- Tested: home.js, detail.js, watch.js"
```

**⛔ KHI NÀO TUYỆT ĐỐI KHÔNG sửa:**

```javascript
// ❌ Đổi return type
return [];  →  return { data: [], total: 0 }

// ❌ Đổi tên function
formatDate()  →  formatDateString()

// → Giải pháp: TẠO function MỚI thay vì sửa function cũ!
```

**3. Test kỹ:**

- [ ] Test ít nhất **3 trang khác nhau**
- [ ] Check header/footer hiển thị OK
- [ ] Check console không có lỗi
- [ ] Test cả Desktop & Mobile

**4. Commit rõ ràng:**

```bash
git commit -m "feat(utils): add formatCurrency function

- Add new helper for currency formatting
- Does NOT affect existing functions
- Tested on: home, detail, watch pages"
```

**5. Merge vào giờ team online** → Debug nhanh nếu có lỗi

---

#### Khi code:

- Commit thường xuyên với messages rõ ràng
- Đảm bảo không làm hỏng tính năng hiện có
- Test trước khi commit!

### 5. Commit Changes

Sử dụng **Conventional Commits** (tiếng Anh):

```bash
# Stage changes
git add .

# Commit với message theo chuẩn
git commit -m "feat: add favorite movies functionality"
git commit -m "fix: resolve video player autoplay issue"
git commit -m "docs: update installation guide"
```

**⚠️ Quan trọng**: Commit messages PHẢI bằng **tiếng Anh**

Xem chi tiết tại [Commit Message Guidelines](#commit-message-guidelines)

### 6. Keep Your Branch Updated

Thường xuyên sync với `develop` để code của bạn luôn mới nhất và tránh conflicts lớn.

#### Cách Sync với Develop

```bash
# Fetch changes mới nhất
git fetch upstream

# Merge develop vào branch của bạn
git checkout your-branch
git merge upstream/develop

# Nếu không có conflicts
git push origin your-branch

# Nếu có conflicts, đọc phần dưới để resolve
```

**� Tip**: Sync mỗi ngày hoặc trước khi bắt đầu code để tránh conflicts lớn.

#### Khi Có Conflicts

Nếu xuất hiện thông báo conflict:

```bash
# 1. Xem file nào bị conflict
git status

# 2. Mở file trong VS Code
# VS Code sẽ highlight conflicts với các nút:
# - Accept Current Change (code của bạn)
# - Accept Incoming Change (code từ develop)
# - Accept Both Changes (kết hợp cả 2)

# 3. Sau khi sửa xong
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin your-branch
```

**Ví dụ conflict trong file:**

```javascript
<<<<<<< HEAD (code của bạn)
  const url = `${API_URL}/movies`;
=======
  const endpoint = API_CONFIG.MOVIES_LIST; (code từ develop)
>>>>>>> upstream/develop
```

**Sau khi resolve, file sẽ như:**

```javascript
const endpoint = API_CONFIG.MOVIES_LIST;
const url = `${endpoint}/movies`;
```

#### Tips Tránh Conflicts

- ✅ Sync với develop thường xuyên (mỗi ngày)
- ✅ Commit nhỏ, thường xuyên
- ✅ Thông báo team trước khi sửa file quan trọng
- ✅ Dùng VS Code để resolve conflicts (dễ hơn command line)

### 7. Push và Tạo Pull Request

```bash
# Push lần đầu
git push origin your-branch-name

# Nếu đã rebase, cần force push (cẩn thận!)
git push origin your-branch-name --force-with-lease
```

**Tạo Pull Request:**

1. Vào GitHub repository
2. Click **"Compare & pull request"**
3. **Base branch**: `develop` (KHÔNG phải `main`)
4. **Compare branch**: `feature/your-branch`
5. Điền thông tin theo [PR Template](#pull-request-process)
6. Submit PR

### 8. Hotfix Workflow (Khẩn Cấp)

Nếu phát hiện bug nghiêm trọng trên production:

```bash
# Tạo hotfix từ main
git checkout main
git pull upstream main
git checkout -b hotfix/critical-bug-description

# Fix bug và commit
git commit -m "hotfix: fix critical security vulnerability"

# Push và tạo PR vào MAIN
git push origin hotfix/critical-bug-description
```

**Sau khi hotfix được merge vào `main`:**

- Maintainer sẽ merge `main` → `develop`
- Hoặc bạn tạo thêm PR từ `hotfix` → `develop`

<a id="tieu-chuan-code"></a>

## 💻 Tiêu Chuẩn Code

### Cấu Trúc Thư Mục

```
BTL-WEB-PRIVATE-2025/
├── assets/           # Tài nguyên tĩnh
│   ├── icons/       # Icon files
│   └── images/      # Hình ảnh
├── css/             # Stylesheets
│   ├── variables.css    # CSS variables (colors, spacing, etc.)
│   ├── style.css        # Global styles
│   └── components.css   # Component-specific styles
├── js/              # JavaScript files
│   ├── config.js    # Configuration constants
│   ├── utils.js     # Utility functions
│   ├── api.js       # API calls and data fetching
│   ├── main.js      # Main application logic
│   ├── home.js      # Home page specific logic
│   └── detail.js    # Detail page specific logic
└── index.html       # Main HTML file
```

### HTML Guidelines

```html
<!-- ✅ TỐT: Semantic HTML, indent đúng -->
<section class="movie-section">
  <h2 class="section-title">Phim Đề Xuất</h2>
  <div class="movie-grid">
    <article class="movie-card">
      <!-- Content -->
    </article>
  </div>
</section>

<!-- ❌ TRÁNH: Không semantic, indent sai -->
<div class="section">
  <div class="title">Phim Đề Xuất</div>
  <div class="grid">
    <div class="card">
      <!-- Content -->
    </div>
  </div>
</div>
```

**Quy tắc:**

- Sử dụng semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Indent: 2 spaces
- Luôn đóng tag
- Sử dụng alt text cho images
- Thêm ARIA labels khi cần thiết cho accessibility

### CSS Guidelines

```css
/* ✅ TỐT: Sử dụng CSS variables, tổ chức rõ ràng */
.movie-card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

/* ❌ TRÁNH: Hard-coded values, không consistent */
.movie-card {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}
```

**Quy tắc:**

- Sử dụng CSS variables từ `variables.css` cho colors, spacing, font sizes
- Đặt tên class theo BEM convention hoặc semantic naming
- Mobile-first approach với media queries
- Tránh `!important` trừ khi thực sự cần thiết
- Group related properties (positioning, box model, typography, visual)

### JavaScript Guidelines

```javascript
// ✅ TỐT: Modern ES6+, clear naming, comments
/**
 * Lấy danh sách phim từ API
 * @param {string} category - Thể loại phim
 * @param {number} page - Số trang
 * @returns {Promise<Array>} Danh sách phim
 */
async function fetchMovies(category, page = 1) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movies?category=${category}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

// ❌ TRÁNH: Callback hell, var, no error handling
function getMovies(cat, p, callback) {
  var url = API_BASE_URL + "/movies?category=" + cat + "&page=" + p;
  fetch(url).then(function (res) {
    res.json().then(function (data) {
      callback(data.movies);
    });
  });
}
```

**Quy tắc:**

- Sử dụng `const` và `let`, tránh `var`
- Arrow functions cho callbacks ngắn
- Async/await thay vì promise chains
- Tên biến/hàm rõ ràng, mô tả (camelCase)
- JSDoc comments cho functions quan trọng
- Error handling với try/catch
- Tránh global variables

### File Organization

**CSS Files:**

- `variables.css`: CSS custom properties (màu sắc, spacing, fonts)
- `style.css`: Global styles, resets, utilities
- `components.css`: Component-specific styles

**JS Files:**

- `config.js`: Constants, API endpoints, configuration
- `components.js`: Load header/footer từ file riêng
- `utils.js`: Helper functions, formatters
- `api.js`: API calls, data fetching logic
- `main.js`: Global initialization, event listeners
- `home.js`: Home page specific functionality
- `detail.js`: Detail page specific functionality

<a id="commit-message-guidelines"></a>

## 📝 Commit Message Guidelines

Dự án này sử dụng **Conventional Commits** với **tiếng Anh**.

### Format Chuẩn

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Bắt buộc**: `<type>: <subject>`  
**Tùy chọn**: `(<scope>)`, `<body>`, `<footer>`

### Commit Types

| Type       | Emoji | Mô Tả          | Ví Dụ                                     |
| ---------- | ----- | -------------- | ----------------------------------------- |
| `feat`     | ✨    | Tính năng mới  | `feat: add user favorites system`         |
| `fix`      | 🐛    | Sửa bug        | `fix: resolve video autoplay issue`       |
| `docs`     | 📝    | Cập nhật docs  | `docs: update README installation steps`  |
| `style`    | 💄    | UI/CSS changes | `style: improve movie card hover effect`  |
| `refactor` | ♻️    | Refactor code  | `refactor: restructure API module`        |
| `perf`     | ⚡    | Performance    | `perf: implement lazy loading for images` |
| `test`     | ✅    | Tests          | `test: add unit tests for fetchMovies`    |
| `build`    | 🔧    | Build system   | `build: update webpack config`            |
| `ci`       | 👷    | CI/CD          | `ci: add GitHub Actions workflow`         |
| `chore`    | 🔨    | Maintenance    | `chore: update dependencies`              |
| `revert`   | ⏪    | Revert commit  | `revert: revert feat: add user system`    |

### Subject Guidelines

✅ **DO:**

- Bắt đầu bằng động từ: `add`, `fix`, `update`, `remove`, `refactor`
- Viết thường (lowercase)
- Không kết thúc bằng dấu chấm
- Giới hạn 50 ký tự
- Mô tả ngắn gọn, súc tích
- Dùng thì hiện tại: `add` không phải `added`

❌ **DON'T:**

- ~~`Add feature`~~ → `add feature` (lowercase)
- ~~`added user login`~~ → `add user login` (present tense)
- ~~`fix bug.`~~ → `fix authentication bug` (no period, be specific)
- ~~`update`~~ → `update README with API docs` (be descriptive)

### Examples

#### ✅ Good Commits

```bash
# Feature
git commit -m "feat: add movie favorites functionality"
git commit -m "feat(player): implement video quality selector"
git commit -m "feat(search): add autocomplete suggestions"

# Bug Fixes
git commit -m "fix: resolve video player autoplay issue"
git commit -m "fix(api): handle null response from server"
git commit -m "fix(mobile): correct menu overlay z-index"

# Documentation
git commit -m "docs: update CONTRIBUTING with Git Flow"
git commit -m "docs(readme): add deployment instructions"

# Styling
git commit -m "style: improve movie card responsive design"
git commit -m "style(header): adjust mobile navigation layout"

# Refactoring
git commit -m "refactor: simplify fetchMovies function"
git commit -m "refactor(api): extract error handling logic"

# Performance
git commit -m "perf: implement image lazy loading"
git commit -m "perf(home): optimize movie list rendering"
```

#### ❌ Bad Commits

```bash
# Tránh các commit như sau:
git commit -m "update"              # Quá chung chung
git commit -m "fixed bugs"          # Không specific
git commit -m "new stuff"           # Không mô tả gì
git commit -m "WIP"                 # Work in progress - commit sau
git commit -m "asdfgh"              # Meaningless
git commit -m "Thêm tính năng"      # Phải dùng tiếng Anh
git commit -m "Fix bug."            # Không nên có dấu chấm
git commit -m "Added login page"   # Dùng 'add', không phải 'added'
```

### Detailed Commit (With Body & Footer)

Đối với commits phức tạp, thêm body và footer:

```bash
git commit -m "feat: add user authentication system

Implement complete authentication flow including:
- User registration with email validation
- Login with JWT tokens
- Password reset functionality
- Session management
- Protected routes

Breaking Change: Requires new ENV variables:
- JWT_SECRET
- JWT_EXPIRATION

Adds dependencies:
- jsonwebtoken@9.0.0
- bcryptjs@2.4.3"
```

### Scope (Optional)

Scope chỉ module/component bị ảnh hưởng:

```bash
feat(player): add fullscreen mode
fix(api): handle timeout errors
style(card): improve hover animation
refactor(utils): simplify date formatter
docs(setup): update local development guide
```

**Common Scopes:**

- `player` - Video player
- `api` - API calls
- `auth` - Authentication
- `search` - Search functionality
- `home` - Home page
- `detail` - Detail page
- `card` - Movie card component
- `header` - Header component
- `footer` - Footer component

### Breaking Changes

Nếu commit có breaking changes, thêm `BREAKING CHANGE:` hoặc `!`:

```bash
# Cách 1: Dùng !
git commit -m "feat!: redesign API response structure"

# Cách 2: Dùng footer
git commit -m "feat: update authentication flow

BREAKING CHANGE: JWT tokens now expire after 1 hour instead of 24 hours.
Users will need to re-login more frequently."
```

### Multiple Changes

Nếu một commit có nhiều thay đổi, dùng body để liệt kê:

```bash
git commit -m "feat: enhance movie detail page

- Add cast and crew information
- Display user ratings and reviews
- Show similar movie recommendations
- Implement share functionality"
```

### Commit Message Template

Bạn có thể tạo template cho git:

```bash
# Tạo file template
cat > ~/.gitmessage << EOF
# <type>(<scope>): <subject>
#
# <body>
#
# Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
# Scope: player, api, auth, search, home, detail, card, header, footer
# Subject: Start with verb, lowercase, no period, max 50 chars
# Body: Explain what and why (not how), wrap at 72 chars
EOF

# Áp dụng template
git config --global commit.template ~/.gitmessage
```

Sau đó khi commit, chỉ cần:

```bash
git commit
# Editor sẽ mở với template sẵn
```

<a id="pull-request-process"></a>

## 🔀 Pull Request Process

### Checklist Trước Khi Submit PR

- [ ] Code đã được test trên nhiều trình duyệt (Chrome, Firefox, Safari/Edge)
- [ ] Code đã được test trên mobile (responsive)
- [ ] Không có lỗi console
- [ ] Code tuân thủ [Tiêu Chuẩn Code](#tiêu-chuẩn-code)
- [ ] Commit messages rõ ràng và có ý nghĩa
- [ ] Đã cập nhật documentation nếu cần
- [ ] Đã rebase với main branch mới nhất

### Tạo Pull Request

1. **Tên PR rõ ràng và mô tả**

   ```
   ✅ TỐT: feat: Thêm chức năng lọc phim theo quốc gia
   ❌ TRÁNH: update code
   ```

2. **Mô tả chi tiết**

   ```markdown
   ## Mô Tả

   Thêm dropdown quốc gia vào header để người dùng có thể lọc phim.

   ## Thay Đổi

   - Thêm component dropdown quốc gia vào header
   - Tích hợp API endpoint `/movies/filter` với parameter `country`
   - Cập nhật UI để hiển thị kết quả filter
   - Thêm animation cho dropdown

   ## Screenshots

   [Đính kèm ảnh nếu có thay đổi UI]

   ## Kiểm Tra

   - [x] Test trên Chrome
   - [x] Test trên Firefox
   - [x] Test responsive mobile
   - [x] Không có lỗi console
   ```

### Code Review

- Sẵn sàng nhận feedback và thảo luận
- Phản hồi tất cả review comments
- Push thêm commits để sửa theo feedback (không force push)
- Request re-review sau khi sửa xong

### Merge

- PR cần **ít nhất 1 approval** từ maintainer
- Tất cả conversations phải được resolve
- CI checks (nếu có) phải pass
- Conflicts phải được resolve
- Maintainer sẽ merge PR vào `develop`

### Sau Khi Merge

```bash
# Xóa local branch
git checkout develop
git branch -D feat/your-feature

# Xóa remote branch (GitHub tự động xóa nếu bạn chọn)
git push origin --delete feat/your-feature

# Cập nhật develop
git pull upstream develop
git push origin develop
```

<a id="cau-hoi-thuong-gap"></a>

## ❓ Câu Hỏi Thường Gặp

### Q: Tôi mới học lập trình, có thể đóng góp không?

**A:** Hoàn toàn có thể! Chúng tôi rất hoan nghênh contributors ở mọi cấp độ. Bạn có thể bắt đầu với:

- Sửa typos trong documentation
- Cải thiện CSS/UI cho một component nhỏ
- Thêm comments cho code
- Tìm và báo cáo bugs

### Q: Làm sao để setup development environment?

**A:** Xem phần [Thiết Lập Môi Trường Development](#thiết-lập-môi-trường-development) ở trên.

### Q: PR của tôi bị reject, làm gì bây giờ?

**A:**

- Đọc kỹ feedback từ reviewer
- Hỏi rõ hơn nếu không hiểu
- Sửa theo feedback và push thêm commits
- Request re-review

### Q: Làm sao để sync fork của tôi với repo gốc?

**A:**

```bash
# Fetch changes từ upstream
git fetch upstream

# Checkout main branch
git checkout main

# Merge changes từ upstream/main
git merge upstream/main

# Push lên fork của bạn
git push origin main
```

### Q: Tôi cần test trên browser nào?

**A:** Ít nhất test trên:

- **Desktop**: Chrome (hoặc Edge), Firefox
- **Mobile**: Chrome Mobile (Android) hoặc Safari (iOS)

### Q: Làm sao để test responsive?

**A:**

- Sử dụng DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
- Test các breakpoints: Mobile (375px), Tablet (768px), Desktop (1024px+)
- Test cả portrait và landscape orientation

## 📞 Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ, hãy liên hệ trực tiếp với team lead hoặc thảo luận trong nhóm.

## 🙏 Lời Cảm Ơn

Cảm ơn bạn đã dành thời gian đọc hướng dẫn này và đóng góp cho RoPhim! Mỗi đóng góp, dù lớn hay nhỏ, đều giúp dự án ngày càng tốt hơn.

Happy Coding! 🎬🍿

---

**Lưu ý**: Tài liệu này có thể được cập nhật theo thời gian. Hãy kiểm tra phiên bản mới nhất trước khi đóng góp.

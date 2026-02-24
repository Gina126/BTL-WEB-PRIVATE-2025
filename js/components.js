/**
 * Component Loader
 * Load header và footer từ file riêng để dễ maintain
 */

/**
 * Load HTML component từ file
 * @param {string} elementId - ID của element sẽ chứa component
 * @param {string} componentPath - Đường dẫn đến file component
 */
async function loadComponent(elementId, componentPath) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
        // Element not found (likely already inlined or not needed), skip fetch
        return; 
    }
    
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${componentPath}: ${response.status}`);
    }
    const html = await response.text();
    element.outerHTML = html;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

/**
 * Load tất cả components
 */
async function loadAllComponents() {
  console.log('🔄 Loading components...');
  await Promise.all([
    loadComponent('header-placeholder', './components/header.html'), // Use relative path ./
    loadComponent('footer-placeholder', './components/footer.html'),
  ]);
  
  console.log('✅ Components loaded!');
  
  // CRITICAL FIX: Wait for DOM to render before initializing
  // setTimeout ensures the browser has time to parse and render the HTML
  setTimeout(() => {
    if (typeof initializeApp === 'function') {
      console.log('🚀 Calling initializeApp()...');
      initializeApp();
    } else {
      console.error('❌ initializeApp is not defined!');
    }
  }, 100); // 100ms delay to ensure DOM is ready
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAllComponents);
} else {
  loadAllComponents();
}

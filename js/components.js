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
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${componentPath}: ${response.status}`);
    }
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.outerHTML = html;
    } else {
      console.error(`Element with id "${elementId}" not found`);
    }
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

/**
 * Load tất cả components
 */
async function loadAllComponents() {
  await Promise.all([
    loadComponent('header-placeholder', './components/header.html'),
    loadComponent('footer-placeholder', './components/footer.html'),
  ]);
  

  if (typeof initializeApp === 'function') {
    initializeApp();
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
 
  loadAllComponents();
}

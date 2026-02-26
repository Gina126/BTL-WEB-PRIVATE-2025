async function loadComponent(elementId, componentPath) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
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

async function loadAllComponents() {
  console.log("🔄 Loading components...");
  await Promise.all([
    loadComponent("header-placeholder", "./components/header.html"),
    loadComponent("footer-placeholder", "./components/footer.html"),
  ]);

  console.log("✅ Components loaded!");

  setTimeout(() => {
    if (typeof initializeApp === "function") {
      console.log("🚀 Calling initializeApp()...");
      initializeApp();
    } else {
      console.error("❌ initializeApp is not defined!");
    }
  }, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAllComponents);
} else {
  loadAllComponents();
}

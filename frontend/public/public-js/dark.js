document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggleInput = document.getElementById("theme-checkbox");
  
    // Load saved mode
    const saved = localStorage.getItem("color-mode");
    if (saved === "dark") {
      body.classList.add("dark-mode");
      toggleInput.checked = true;
    }
  
    toggleInput.addEventListener("change", () => {
      if (toggleInput.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("color-mode", "dark");
      } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("color-mode", "light");
      }
    });
  });
  
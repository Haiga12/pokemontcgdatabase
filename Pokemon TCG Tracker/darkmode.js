document.addEventListener("DOMContentLoaded", () => {
    const modeToggleSwitch = document.getElementById("toggle-switch");
    const body = document.body;
    const header = document.querySelector("header"); // Select the header
    const button = document.querySelector("button");

    // Load saved mode from localStorage
    const savedMode = localStorage.getItem("darkMode");

    // Apply the saved mode
    if (savedMode === "light") {
        body.classList.add("light-mode");
        header.classList.add("light-mode");
        button.classList.add("light-mode");
    }

    // Toggle between modes
    modeToggleSwitch.addEventListener("click", () => {
        const isLightMode = body.classList.toggle("light-mode");
        header.classList.toggle("light-mode");
        button.classList.toggle("light-mode");
        // Save the new mode to localStorage
        localStorage.setItem("darkMode", isLightMode ? "light" : "dark");
    });
});

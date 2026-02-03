(() => {
    const storageKey = "theme";
    const root = document.documentElement;
    const toggle = document.querySelector(".theme-toggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (theme) => {
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }
    };

    const getPreferredTheme = () => {
        const stored = localStorage.getItem(storageKey);
        if (stored === "light" || stored === "dark") {
            return stored;
        }
        return prefersDark.matches ? "dark" : "light";
    };

    const setTheme = (theme) => {
        applyTheme(theme);
        localStorage.setItem(storageKey, theme);
    };

    applyTheme(getPreferredTheme());

    if (toggle) {
        toggle.addEventListener("click", () => {
            const isDark = root.getAttribute("data-theme") === "dark";
            setTheme(isDark ? "light" : "dark");
        });
    }

    prefersDark.addEventListener("change", (event) => {
        const stored = localStorage.getItem(storageKey);
        if (stored !== "light" && stored !== "dark") {
            applyTheme(event.matches ? "dark" : "light");
        }
    });
})();

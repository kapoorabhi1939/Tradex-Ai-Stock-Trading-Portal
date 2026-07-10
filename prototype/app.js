(function () {
  document.body.classList.remove("no-js");

  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  const routeLinks = Array.from(document.querySelectorAll("[data-route]"));
  const toolbarLinks = Array.from(document.querySelectorAll(".prototype-toolbar [data-route]"));
  const toast = document.querySelector("[data-toast]");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
  }

  function setRoute(route, options = {}) {
    const target = screens.find((screen) => screen.dataset.screen === route) || screens[0];
    screens.forEach((screen) => {
      screen.classList.toggle("is-active", screen === target);
    });

    routeLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.route === target.dataset.screen);
    });

    toolbarLinks.forEach((link) => {
      link.setAttribute("aria-current", link.dataset.route === target.dataset.screen ? "page" : "false");
    });

    if (window.location.hash !== `#${target.dataset.screen}`) {
      history.pushState({ route: target.dataset.screen }, "", `#${target.dataset.screen}`);
    }

    if (!options.silent) {
      const label = target.dataset.screen.replace(/^\w/, (letter) => letter.toUpperCase());
      showToast(`${label} screen loaded`);
    }

    window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
  }

  routeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setRoute(link.dataset.route);
    });
  });

  document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    setRoute("dashboard");
  });

  window.addEventListener("popstate", () => {
    const route = window.location.hash.slice(1) || "landing";
    setRoute(route, { silent: true, instant: true });
  });

  const initialRoute = window.location.hash.slice(1) || "landing";
  setRoute(initialRoute, { silent: true, instant: true });
})();

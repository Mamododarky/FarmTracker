(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const hostedByAlt1 = Boolean(window.alt1);
  const overlayMode = hostedByAlt1 || params.get("alt1") === "1";

  document.documentElement.classList.toggle("alt1-overlay", overlayMode);
  document.documentElement.classList.toggle("alt1-hosted", hostedByAlt1);

  const configUrl = new URL("appconfig.json", window.location.href).href;

  // Tells Alt1 which app configuration belongs to this webpage. Older Alt1
  // builds simply ignore this when the function is unavailable.
  if (hostedByAlt1 && typeof window.alt1.identifyAppUrl === "function") {
    try { window.alt1.identifyAppUrl(configUrl); } catch {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    const status = document.getElementById("alt1StatusText");
    const install = document.getElementById("installAlt1Button");

    if (status) {
      status.textContent = hostedByAlt1
        ? "Running inside Alt1. Keep this app open or pinned for live alarm sounds."
        : "Web preview. Host this folder over HTTPS, then install the appconfig.json URL in Alt1.";
    }

    if (install && !hostedByAlt1 && /^https?:$/.test(window.location.protocol)) {
      install.hidden = false;
      install.addEventListener("click", () => {
        window.location.href = `alt1://addapp/${configUrl}`;
      });
    }

    // Timers are timestamp-based, so wake the UI immediately whenever Alt1
    // restores/focuses the overlay after it has been hidden or minimized.
    ["focus", "pageshow", "visibilitychange"].forEach((eventName) => {
      window.addEventListener(eventName, () => {
        window.dispatchEvent(new CustomEvent("rs3-farm-overlay-wake"));
      });
    });
  });

  window.RS3_FARM_ALT1 = Object.freeze({ hostedByAlt1, overlayMode, configUrl });
})();

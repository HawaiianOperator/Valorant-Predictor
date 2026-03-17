/**
 * Auth Guard
 * Protects pages that require authentication
 */

(function () {

  function waitForAuth(callback) {
    if (window.authService) {
      callback();
    } else {
      setTimeout(() => waitForAuth(callback), 100);
    }
  }

  window.requireAuth = function (options = {}) {
    const { redirectTo = "/index.html", mode = "redirect", mount = null } = options;

    waitForAuth(() => {
      const user = window.authService.getUser();

      if (user) return;

      console.warn("User not authenticated");

      if (mode === "redirect") {
        window.location.href = redirectTo;
        return;
      }

      if (mode === "prompt" && mount) {
        const container = document.getElementById(mount);
        if (!container) return;

        container.innerHTML = `
          <div style="padding: 1rem; background: #222; color: #fff; border-radius: 8px;">
            <p>You must be signed in to use this feature.</p>
          </div>
        `;
      }
    });
  };

})();
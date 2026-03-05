/**
 * Auth Guard
 * Blocks access to tracker pages unless user is authenticated.
 */

(function () {
  function requireAuth({ redirectTo = "index.html", showMessage = true } = {}) {
    const gateId = "auth-gate-overlay";

    function showGate() {
      if (!showMessage) return;
      if (document.getElementById(gateId)) return;

      const overlay = document.createElement("div");
      overlay.id = gateId;
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0, 0, 0, 0.85)";
      overlay.style.backdropFilter = "blur(6px)";
      overlay.style.zIndex = "3000";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.padding = "24px";

      overlay.innerHTML = `
        <div style="
          max-width: 560px;
          width: 100%;
          background: rgba(26, 26, 46, 0.95);
          border: 2px solid rgba(233, 69, 96, 0.35);
          border-radius: 14px;
          padding: 22px;
          color: white;
          text-align: center;
        ">
          <h2 style="margin: 0 0 10px 0; color: #e94560;">Sign in required</h2>
          <p style="margin: 0 0 16px 0; color: #cbd5e0; line-height: 1.6;">
            You must be logged in to access the trackers.
          </p>
          <a href="${redirectTo}" style="
            display: inline-block;
            padding: 12px 18px;
            background: linear-gradient(135deg, #e94560, #ff6b9d);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-weight: 700;
          ">Go to login</a>
        </div>
      `;

      document.body.appendChild(overlay);
    }

    function hideGate() {
      const overlay = document.getElementById(gateId);
      if (overlay) overlay.remove();
    }

    function ensureAuthReady() {
      if (typeof authService === "undefined") {
        setTimeout(ensureAuthReady, 100);
        return;
      }

      // If already signed in, allow.
      if (authService.getCurrentUser()) {
        hideGate();
        return;
      }

      // Otherwise, block now and keep listening.
      showGate();
      authService.onAuthStateChanged((user) => {
        if (user) {
          hideGate();
        } else {
          showGate();
        }
      });
    }

    ensureAuthReady();
  }

  // Expose helper
  window.requireAuth = requireAuth;
})();


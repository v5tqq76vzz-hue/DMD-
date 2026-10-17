/* ==========================================================================
   LÓGICA CORPORATIVA INTEGRAL — DIGITAL MAJFA DREAMS (DMD) v4.0
   Incluye Modo Noche Estilo Facebook, Carrito Global, Asistente y Responsividad
   ========================================================================== */

window._dmdMem = window._dmdMem || {};
function safeGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : (window._dmdMem[key] ?? fallback);
  } catch (e) {
    return window._dmdMem[key] ?? fallback;
  }
}
function safeSet(key, val) {
  window._dmdMem[key] = String(val);
  try { localStorage.setItem(key, String(val)); } catch (e) {}
}
function safeRemove(key) {
  delete window._dmdMem[key];
  try { localStorage.removeItem(key); } catch (e) {}
}

/* ==========================================================================
   MODO NOCHE / MODO CLARO ESTILO FACEBOOK (APLICACIÓN INMEDIATA)
   ========================================================================== */
function applySavedTheme() {
  const savedTheme = safeGet("dmd_theme", "light");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateThemeButtonUI(savedTheme);
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  safeSet("dmd_theme", next);
  applySavedTheme();
  showToast(next === "dark" ? "🌙 Modo Noche activado" : "☀️ Modo Claro activado");
}

function updateThemeButtonUI(theme) {
  const btns = document.querySelectorAll(".theme-toggle-btn");
  btns.forEach(btn => {
    if (theme === "dark") {
      btn.innerHTML = `<span>☀️</span> <span class="theme-label">Modo Claro</span>`;
      btn.title = "Cambiar a Modo Claro";
    } else {
      btn.innerHTML = `<span>🌙</span> <span class="theme-label">Modo Noche</span>`;
      btn.title = "Cambiar a Modo Noche";
    }
  });
}

// Ejecutar inmediatamente antes del renderizado para evitar parpadeo
applySavedTheme();

/* ==========================================================================
   CARRITO / COTIZADOR GLOBAL
   ========================================================================== */
function getCart() {
  try {
    return JSON.parse(safeGet("dmd_cart") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  safeSet("dmd_cart", JSON.stringify(cart));
  updateNavCartCount();
}

function addItemToCart(name, price, meta = "") {
  const cart = getCart();
  cart.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    n: name,
    p: Number(price),
    meta: meta
  });
  saveCart(cart);
  showToast(`"${name}" se añadió a tu cotización ($${Number(price).toLocaleString("es-MX")} MXN)`);
}

function removeItemFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  if (typeof renderCotizadorCart === "function") renderCotizadorCart();
  if (typeof renderCheckoutSummary === "function") renderCheckoutSummary();
}

function updateNavCartCount() {
  const cart = getCart();
  document.querySelectorAll(".cart-count").forEach(b => {
    b.textContent = cart.length;
  });
}

function showToast(message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span style="color:#34d399; font-weight:700;">✓</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function searchQuickDomainIndex(inputId = "quickDomainIndex") {
  const inputEl = document.getElementById(inputId);
  if (inputEl && inputEl.value.trim() !== "") {
    const domain = inputEl.value.trim().toLowerCase();
    safeSet("dmd_last_domain_query", domain);
    window.location.href = `dominios.html?q=${encodeURIComponent(domain)}`;
  } else {
    window.location.href = "dominios.html";
  }
}
window.searchQuickDomain = searchQuickDomainIndex;

document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  updateNavCartCount();

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn && safeGet("dmd_admin") === "true") {
    adminBtn.style.display = "inline-flex";
  }

  const portalBtn = document.getElementById("portalBtn");
  if (portalBtn && safeGet("dmd_cliente") === "true") {
    const uName = safeGet("dmd_cliente_nombre") || "Mi Cuenta";
    const shortName = uName.split(" ").slice(0, 2).join(" ");
    portalBtn.innerHTML = `<span>👤 ${shortName}</span>`;
    portalBtn.href = "portal-cliente.html";
  }

  const nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) nav.classList.add("sc");
      else nav.classList.remove("sc");
    });
  }

  const menuBtn = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      item.classList.toggle("open");
      const icon = btn.querySelector(".faq-icon");
      if (icon) icon.textContent = item.classList.contains("open") ? "−" : "+";
    });
  });

  const chatBtn = document.getElementById("chatBtn");
  const chatWindow = document.getElementById("chatWindow");
  const chatClose = document.getElementById("chatClose");
  const chatBody = document.getElementById("chatBody");
  const chatOpts = document.getElementById("chatOpts");
  const chatInput = document.getElementById("chatInput");

  if (chatBtn && chatWindow) {
    chatBtn.addEventListener("click", () => chatWindow.classList.toggle("open"));
    if (chatClose) chatClose.addEventListener("click", () => chatWindow.classList.remove("open"));

    window.sendUserMsg = function(text) {
      if (chatOpts) chatOpts.style.display = "none";
      chatBody.innerHTML += `<div class="msg user">${text}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => {
        const txt = text.toLowerCase();
        let resp = 'Un especialista de Digital Majfa Dreams puede atenderte en nuestro <a href="https://wa.me/?text=Hola%20DMD,%20solicito%20asesor%C3%ADa%20empresarial" target="_blank" style="color:var(--primary); font-weight:600; text-decoration:underline;">canal ejecutivo de WhatsApp</a>.';

        if (txt.includes("cotizar") || txt.includes("servicio") || txt.includes("precio")) {
          resp = 'Nuestros servicios inician desde <b>$150 MXN</b> y Páginas Web en <b>$699 MXN</b>. Arma tu presupuesto en el <a href="servicios.html" style="color:var(--primary); font-weight:600; text-decoration:underline;">Cotizador en Línea</a>.';
        } else if (txt.includes("paquete") || txt.includes("plan")) {
          resp = 'Contamos con 4 paquetes empresariales desde <b>$1,299 MXN</b> en <a href="paquetes.html" style="color:var(--primary); font-weight:600; text-decoration:underline;">Paquetes y Planes</a>.';
        } else if (txt.includes("simulador") || txt.includes("ia") || txt.includes("boceto")) {
          resp = 'Nuestro <a href="boceto.html" style="color:var(--primary); font-weight:600; text-decoration:underline;">Arquitecto Web IA 3.0</a> diseña tu página tomando plantillas de Apple, Microsoft, Shopify y más.';
        } else if (txt.includes("noche") || txt.includes("oscuro") || txt.includes("tema")) {
          resp = 'Puedes alternar entre <b>Modo Claro</b> y <b>Modo Noche</b> en cualquier momento desde el botón 🌙 de la barra superior.';
        }

        chatBody.innerHTML += `<div class="msg bot">${resp}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 380);
    };

    window.sendCustomMsg = function() {
      if (chatInput && chatInput.value.trim() !== "") {
        window.sendUserMsg(chatInput.value.trim());
        chatInput.value = "";
      }
    };
  }
});

/* ==========================================================
   BLUE WILDFLOWER — interactions
   Content lives in portfolio-data.js; visual rules in styles.css.
   ========================================================== */
(() => {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const siteConfig = window.SITE_CONFIG || {};
  const projects = Array.isArray(window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : [];
  const projectGrid = document.getElementById("portfolio-grid");
  const emptyState = document.getElementById("empty-state");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("primary-menu");
  const projectDialog = document.getElementById("project-dialog");
  const dialogClose = projectDialog?.querySelector(".dialog-close");
  const dialogImage = document.getElementById("dialog-image");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogDescription = document.getElementById("dialog-description");
  const dialogTags = document.getElementById("dialog-tags");
  const dialogNotice = document.getElementById("dialog-notice");
  const toast = document.getElementById("toast-message");
  let activeFilter = "all";
  let toastTimeout = 0;
  let previousFocus = null;
  let revealObserver = null;

  const categoryLabels = {
    wedding: "Wedding",
    printed: "Printed cards",
    ordination: "Ordination",
    memorial: "Memorial / B&W"
  };

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const isWebUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const parsed = new URL(value, window.location.href);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  const validContactUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const parsed = new URL(value, window.location.href);
      return ["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
  }

  function trackEvent(eventName, parameters = {}) {
    if (siteConfig.analytics === false) return;
    // Compatible with Google Analytics if a gtag implementation is added later.
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    }
    // A custom event lets other analytics tools listen without editing this file.
    window.dispatchEvent(new CustomEvent("bluewildflower:analytics", {
      detail: { event: eventName, ...parameters }
    }));
  }

  function attachRevealObserver(root = document) {
    const newItems = root.querySelectorAll ? root.querySelectorAll(".reveal:not([data-reveal-observed])") : [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      newItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    }
    newItems.forEach((item, index) => {
      item.dataset.revealObserved = "true";
      if (item.classList.contains("project-card")) item.style.transitionDelay = `${(index % 3) * 65}ms`;
      revealObserver.observe(item);
    });
  }

  function createCard(project, index) {
    const safeId = escapeHTML(project.id || `project-${index + 1}`);
    const title = escapeHTML(project.title || "Untitled design");
    const subtitle = escapeHTML(project.subtitle || "A special moment, thoughtfully designed");
    const image = escapeHTML(project.image || "assets/cover-meadow.svg");
    const alt = escapeHTML(project.alt || `${project.title || "E-card"} — design preview`);
    const category = escapeHTML(categoryLabels[project.category] || project.category || "E-card");
    const tags = Array.isArray(project.styleTags) ? project.styleTags.slice(0, 4) : [];
    const demo = project.demo === true || !isWebUrl(project.url);
    const href = isWebUrl(project.url) ? escapeHTML(project.url) : "";
    const visualInner = `
      <img src="${image}" alt="${alt}" loading="lazy" decoding="async" width="640" height="800">
      <span class="project-card__badge">${demo ? "DESIGN PREVIEW" : "E-CARD"}</span>
      <span class="project-card__zoom"><span>${title}<small>${demo ? "Preview concept" : "Open invitation"}</small></span><span class="zoom-icon" aria-hidden="true">↗</span></span>`;
    const visual = href
      ? `<a class="project-card__visual" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="เปิดตัวอย่าง ${title} ในแท็บใหม่" data-project-link="${safeId}">${visualInner}</a>`
      : `<button class="project-card__visual" type="button" aria-label="ดูตัวอย่าง ${title}" data-project-preview="${safeId}">${visualInner}</button>`;
    const action = href
      ? `<a class="project-card__action" href="${href}" target="_blank" rel="noopener noreferrer" data-project-link="${safeId}"><span>View invitation</span><span aria-hidden="true">↗</span></a>`
      : `<button class="project-card__action" type="button" data-project-preview="${safeId}"><span>${demo ? "View design preview" : "Add invitation link"}</span><span aria-hidden="true">↗</span></button>`;
    return `
      <article class="project-card reveal" data-project-id="${safeId}" data-category="${escapeHTML(project.category || "")}" data-format="${escapeHTML(project.format || "ecard")}">
        ${visual}
        <div class="project-card__body">
          <div class="project-card__overline"><span>${category}</span><span>${demo ? "Concept / Demo" : "Portfolio"}</span></div>
          <h3 class="project-card__title">${title}</h3>
          <p class="project-card__subtitle">${subtitle}</p>
          <div class="project-card__tags">${tags.map((tag) => `<span class="style-tag">${escapeHTML(tag)}</span>`).join("")}</div>
          ${action}
        </div>
      </article>`;
  }

  function renderProjects(filter = activeFilter) {
    activeFilter = filter;
    const filteredProjects = projects.filter((project) => {
      if (filter === "all") return true;
      return project.category === filter || project.format === filter;
    });

    if (projectGrid) {
      projectGrid.innerHTML = filteredProjects.map(createCard).join("");
      attachRevealObserver(projectGrid);
    }
    if (emptyState) emptyState.hidden = filteredProjects.length > 0;
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const countLabel = document.querySelector('[data-count="all"]');
    if (countLabel) countLabel.textContent = String(projects.length).padStart(2, "0");
  }

  function openProjectPreview(projectId) {
    const project = projects.find((item) => String(item.id) === String(projectId));
    if (!project || !projectDialog) return;
    previousFocus = document.activeElement;
    dialogImage.src = project.image || "assets/cover-meadow.svg";
    dialogImage.alt = project.alt || project.title || "E-card design preview";
    dialogTitle.textContent = project.title || "Design preview";
    dialogDescription.textContent = project.subtitle || "A special moment, thoughtfully designed";
    dialogTags.innerHTML = (Array.isArray(project.styleTags) ? project.styleTags : [])
      .map((tag) => `<span class="style-tag">${escapeHTML(tag)}</span>`).join("");

    if (isWebUrl(project.url) && project.demo !== true) {
      dialogNotice.textContent = "ลิงก์ตัวอย่างพร้อมใช้งานแล้ว ปุ่มด้านล่างยังใช้สำหรับติดต่อสอบถามงานออกแบบ";
    } else {
      dialogNotice.textContent = "ภาพนี้เป็น Design Preview สำหรับทดลองจัดวางหน้าเว็บไซต์ ยังไม่ใช่ผลงานจริง หากต้องการเผยแพร่ ให้เปลี่ยนภาพ ชื่อ และลิงก์ในไฟล์ portfolio-data.js";
    }

    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
      dialogClose?.focus();
    } else {
      projectDialog.setAttribute("open", "");
    }
    trackEvent("view_portfolio_preview", { project_id: project.id, project_category: project.category });
  }

  function closeProjectPreview() {
    if (!projectDialog) return;
    if (typeof projectDialog.close === "function" && projectDialog.open) projectDialog.close();
    else projectDialog.removeAttribute("open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  function handleContactAction() {
    const email = typeof siteConfig.contactEmail === "string" ? siteConfig.contactEmail.trim() : "";
    const url = typeof siteConfig.contactUrl === "string" ? siteConfig.contactUrl.trim() : "";
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("สอบถามงานออกแบบการ์ด — Blue Wildflower")}`;
      trackEvent("contact_click", { contact_method: "email" });
      return;
    }
    if (validContactUrl(url)) {
      if (url.startsWith("mailto:") || url.startsWith("tel:")) window.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      trackEvent("contact_click", { contact_method: "contact_url" });
      return;
    }
    showToast("กรุณาตั้งค่าช่องทางติดต่อจริงในไฟล์ portfolio-data.js ก่อนเผยแพร่เว็บไซต์");
  }

  function setMenu(open) {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    navLinks.classList.toggle("is-open", open);
  }

  // Category filters.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => renderProjects(button.dataset.filter || "all"));
  });

  // Preview buttons and links. The card and its CTA both open the real URL when configured.
  projectGrid?.addEventListener("click", (event) => {
    const previewButton = event.target.closest("[data-project-preview]");
    const projectLink = event.target.closest("[data-project-link]");
    if (previewButton) {
      openProjectPreview(previewButton.dataset.projectPreview);
      return;
    }
    if (projectLink) {
      const id = projectLink.dataset.projectLink;
      const project = projects.find((item) => String(item.id) === String(id));
      if (project) trackEvent("open_portfolio_project", { project_id: project.id, project_category: project.category });
    }
  });

  // Contact CTA may appear in the page and inside the design-preview dialog.
  document.querySelectorAll("[data-contact-action]").forEach((button) => {
    button.addEventListener("click", handleContactAction);
  });

  // Social destinations fall back to Contact until an actual URL is configured.
  document.querySelectorAll("[data-social]").forEach((anchor) => {
    const platform = anchor.dataset.social;
    const url = siteConfig.socials && siteConfig.socials[platform];
    if (isWebUrl(url)) {
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.addEventListener("click", () => trackEvent("social_click", { social_platform: platform }));
    } else {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        showToast(`ยังไม่ได้ตั้งค่าลิงก์ ${platform} ในไฟล์ portfolio-data.js`);
      });
    }
  });

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (event) => {
    if (navLinks?.classList.contains("is-open") && !event.target.closest(".glass-nav")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  dialogClose?.addEventListener("click", closeProjectPreview);
  projectDialog?.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProjectPreview();
  });
  projectDialog?.addEventListener("close", () => {
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  renderProjects("all");
  attachRevealObserver(document);
})();

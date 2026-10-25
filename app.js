(function () {
  const config = window.CURIOUS_LAYER || {};
  const dialog = document.getElementById("quote-dialog");
  const menuButton = document.querySelector(".menu-toggle");
  const header = document.querySelector(".site-header");

  document.querySelectorAll("[data-brand-logo]").forEach((image) => {
    image.src = config.brand?.logoPath || image.src;
    image.alt = config.brand?.logoAlt || "Curious Layer logo";
  });
  document.querySelectorAll("[data-youtube]").forEach((link) => (link.href = config.social?.youtube || link.href));
  document.querySelectorAll("[data-instagram]").forEach((link) => (link.href = config.social?.instagram || link.href));
  document.querySelectorAll("[data-makerworld]").forEach((link) => (link.href = config.social?.makerworld || link.href));
  document.querySelectorAll("[data-email]").forEach((link) => {
    const email = config.contact?.email || "[YOUR BUSINESS EMAIL]";
    link.textContent = email;
    link.href = email.startsWith("[") ? "#" : `mailto:${email}`;
  });

  if (dialog) {
    document.querySelectorAll(".quote-trigger").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        dialog.showModal();
        dialog.querySelector("input")?.focus();
      });
    });
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
  menuButton?.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  document.querySelector(".quote-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const submitBtn = form.querySelector("button[type='submit']");
    const message = form.querySelector(".form-note");
    const recipient = config.contact?.email || "Curiouslayer.official@gmail.com";
    const subject = `New project request — ${values["project-type"] || "Curious Layer"}`;

    // Build url-encoded payload (CORS-safe, no preflight needed)
    const params = new URLSearchParams({
      name: values.name || "",
      email: values.email || "",
      "project-type": values["project-type"] || "",
      quantity: values.quantity || "",
      "material-preference": values.material || "",
      "colour-preference": values.colour || "",
      "desired-dimensions": values.dimensions || "",
      "desired-deadline": values.deadline || "",
      "project-details": values["project-details"] || "",
      _subject: subject,
      _captcha: "false",
      _template: "table",
      _replyto: values.email || ""
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    message.textContent = "Sending your request…";

    // 10-second timeout via AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal
    })
      .then((res) => { clearTimeout(timer); return res.text(); })
      .then((text) => {
        let ok = false;
        try { ok = JSON.parse(text).success === "true" || JSON.parse(text).success === true; } catch (_) { ok = text.includes("success"); }
        if (ok) {
          form.innerHTML = `
            <div class="form-success full-field">
              <div class="success-icon">✓</div>
              <h3>Request sent!</h3>
              <p>We've received your project brief and will reply to <strong>${values.email || "you"}</strong> soon.</p>
              <p class="success-sub">Curious Layer · Chennai, India</p>
            </div>`;
        } else { throw new Error("not ok"); }
      })
      .catch((err) => {
        clearTimeout(timer);
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send request <span>↗</span>";
        // Show mailto fallback
        const isTimeout = err.name === "AbortError";
        message.innerHTML = isTimeout
          ? `Request timed out. <a class="text-link" href="mailto:${recipient}?subject=${encodeURIComponent(subject)}">Click here to email us directly ↗</a>`
          : `Something went wrong. <a class="text-link" href="mailto:${recipient}?subject=${encodeURIComponent(subject)}">Email us directly ↗</a>`;
      });
  });

  // Scroll animations
  const animEls = document.querySelectorAll(
    '.service-card, .product-card, .lab-card, .spec-panel, .process-step, .principles-grid > div, .hero-summary, .capability-copy, .section-heading, .project-copy, .process-track'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  animEls.forEach(el => { el.classList.add('anim-ready'); observer.observe(el); });
})();

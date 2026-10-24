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
    const data = new FormData(form);
    const fileInput = form.querySelector("input[type='file']");
    const files = Array.from(fileInput.files || []).map((file) => file.name);
    const values = Object.fromEntries(data.entries());
    const body = [
      "NEW CURIOUS LAYER PROJECT REQUEST",
      "",
      `Name: ${values.name || "Not provided"}`,
      `Email: ${values.email || "Not provided"}`,
      `Project type: ${values["project-type"] || "Not provided"}`,
      `Quantity: ${values.quantity || "Not provided"}`,
      `Material preference: ${values.material || "Not specified"}`,
      `Colour preference: ${values.colour || "Not specified"}`,
      `Desired dimensions: ${values.dimensions || "Not specified"}`,
      `Desired deadline: ${values.deadline || "Not specified"}`,
      "",
      "Project details:",
      values["project-details"] || "Not provided",
      "",
      `Selected reference files: ${files.length ? files.join(", ") : "None"}`,
      "Please attach the selected files to this email before sending."
    ].join("\n");
    const recipient = config.contact?.email || "Curiouslayer.official@gmail.com";
    const subject = `Project request — ${values["project-type"] || "Curious Layer"}`;
    const mailtoHref = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Use a hidden <a> click — most reliable cross-browser approach
    const link = document.createElement("a");
    link.href = mailtoHref;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show fallback panel so the user can copy & send manually if no email client opens
    let fallback = form.querySelector(".email-fallback");
    if (!fallback) {
      fallback = document.createElement("div");
      fallback.className = "email-fallback full-field";
      fallback.innerHTML = `
        <p class="fallback-intro">If your email app didn't open, copy the details below and paste them into a new email to <strong>${recipient}</strong>.</p>
        <textarea class="fallback-body" readonly rows="10"></textarea>
        <button type="button" class="button button-outline fallback-copy">Copy to clipboard</button>
      `;
      const submitBtn = form.querySelector("button[type='submit']");
      form.insertBefore(fallback, submitBtn);

      fallback.querySelector(".fallback-copy").addEventListener("click", () => {
        const ta = fallback.querySelector(".fallback-body");
        ta.select();
        ta.setSelectionRange(0, 99999);
        navigator.clipboard?.writeText(ta.value).catch(() => document.execCommand("copy"));
        fallback.querySelector(".fallback-copy").textContent = "Copied!";
        setTimeout(() => { fallback.querySelector(".fallback-copy").textContent = "Copy to clipboard"; }, 2000);
      });
    }
    fallback.querySelector(".fallback-body").value =
      `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    fallback.style.display = "";

    const message = form.querySelector(".form-note");
    message.textContent = "Email app opening… If it didn't launch, use the copy panel above to send manually.";
  });
})();

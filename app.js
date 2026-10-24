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

    // FormSubmit control fields
    formData.append("_subject", `New project request — ${values["project-type"] || "Curious Layer"}`);
    formData.append("_captcha", "false");
    formData.append("_template", "table");
    formData.append("_replyto", values.email || "");

    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    message.textContent = "Sending your request, please wait…";

    fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success === "true" || result.success === true) {
          // Replace form content with a success screen
          form.innerHTML = `
            <div class="form-success full-field">
              <div class="success-icon">✓</div>
              <h3>Request sent!</h3>
              <p>We've received your project brief and will reply to <strong>${values.email || "you"}</strong> soon.</p>
              <p class="success-sub">Curious Layer · Chennai, India</p>
            </div>`;
        } else {
          throw new Error("Send failed");
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send request <span>↗</span>";
        message.textContent = "Something went wrong. Please try again or email us directly at " + recipient;
      });
  });
})();

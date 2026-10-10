
const CONFIG = {
  name: "Denis O. Onduso",
  email: "denisonyancha71@gmail.com",
  github: "https://github.com/denis541",
  linkedin: "",                     
  resume: "assets/resume.pdf"     
};

document.addEventListener("DOMContentLoaded", () => {
  // Apply links from CONFIG
  document.querySelectorAll("[data-link]").forEach(el => {
    const key = el.dataset.link;
    if (key === "email") { el.href = "mailto:" + CONFIG.email; return; }
    if (key === "linkedin" && !CONFIG.linkedin) {
      el.href = "#";
      el.title = "LinkedIn link coming soon";
      el.addEventListener("click", e => e.preventDefault());
      return;
    }
    if (CONFIG[key]) el.href = CONFIG[key];
  });
  document.querySelectorAll("[data-text='email']").forEach(el => el.textContent = CONFIG.email);

  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Theme toggle (saved in the browser)
  const root = document.documentElement;
  const tbtn = document.getElementById("theme-toggle");
  const syncLabel = () => {
    if (tbtn) tbtn.setAttribute("aria-label", root.getAttribute("data-theme") === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };
  syncLabel();
  if (tbtn) tbtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncLabel();
  });

  // Highlight the nav link of the section in view
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = navLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) current = sections[sections.length - 1];
    navLinks.forEach(a => {
      const on = current && a.getAttribute("href") === "#" + current.id;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", e => {
      if (e.target.tagName === "A") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
    });
  }

  // Profile photo: tries profile.jpg, .jpeg, .png, .webp; shows initials only if none is found
  const photo = document.getElementById("profile-photo");
  if (photo) {
    const exts = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"];
    let i = 0;
    const next = () => {
      i++;
      if (i < exts.length) { photo.src = "assets/profile." + exts[i]; }
      else { photo.style.display = "none"; }
    };
    photo.addEventListener("error", next);
    if (photo.complete && photo.naturalWidth === 0) next();
  }

  // Resume viewer
  const frame = document.getElementById("resume-frame");
  const dl = document.getElementById("resume-download");
  if (frame) frame.src = CONFIG.resume;
  if (dl) { dl.href = CONFIG.resume; }

  // Contact form: sends to your email through FormSubmit (no server needed)
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    const btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      status.className = "form-status";
      if (form.elements["website"].value) return; // honeypot: bots only
      btn.disabled = true; btn.textContent = "Sending...";
      try {
        const res = await fetch("https://formsubmit.co/ajax/" + CONFIG.email, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: form.elements["name"].value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim(),
            _subject: "Portfolio message: " + (form.subject.value.trim() || "New enquiry"),
            _replyto: form.email.value.trim(),
            _template: "table",
            _captcha: "false"
          })
        });
        const data = await res.json();
        if (res.ok && (data.success === true || data.success === "true")) {
          status.textContent = "Thank you. Your message has been sent and I will reply by email.";
          status.className = "form-status ok";
          form.reset();
        } else {
          throw new Error(data.message || "Request failed");
        }
      } catch (err) {
        status.innerHTML = "Your message could not be sent. Please email me directly at <a href='mailto:" + CONFIG.email + "'>" + CONFIG.email + "</a>.";
        status.className = "form-status err";
      } finally {
        btn.disabled = false; btn.textContent = "Send message";
      }
    });
  }
});

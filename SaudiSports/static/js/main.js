/* ==========================================================================
   SaudiSports - Main JavaScript (shared by every page)
   --------------------------------------------------------------------------
   1. Scroll effects (navbar shadow, progress bar, back-to-top button)
   2. Reveal on scroll
   ========================================================================== */


/* ---------- 1. Scroll effects ---------- */
const siteNav = document.getElementById("siteNav");
const scrollProgress = document.getElementById("scrollProgress");
const toTopButton = document.getElementById("toTop");

function handleScroll() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Progress bar width = how far the user has scrolled (0% to 100%)
  scrollProgress.style.width = maxScroll > 0 ? (scrollTop / maxScroll) * 100 + "%" : "0%";

  // Add a shadow to the navbar after the first few pixels
  siteNav.classList.toggle("scrolled", scrollTop > 20);

  // Show the back-to-top button after 400px
  toTopButton.classList.toggle("show", scrollTop > 400);
}

window.addEventListener("scroll", handleScroll);
handleScroll(); // run once on page load

toTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ---------- 2. Reveal on scroll ---------- */
// Elements with class "reveal" get class "visible" when they enter the screen.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target); // animate only once
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* ---------- 3. Ticker (home page) ---------- */
// Repeats the group of sports 3 more times so the loop is seamless on wide screens.
const tickerTrack = document.querySelector(".ticker-track");

if (tickerTrack) {
  const original = tickerTrack.firstElementChild;

  for (let i = 0; i < 3; i++) {
    const copy = original.cloneNode(true);
    copy.setAttribute("aria-hidden", "true"); // hide copies from screen readers
    copy.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
    tickerTrack.appendChild(copy);
  }

  tickerTrack.classList.add("running"); // start the animation
}

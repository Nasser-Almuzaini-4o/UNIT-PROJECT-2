/* ==========================================================================
   SaudiSports - Main JavaScript (shared by every page)
   --------------------------------------------------------------------------
   1. Scroll effects (navbar shadow, progress bar, back-to-top button)
   2. Reveal on scroll
   3. Ticker (home page)
   4. Filters (stadiums city filter + events category filter)
   5. Tabs memory (Falcons journey on the esports page)
   ========================================================================== */


/* ---------- 1. Scroll effects ---------- */
const siteNav = document.getElementById("siteNav");
const scrollProgress = document.getElementById("scrollProgress");
const toTopButton = document.getElementById("toTop");

function handleScroll() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Progress bar width = how far the user has scrolled (0% to 100%)
  if (scrollProgress) {
    scrollProgress.style.width = maxScroll > 0 ? (scrollTop / maxScroll) * 100 + "%" : "0%";
  }

  // Add a shadow to the navbar after the first few pixels
  if (siteNav) siteNav.classList.toggle("scrolled", scrollTop > 20);

  // Show the back-to-top button after 400px
  if (toTopButton) toTopButton.classList.toggle("show", scrollTop > 400);
}

window.addEventListener("scroll", handleScroll);
handleScroll(); // run once on page load

if (toTopButton) {
  toTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


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


/* ---------- 4. Filters ---------- */
// The filters already work with CSS only (radio buttons). This code adds:
//   - a number badge on every filter button
//   - a live counter ("showing 7 of 14")
//   - an empty message
//   - hiding timeline era headings that have no events
//   - remembering the choice in the URL: /stadiums/#city=jeddah

// Read / write the "#key=value" part of the address without jumping the page.
function getHashParams() {
  return new URLSearchParams(window.location.hash.slice(1));
}

function setHashParam(key, value, defaultValue) {
  const params = getHashParams();

  if (value === defaultValue) {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  const hash = params.toString();
  const url = window.location.pathname + window.location.search + (hash ? "#" + hash : "");
  history.replaceState(null, "", url);
}

// "c-riyadh" -> "riyadh", "ev-all" -> "all"
function radioValue(radio) {
  return radio.id.split("-").slice(1).join("-");
}

// One entry per filtered section. root = wrapper, itemAttr = attribute on each card.
const FILTER_GROUPS = [
  {
    root: ".cityfilter",           // stadiums.html
    labels: ".city-labels",
    itemSelector: ".arena",
    itemAttr: "data-city",
    param: "city",
    unit: "ملعباً",
    emptyText: "لا توجد ملاعب في هذه المدينة ضمن الخطة الحالية.",
  },
  {
    root: ".evfilter",             // events.html
    labels: ".ev-labels",
    itemSelector: ".tl-item",
    itemAttr: "data-cat",
    param: "type",
    unit: "حدثاً",
    emptyText: "لا توجد أحداث من هذا النوع.",
    groupHead: ".tl-era",         // era headings: past / present / future
    groupKeep: ".era-now",        // the present era always stays (it holds the "you are here" marker)
  },
];

function initFilter(cfg) {
  const root = document.querySelector(cfg.root);
  if (!root) return;

  const radios = Array.from(root.querySelectorAll('input[type="radio"]'));
  const items = Array.from(root.querySelectorAll(cfg.itemSelector));
  const labelsBox = root.querySelector(cfg.labels);
  if (!radios.length || !items.length || !labelsBox) return;

  const total = items.length;
  const matches = (item, value) => value === "all" || item.getAttribute(cfg.itemAttr) === value;

  // 1. Number badge inside every filter button
  radios.forEach((radio) => {
    const label = root.querySelector('label[for="' + radio.id + '"]');
    if (!label) return;

    const badge = document.createElement("span");
    badge.className = "filter-badge";
    badge.textContent = items.filter((item) => matches(item, radioValue(radio))).length;
    label.appendChild(badge);
  });

  // 2. Live counter under the buttons (announced politely to screen readers)
  const counter = document.createElement("p");
  counter.className = "filter-count";
  counter.setAttribute("role", "status");
  counter.setAttribute("aria-live", "polite");
  labelsBox.after(counter);

  // 3. Empty message after the list
  const empty = document.createElement("div");
  empty.className = "filter-empty";
  empty.textContent = cfg.emptyText;
  items[0].parentElement.after(empty);

  // Hide era headings that have no visible events (events page only)
  function syncGroups(value) {
    if (!cfg.groupHead) return;

    root.querySelectorAll(cfg.groupHead).forEach((head) => {
      let node = head.nextElementSibling;
      let hasVisible = false;

      while (node && !node.matches(cfg.groupHead)) {
        if (node.matches(cfg.itemSelector) && matches(node, value)) hasVisible = true;
        node = node.nextElementSibling;
      }

      const keep = cfg.groupKeep && head.matches(cfg.groupKeep);
      head.classList.toggle("is-empty", !hasVisible && !keep);
    });
  }

  function apply(value) {
    const shown = items.filter((item) => matches(item, value)).length;

    counter.textContent = value === "all"
      ? "يعرض " + total + " " + cfg.unit
      : "يعرض " + shown + " من " + total + " " + cfg.unit;

    empty.classList.toggle("show", shown === 0);
    syncGroups(value);
  }

  // Check the radio that matches a value; returns false if there is none
  function select(value) {
    const radio = radios.find((r) => radioValue(r) === value);
    if (!radio) return false;
    radio.checked = true;
    apply(value);
    return true;
  }

  // A click or arrow key changes the radio: update counter + address
  root.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    const value = radioValue(event.target);
    apply(value);
    setHashParam(cfg.param, value, "all");
  });

  // Apply the choice stored in the address (on load, and on back / forward)
  function fromHash() {
    const wanted = getHashParams().get(cfg.param) || "all";
    if (!select(wanted)) select("all");
  }

  fromHash();
  window.addEventListener("hashchange", fromHash);
}

FILTER_GROUPS.forEach(initFilter);


/* ---------- 5. Tabs memory ---------- */
// The Falcons tabs also work with CSS only. This remembers the chosen year in the URL:
// /esports/#falcons=2026
function initTabs(cfg) {
  const root = document.querySelector(cfg.root);
  if (!root) return;

  const radios = Array.from(root.querySelectorAll('input[type="radio"]'));
  if (!radios.length) return;

  const valueOf = (radio) => radio.id.replace(cfg.prefix, "");
  const defaultValue = valueOf(radios[0]);

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      setHashParam(cfg.param, valueOf(radio), defaultValue);
    });
  });

  function fromHash() {
    const wanted = getHashParams().get(cfg.param);
    const found = radios.find((radio) => valueOf(radio) === wanted) || radios[0];
    found.checked = true;
  }

  fromHash();
  window.addEventListener("hashchange", fromHash);
}

initTabs({ root: ".ftabs", param: "falcons", prefix: "fy" });

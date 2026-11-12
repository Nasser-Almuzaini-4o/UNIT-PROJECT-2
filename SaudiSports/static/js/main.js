/* ==========================================================================
   SaudiSports - Main JavaScript
   Shared by all pages

   1. Scroll effects
   2. Reveal on scroll
   3. Home ticker
   4. URL hash helpers
   5. Stadiums and events filters
   6. Falcons tabs
   7. Olympic medals filter
   ========================================================================== */


/* ==========================================================================
   1. SCROLL EFFECTS
   Navbar shadow, scroll progress, and back-to-top button
   ========================================================================== */

const siteNav = document.getElementById("siteNav");
const scrollProgress = document.getElementById("scrollProgress");
const toTopButton = document.getElementById("toTop");

function handleScroll() {
    const scrollTop = window.scrollY;
    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    if (scrollProgress) {
        const progress = maxScroll > 0
            ? (scrollTop / maxScroll) * 100
            : 0;

        scrollProgress.style.width = `${progress}%`;
    }

    if (siteNav) {
        siteNav.classList.toggle("scrolled", scrollTop > 20);
    }

    if (toTopButton) {
        toTopButton.classList.toggle("show", scrollTop > 400);
    }
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

if (toTopButton) {
    toTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* ==========================================================================
   2. REVEAL ON SCROLL
   Elements with .reveal become visible when entering the viewport.
   ========================================================================== */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}


/* ==========================================================================
   3. HOME PAGE TICKER
   Duplicates the original ticker group for a seamless animation.
   ========================================================================== */

const tickerTrack = document.querySelector(".ticker-track");

if (tickerTrack) {
    const originalGroup = tickerTrack.firstElementChild;

    if (originalGroup) {
        for (let i = 0; i < 3; i++) {
            const copy = originalGroup.cloneNode(true);

            copy.setAttribute("aria-hidden", "true");

            copy.querySelectorAll("a").forEach((link) => {
                link.setAttribute("tabindex", "-1");
            });

            tickerTrack.appendChild(copy);
        }

        tickerTrack.classList.add("running");
    }
}


/* ==========================================================================
   4. URL HASH HELPERS
   Shared by filters and Falcons tabs.
   ========================================================================== */

// Read parameters from the URL hash.
function getHashParams() {
    return new URLSearchParams(window.location.hash.slice(1));
}

// Update one parameter without jumping to another page section.
function setHashParam(key, value, defaultValue) {
    const params = getHashParams();

    if (value === defaultValue) {
        params.delete(key);
    } else {
        params.set(key, value);
    }

    const hash = params.toString();

    const url =
        window.location.pathname +
        window.location.search +
        (hash ? `#${hash}` : "");

    history.replaceState(null, "", url);
}

// Convert radio IDs such as "c-riyadh" into "riyadh".
function radioValue(radio) {
    return radio.id.split("-").slice(1).join("-");
}


/* ==========================================================================
   5. STADIUMS AND EVENTS FILTERS
   Adds counters, filter badges, empty messages, and URL memory.
   ========================================================================== */

const FILTER_GROUPS = [
    {
        root: ".cityfilter",
        labels: ".city-labels",
        itemSelector: ".arena",
        itemAttr: "data-city",
        param: "city",
        unit: "ملعباً",
        emptyText: "لا توجد ملاعب في هذه المدينة ضمن الخطة الحالية."
    },
    {
        root: ".evfilter",
        labels: ".ev-labels",
        itemSelector: ".tl-item",
        itemAttr: "data-cat",
        param: "type",
        unit: "حدثاً",
        emptyText: "لا توجد أحداث من هذا النوع.",
        groupHead: ".tl-era",
        groupKeep: ".era-now"
    }
];

function initFilter(config) {
    const root = document.querySelector(config.root);

    if (!root) return;

    const radios = Array.from(
        root.querySelectorAll('input[type="radio"]')
    );

    const items = Array.from(
        root.querySelectorAll(config.itemSelector)
    );

    const labelsBox = root.querySelector(config.labels);

    if (!radios.length || !items.length || !labelsBox) return;

    const total = items.length;

    const matches = (item, value) => {
        return value === "all" ||
            item.getAttribute(config.itemAttr) === value;
    };


    // Add a number badge to each filter label.
    radios.forEach((radio) => {
        const label = root.querySelector(
            `label[for="${radio.id}"]`
        );

        if (!label || label.querySelector(".filter-badge")) return;

        const badge = document.createElement("span");

        badge.className = "filter-badge";
        badge.textContent = items.filter((item) => {
            return matches(item, radioValue(radio));
        }).length;

        label.appendChild(badge);
    });


    // Create the live counter.
    let counter = root.querySelector(".filter-count");

    if (!counter) {
        counter = document.createElement("p");
        counter.className = "filter-count";
        counter.setAttribute("role", "status");
        counter.setAttribute("aria-live", "polite");

        labelsBox.after(counter);
    }


    // Create the empty message.
    let empty = root.querySelector(".filter-empty");

    if (!empty) {
        empty = document.createElement("div");
        empty.className = "filter-empty";
        empty.textContent = config.emptyText;

        items[0].parentElement.after(empty);
    }


    // Hide timeline headings that have no visible events.
    function syncGroups(value) {
        if (!config.groupHead) return;

        root.querySelectorAll(config.groupHead).forEach((heading) => {
            let node = heading.nextElementSibling;
            let hasVisibleItems = false;

            while (node && !node.matches(config.groupHead)) {
                if (
                    node.matches(config.itemSelector) &&
                    matches(node, value)
                ) {
                    hasVisibleItems = true;
                }

                node = node.nextElementSibling;
            }

            const keepHeading =
                config.groupKeep &&
                heading.matches(config.groupKeep);

            heading.classList.toggle(
                "is-empty",
                !hasVisibleItems && !keepHeading
            );
        });
    }


    // Update the counter and empty message.
    function applyFilter(value) {
        const shown = items.filter((item) => {
            return matches(item, value);
        }).length;

        counter.textContent = value === "all"
            ? `يعرض ${total} ${config.unit}`
            : `يعرض ${shown} من ${total} ${config.unit}`;

        empty.classList.toggle("show", shown === 0);

        syncGroups(value);
    }


    // Select a filter using its value.
    function selectFilter(value) {
        const radio = radios.find((item) => {
            return radioValue(item) === value;
        });

        if (!radio) return false;

        radio.checked = true;
        applyFilter(value);

        return true;
    }


    // Listen for filter changes.
    root.addEventListener("change", (event) => {
        if (!event.target.matches('input[type="radio"]')) return;

        const value = radioValue(event.target);

        applyFilter(value);

        setHashParam(config.param, value, "all");
    });


    // Restore the filter from the URL.
    function fromHash() {
        const wanted = getHashParams().get(config.param) || "all";

        if (!selectFilter(wanted)) {
            selectFilter("all");
        }
    }

    fromHash();

    window.addEventListener("hashchange", fromHash);
}

FILTER_GROUPS.forEach(initFilter);


/* ==========================================================================
   6. FALCONS TABS
   Remembers the selected year in the URL.
   Example: /esports/#falcons=2026
   ========================================================================== */

function initTabs(config) {
    const root = document.querySelector(config.root);

    if (!root) return;

    const radios = Array.from(
        root.querySelectorAll('input[type="radio"]')
    );

    if (!radios.length) return;

    const valueOf = (radio) => {
        return radio.id.replace(config.prefix, "");
    };

    const defaultValue = valueOf(radios[0]);


    // Save the selected year.
    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
            setHashParam(
                config.param,
                valueOf(radio),
                defaultValue
            );
        });
    });


    // Restore the selected year from the URL.
    function fromHash() {
        const wanted = getHashParams().get(config.param);

        const selected = radios.find((radio) => {
            return valueOf(radio) === wanted;
        }) || radios[0];

        selected.checked = true;
    }

    fromHash();

    window.addEventListener("hashchange", fromHash);
}

initTabs({
    root: ".ftabs",
    param: "falcons",
    prefix: "fy"
});


/* ==========================================================================
   7. OLYMPIC MEDALS FILTER
   Filters the sport cards on the Olympic page, updates the medal summary
   (gold / silver / bronze / total), and remembers the sport in the URL.
   Example: /olympic/#sport=athletics
   Medal numbers are read from data-gold, data-silver and data-bronze
   on each .oly-sport card.
   ========================================================================== */

function initMedalFilter() {
    const root = document.querySelector(".oly-filter");

    if (!root) return;

    const chips = Array.from(root.querySelectorAll(".oly-chip"));
    const cards = Array.from(root.querySelectorAll(".oly-sport"));
    const summary = root.querySelector(".oly-summary");

    if (!chips.length || !cards.length || !summary) return;

    const nameEl = summary.querySelector("[data-summary-name]");
    const subEl = summary.querySelector("[data-summary-sub]");
    const iconEl = summary.querySelector("[data-summary-icon]");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    // Add up the medals of a list of cards.
    function sumMedals(list) {
        const result = { gold: 0, silver: 0, bronze: 0, total: 0 };

        list.forEach((card) => {
            result.gold += Number(card.dataset.gold) || 0;
            result.silver += Number(card.dataset.silver) || 0;
            result.bronze += Number(card.dataset.bronze) || 0;
        });

        result.total = result.gold + result.silver + result.bronze;

        return result;
    }

    const cardsFor = (value) => {
        return value === "all"
            ? cards
            : cards.filter((card) => card.dataset.sport === value);
    };


    // Show the medal count on every chip.
    chips.forEach((chip) => {
        const badge = chip.querySelector("b");

        if (badge) {
            badge.textContent = sumMedals(cardsFor(chip.dataset.sport)).total;
        }
    });


    // Show one sport (or all) and update the summary panel.
    function applyFilter(value) {
        const chip = chips.find((item) => item.dataset.sport === value);

        if (!chip) return;

        cards.forEach((card) => {
            card.hidden = value !== "all" && card.dataset.sport !== value;
        });

        chips.forEach((item) => {
            const active = item === chip;

            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        const totals = sumMedals(cardsFor(value));

        summary.querySelectorAll("[data-sum]").forEach((element) => {
            element.textContent = totals[element.dataset.sum];
        });

        const chipName = chip.querySelector("span");
        const chipIcon = chip.querySelector("i");

        if (nameEl && chipName) nameEl.textContent = chipName.textContent;
        if (subEl) subEl.textContent = chip.dataset.games || "";
        if (iconEl && chipIcon) iconEl.className = chipIcon.className;
    }


    // Click on a chip.
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            applyFilter(chip.dataset.sport);

            setHashParam("sport", chip.dataset.sport, "all");

            chip.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                inline: "center",
                block: "nearest"
            });
        });
    });


    // Restore the sport from the URL.
    function fromHash() {
        const wanted = getHashParams().get("sport") || "all";
        const exists = chips.some((chip) => chip.dataset.sport === wanted);

        applyFilter(exists ? wanted : "all");
    }

    fromHash();

    window.addEventListener("hashchange", fromHash);
}

initMedalFilter();

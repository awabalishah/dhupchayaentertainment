(() => {
  const D = window.DHUPCHAYA;
  const $ = (s, el = document) => el.querySelector(s);
  const byId = Object.fromEntries(D.titles.map(t => [t.id, t]));

  const fmt = n => n >= 1e6 ? +(n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : String(n);
  const thumb = (id, q = "maxresdefault") => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
  // Not every upload has a maxres thumbnail; fall back to hq.
  const img = (id, alt, cls = "") =>
    `<img class="${cls}" src="${thumb(id)}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${thumb(id, "hqdefault")}'">`;
  const eye = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;

  /* ---------- Player modal ---------- */
  const modal = $("#modal"), frame = $("#modalFrame");
  let lastFocus;
  function play(id) {
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="YouTube video"></iframe>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("#modalClose").focus();
  }
  function closePlayer() {
    modal.hidden = true; frame.innerHTML = "";
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  }
  $("#modalClose").addEventListener("click", closePlayer);
  modal.addEventListener("click", e => { if (e.target === modal) closePlayer(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closePlayer(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-play]");
    if (b) play(b.dataset.play);
  });

  /* ---------- Hero slideshow ---------- */
  const slides = D.featured.map(id => byId[id]);
  $("#heroSlides").innerHTML = slides.map(t =>
    `<div class="hero-slide" style="background-image:url('${thumb(t.id)}'),url('${thumb(t.id, "hqdefault")}')"></div>`).join("");
  $("#heroDots").innerHTML = slides.map((t, i) =>
    `<button role="tab" aria-label="Show ${t.title}" data-i="${i}"><i></i>${t.title}</button>`).join("");
  const slideEls = [...document.querySelectorAll(".hero-slide")];
  const dotEls = [...document.querySelectorAll("#heroDots button")];
  let cur = -1, timer;

  function show(i) {
    if (i === cur) return;
    cur = i;
    const t = slides[i];
    slideEls.forEach((s, j) => s.classList.toggle("is-active", j === i));
    dotEls.forEach((d, j) => d.classList.toggle("is-active", j === i));
    $("#heroTag").textContent = t.tag || "Now streaming";
    $("#heroTitle").textContent = t.title;
    $("#heroBn").textContent = t.bn;
    $("#heroMeta").innerHTML = `<span><b>${fmt(t.views)}</b> views</span><span>${t.year}</span><span>Starring <b>${t.cast.join(", ")}</b></span><span>Dir. ${t.director}</span>`;
    $("#heroLog").textContent = t.logline;
    $("#heroPlay").dataset.play = t.id;
    $("#heroTrailer").dataset.play = t.trailer || t.id;
    $("#heroTrailer").hidden = !t.trailer;
    const c = $(".hero-content");
    c.classList.remove("hero-fade"); void c.offsetWidth; c.classList.add("hero-fade");
    clearTimeout(timer);
    timer = setTimeout(() => show((cur + 1) % slides.length), 7000);
  }
  dotEls.forEach(d => d.addEventListener("click", () => show(+d.dataset.i)));
  show(0);

  /* ---------- Marquee ---------- */
  const items = D.titles.map(t => `<span>${t.title}</span><span class="bn">${t.bn}</span>`).join("");
  $("#marquee").innerHTML = items + items;

  /* ---------- Originals grid ---------- */
  const filters = {
    all: () => true,
    eid: t => /eid/i.test(t.tag || ""),
    2026: t => t.year === 2026,
    film: t => t.type === "film",
  };
  function renderGrid(f = "all") {
    $("#grid").innerHTML = D.titles.filter(filters[f]).map((t, i) => `
      <button class="card" data-play="${t.id}" style="animation-delay:${i * 40}ms" aria-label="Play ${t.title}">
        <div class="card-thumb">
          ${t.tag ? `<span class="badge">${t.tag}</span>` : ""}
          ${img(t.id, t.title)}
          <span class="play-ring">${eye}</span>
          <span class="views">${eye}${fmt(t.views)} views</span>
        </div>
        <div class="card-title"><h3>${t.title}</h3><span class="bn">${t.bn}</span></div>
        <div class="card-meta"><b>${t.cast.join(" · ")}</b> — Dir. ${t.director}, ${t.year}</div>
      </button>`).join("");
  }
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("is-active", c === b));
    renderGrid(b.dataset.filter);
  });
  renderGrid();

  /* ---------- Music ---------- */
  $("#tracks").innerHTML = D.music.map(m => `
    <li class="track"><button data-play="${m.id}" aria-label="Play ${m.title}">
      <span class="track-num"></span>
      ${img(m.id, "")}
      <span class="track-name">${m.title}${m.bn ? `<span class="bn">${m.bn}</span>` : ""}
        <span class="track-sub">${m.artists} · from <i>${m.from}</i></span></span>
      <span class="track-views">${fmt(m.views)} plays</span>
    </button></li>`).join("");

  /* ---------- Faces (unique cast) ---------- */
  const cast = [...new Set(D.titles.flatMap(t => t.cast))];
  $("#faces").innerHTML = cast.map(c => `<span>${c}</span>`).join("");

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.addEventListener("click", e => {
    if (e.target.tagName === "A" && links.classList.contains("open")) burger.click();
  });

  /* ---------- Reveal + count-up ---------- */
  document.querySelectorAll(".section-head, .stat, .service, .about-copy, .spot-copy, .spot-poster, .contact-copy, .form, .track")
    .forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    const b = en.target.querySelector("[data-count]");
    if (b) countUp(b);
    io.unobserve(en.target);
  }), { threshold: .15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = String(end).includes(".") ? 1 : 0, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + el.dataset.suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Contact form ---------- */
  // Static site: opens the visitor's email client. Swap for Formspree / a backend when ready.
  $("#contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Name: ${f.get("name")}\nCompany: ${f.get("company")}\nEmail: ${f.get("email")}\n\n${f.get("message")}`;
    location.href = `mailto:business@dhupchayaentertainment.com?subject=${encodeURIComponent("Enquiry: " + f.get("topic"))}&body=${encodeURIComponent(body)}`;
    $("#formNote").textContent = "Opening your email app…";
  });

  $("#year").textContent = new Date().getFullYear();
})();

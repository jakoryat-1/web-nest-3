/* =========================================================
   fx.js — shared engine for all NEST landing-style pages
   (Three.js bg + GSAP + nav + cursor + marquee + rendering)
   Every feature is guarded by element presence, so each page
   only runs what it actually contains.
   Requires: data.js loaded first (window.NEST_DATA).
   ========================================================= */
(function () {
  "use strict";
  var D = window.NEST_DATA || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 760;

  function formatVND(n) { return new Intl.NumberFormat("vi-VN").format(Math.round(n)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function starHTML(rating) {
    var s = "";
    for (var i = 1; i <= 5; i++) {
      if (rating >= i) s += "★";
      else if (rating >= i - 0.5) s += "⯪";
      else s += '<span class="off">★</span>';
    }
    return '<div class="stars">' + s + ' <span style="color:var(--muted);font-size:.8rem">' + rating + '/5</span></div>';
  }
  function countUp(el, target, dur) {
    dur = dur || 1600;
    var start = performance.now();
    (function frame(now) {
      var p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = formatVND(target * e);
      if (p < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  /* ===================== THREE.JS BACKGROUND ===================== */
  function initThree() {
    var canvas = document.getElementById("bg-canvas");
    if (!canvas || reduced || typeof THREE === "undefined") return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isTouch }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 22;

    var COUNT = isTouch ? 2600 : 6500;
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    var palette = [[0.66,0.85,0.73],[0.37,0.72,0.50],[0.50,0.79,0.60],[0.82,0.93,0.85]];
    for (var i = 0; i < COUNT; i++) {
      var r = 14 + Math.random() * 22, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r*Math.sin(ph)*Math.cos(th); pos[i*3+1] = r*Math.sin(ph)*Math.sin(th)*0.6; pos[i*3+2] = r*Math.cos(ph);
      var c = palette[(Math.random()*palette.length)|0];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
    geo.setAttribute("color", new THREE.BufferAttribute(col,3));
    var points = new THREE.Points(geo, new THREE.PointsMaterial({ size:0.13, vertexColors:true, transparent:true, opacity:0.9, depthWrite:false }));
    scene.add(points);

    var shapes = [];
    [{g:new THREE.IcosahedronGeometry(3.2,0),p:[-12,5,-4]},
     {g:new THREE.OctahedronGeometry(2.4,0),p:[13,-6,-2]},
     {g:new THREE.TorusGeometry(2.2,0.5,12,30),p:[9,7,-6]},
     {g:new THREE.DodecahedronGeometry(2.0,0),p:[-11,-7,-3]}].forEach(function (d) {
      var mesh = new THREE.Mesh(d.g, new THREE.MeshBasicMaterial({ color:0x5fb87f, wireframe:true, transparent:true, opacity:0.4 }));
      mesh.position.set(d.p[0],d.p[1],d.p[2]);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      scene.add(mesh); shapes.push(mesh);
    });

    var tx=0, ty=0, mx=0, my=0;
    window.addEventListener("mousemove", function (e) { tx = e.clientX/window.innerWidth-0.5; ty = e.clientY/window.innerHeight-0.5; });
    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      points.rotation.y = t*0.05; points.rotation.x = Math.sin(t*0.1)*0.1;
      shapes.forEach(function (s,i) { s.rotation.x += 0.002+i*0.0004; s.rotation.y += 0.003+i*0.0003; s.position.y += Math.sin(t*0.6+i)*0.004; });
      mx += (tx-mx)*0.05; my += (ty-my)*0.05;
      camera.position.x += (mx*6 - camera.position.x)*0.05;
      camera.position.y += (-my*4 - camera.position.y)*0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ===================== GSAP ===================== */
  function initGSAP() {
    if (typeof gsap === "undefined") {
      document.querySelectorAll(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      document.querySelectorAll(".hero .line > span").forEach(function (s) { s.style.transform = "none"; });
      return;
    }
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var heroLines = document.querySelectorAll(".hero .line > span");
    if (!reduced && heroLines.length) {
      gsap.set(".hero .line > span", { yPercent: 110 });
      gsap.timeline({ delay: 0.2 })
        .to(".hero .line > span", { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.12 })
        .to(".hero .reveal", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 }, "-=0.6");
    } else {
      document.querySelectorAll(".hero .reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      heroLines.forEach(function (s) { s.style.transform = "none"; });
    }

    if (window.ScrollTrigger) {
      ScrollTrigger.batch(".block .reveal", {
        start: "top 86%",
        onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }); }
      });
      document.querySelectorAll("[data-count]").forEach(function (el) {
        var target = +el.getAttribute("data-count");
        ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () {
          var o = { v: 0 }; gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
        }});
      });
      gsap.to(".b1", { y: 160, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } });
      gsap.to(".b2", { y: -180, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } });
      gsap.to(".b3", { y: 120, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.4 } });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    }
  }

  /* ===================== MARQUEE (mô hình hoạt động) ===================== */
  function initMarquee() {
    var box = document.getElementById("marquee");
    var track = document.getElementById("mtrack");
    if (!box || !track) return;

    // duplicate the set once for a seamless loop
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (n) { track.appendChild(n.cloneNode(true)); });

    var half = 0;
    function measure() { half = track.scrollWidth / 2; }
    measure();
    window.addEventListener("resize", measure);

    var pos = 0, speed = 55; // px per second (auto)
    var hovering = false, dragging = false, startX = 0, startPos = 0;
    var last = performance.now();

    function normalize() { while (pos <= -half) pos += half; while (pos > 0) pos -= half; }

    box.addEventListener("pointerenter", function () { hovering = true; });
    box.addEventListener("pointerleave", function () { hovering = false; dragging = false; box.classList.remove("grabbing"); });
    box.addEventListener("pointerdown", function (e) { dragging = true; startX = e.clientX; startPos = pos; box.classList.add("grabbing"); });
    window.addEventListener("pointerup", function () { dragging = false; box.classList.remove("grabbing"); });
    box.addEventListener("pointermove", function (e) {
      if (dragging) { pos = startPos + (e.clientX - startX); }
      else if (hovering && e.movementX) { pos += e.movementX; }   // hover qua lại
    });

    (function loop(now) {
      requestAnimationFrame(loop);
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!hovering && !dragging) pos -= speed * dt;
      normalize();
      track.style.transform = "translateX(" + pos + "px)";
    })(performance.now());
  }

  /* ===================== UI: nav, cursor ===================== */
  function initUI() {
    var header = document.getElementById("header");
    if (header) window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 30); });
    var burger = document.getElementById("burger"), links = document.getElementById("navlinks");
    if (burger && links) {
      burger.addEventListener("click", function () { links.classList.toggle("open"); });
      links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
    }
    var cur = document.getElementById("cursor");
    if (cur && !isTouch) {
      var cx=0, cy=0, x=0, y=0;
      window.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; });
      (function l() { x += (cx-x)*0.2; y += (cy-y)*0.2; cur.style.left = x+"px"; cur.style.top = y+"px"; requestAnimationFrame(l); })();
      document.querySelectorAll("[data-cursor]").forEach(function (el) {
        el.addEventListener("mouseenter", function () { cur.classList.add("big"); });
        el.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
      });
    } else if (cur) { cur.style.display = "none"; }
  }

  /* ===================== DATA-DRIVEN RENDERING ===================== */
  function applyOrg() {
    document.querySelectorAll("[data-org-full]").forEach(function (el) { el.textContent = D.org.full; });
    document.querySelectorAll("[data-org-email]").forEach(function (el) { el.textContent = D.org.email; });
    document.querySelectorAll("[data-org-hotline]").forEach(function (el) { el.textContent = D.org.hotline; });
    document.querySelectorAll("[data-org-mailto]").forEach(function (el) { el.setAttribute("href", "mailto:" + D.org.email); });
  }

  function getPath(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function applyContent() {
    if (!D.content) return;
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      var v = getPath(D.content, el.getAttribute("data-bind"));
      if (v != null) el.textContent = v;
    });
  }
  var ICONS = {
    sprout:'<path d="M12 21v-9"/><path d="M12 12C12 8 9 5 4 5c0 4 3 7 8 7z"/><path d="M12 12c0-3 2-6 6-6 0 3-2 6-6 6z"/>',
    book:'<path d="M12 6c-1.5-1.3-3.5-2-6-2H3v13h3c2.5 0 4.5.7 6 2"/><path d="M12 6c1.5-1.3 3.5-2 6-2h3v13h-3c-2.5 0-4.5.7-6 2z"/><path d="M12 6v13"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    cap:'<path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v4c0 1.3 2.7 3 6 3s6-1.7 6-3v-4"/><path d="M22 9v5"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M9 8h4.5a2 2 0 0 1 0 4H9zm0 4h6M9 8v8"/>',
    community:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5"/><path d="M15 20c0-2.4.8-4.2 2.5-4.2 2.3 0 3.5 1.8 3.5 4.2"/>',
    growth:'<path d="M3 17l5-5 4 3 8-8"/><path d="M16 7h4v4"/>',
    play:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    star:'<path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/>',
    video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5 5-5"/>',
    bank:'<path d="M3 9l9-5 9 5z"/><path d="M5 9v8M10 9v8M14 9v8M19 9v8"/><path d="M3 20h18"/>',
    pencil:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M14 6l4 4"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    pin:'<path d="M12 22c5-5 8-8.5 8-12a8 8 0 1 0-16 0c0 3.5 3 7 8 12z"/><circle cx="12" cy="10" r="2.6"/>',
    heart:'<path d="M12 20s-7-4.5-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.5 12 20 12 20z"/>'
  };
  function iconSVG(id){ return '<svg class="ic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[id] + '</svg>'; }
  function iconOrText(v){ return ICONS[v] ? iconSVG(v) : esc(v); }

  function renderContentArrays() {
    var c = D.content || {};
    var featTpl = function (f) { return '<div class="feat reveal"><div class="ic">' + iconOrText(f.ic) + '</div><h3>' + esc(f.h) + '</h3><p>' + esc(f.p) + '</p></div>'; };
    var hs = document.getElementById("herostats-mount");
    if (hs && c.heroStats) hs.innerHTML = c.heroStats.map(function (s) { return '<div class="s reveal"><div class="n" data-count="' + esc(s.n) + '">0</div><div class="c">' + esc(s.c) + '</div></div>'; }).join("");
    var ft = document.getElementById("features-mount");
    if (ft && c.features) ft.innerHTML = c.features.map(featTpl).join("");
    var wf = document.getElementById("whyfeatures-mount");
    if (wf && c.whyFeatures) wf.innerHTML = c.whyFeatures.map(featTpl).join("");
    var is = document.getElementById("impactstats-mount");
    if (is && c.impactStats) is.innerHTML = c.impactStats.map(function (s) { return '<div><div class="n" data-count="' + esc(s.n) + '">0</div><div class="c">' + esc(s.c) + '</div></div>'; }).join("");
    var mt = document.getElementById("mtrack");
    if (mt && c.processSteps) mt.innerHTML = c.processSteps.map(function (s) { return '<div class="mstep"><div class="num">' + esc(s.num) + '</div><h3>' + esc(s.h) + '</h3><p>' + esc(s.p) + '</p></div>'; }).join("");
  }

  function renderFund() {
    var amountEl = document.getElementById("fund-amount");
    if (!amountEl) return;
    countUp(amountEl, D.fund.current);
    var goalEl = document.getElementById("fund-goal");
    if (goalEl) goalEl.textContent = formatVND(D.fund.goal) + " ₫";
    var bar = document.getElementById("fund-progress");
    if (bar) { var pct = Math.min((D.fund.current / D.fund.goal) * 100, 100); setTimeout(function () { bar.style.width = pct.toFixed(1) + "%"; }, 250); }
  }

  function renderSupporters() {
    var mount = document.getElementById("supporters-mount");
    if (!mount) return;
    var tiers = [
      { key:"platinum", badge:"Bạch Kim · Platinum", desc:"Mạnh thường quân cao nhất — đóng góp từ 100.000.000 ₫" },
      { key:"diamond",  badge:"Kim Cương · Diamond",  desc:"Đóng góp từ 50.000.000 ₫" },
      { key:"gold",     badge:"Vàng · Gold",          desc:"Đóng góp từ 10.000.000 ₫" }
    ];
    mount.innerHTML = tiers.map(function (t) {
      var list = D.supporters[t.key] || [];
      if (!list.length) return "";
      var cards = list.map(function (s) {
        var logo = s.logo
          ? '<div class="logo-box"><img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '"></div>'
          : '<div class="logo-box"><span>' + esc(s.name || "Logo") + '</span></div>';
        return '<article class="supporter reveal">' + logo + '<div class="meta"><h4>' + esc(s.name) + '</h4><p>' + esc(s.field) + '</p></div></article>';
      }).join("");
      return '<div class="tier tier-' + t.key + '"><div class="tier-head"><span class="tier-badge">' + t.badge + '</span></div><p class="tier-desc">' + t.desc + '</p><div class="supporter-grid">' + cards + '</div></div>';
    }).join("");
  }

  function renderCourses() {
    var mount = document.getElementById("courses-mount");
    if (!mount) return;
    mount.innerHTML = D.courses.map(function (track) {
      var cards = track.items.map(function (c) {
        var thumb = c.image
          ? '<div class="thumb"><img src="' + esc(c.image) + '" alt="' + esc(c.title) + '"><span class="level">' + esc(c.level) + '</span></div>'
          : '<div class="thumb"><span class="level">' + esc(c.level) + '</span></div>';
        var price = c.price > 0
          ? '<div class="price">' + formatVND(c.price) + '<small> ₫</small></div>'
          : '<div class="price"><span class="free">Miễn phí</span></div>';
        var btn = c.price > 0
          ? '<a href="#" class="btn btn-primary btn-sm" data-cursor>Đăng ký</a>'
          : '<a href="#" class="btn btn-ghost btn-sm" data-cursor>Học ngay</a>';
        return '<article class="course reveal">' + thumb + '<div class="body"><h3>' + esc(c.title) + '</h3>' +
          '<p class="course-desc">' + esc(c.desc) + '</p>' +
          '<div class="info"><span>⏱️ ' + esc(c.weeks) + ' tuần</span><span>🎥 ' + esc(c.lessons) + ' bài</span><span>⭐ ' + esc(c.rating) + '</span></div>' +
          '<div class="foot">' + price + btn + '</div></div></article>';
      }).join("");
      return '<div class="course-track"><h3 class="track-title reveal">' + esc(track.track) + '</h3><p class="track-sub reveal">' + esc(track.sub) + '</p><div class="course-grid">' + cards + '</div></div>';
    }).join("");
  }

  /* ----- MAP (subsection on patrons page) ----- */
  function initMap() {
    var map = document.getElementById("map");
    var popup = document.getElementById("map-popup");
    if (!map || !popup) return;
    var MAP = D.map || { places: [] };
    var PLACES = MAP.places || [];
    var pinned = null;

    if (MAP.image) {
      var img = document.createElement("img");
      img.className = "map-img"; img.src = MAP.image; img.alt = "Bản đồ điểm đến";
      map.insertBefore(img, map.firstChild);
      var ph = map.querySelector(".map-placeholder"); if (ph) ph.remove();
    }
    function build(p) {
      var im = p.image ? '<img class="pop-img" src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' : '<div class="pop-img ph">Ảnh địa danh</div>';
      popup.innerHTML = '<button class="close-pop" aria-label="Đóng">×</button>' + im +
        '<div class="pop-body"><span class="pop-cat">' + esc(p.category) + '</span><h3>' + esc(p.name) + '</h3>' +
        starHTML(p.rating) + '<p>' + esc(p.description) + '</p>' +
        '<div class="pop-hist"><strong>Lịch sử:</strong> ' + esc(p.history) + '</div></div>';
      popup.querySelector(".close-pop").addEventListener("click", hide);
    }
    function show(p, btn) {
      build(p); popup.classList.add("show");
      var r = btn.getBoundingClientRect();
      var left = r.left + r.width/2 - 150, top = r.bottom + 12;
      left = Math.max(10, Math.min(left, window.innerWidth - 310));
      if (top + 320 > window.innerHeight) top = r.top - 12 - popup.offsetHeight;
      popup.style.left = left + "px"; popup.style.top = Math.max(10, top) + "px";
    }
    function hide() { popup.classList.remove("show"); map.querySelectorAll(".hotspot.active").forEach(function (h) { h.classList.remove("active"); }); pinned = null; }
    PLACES.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.className = "hotspot"; btn.style.left = p.x + "%"; btn.style.top = p.y + "%"; btn.title = p.name; btn.textContent = i + 1;
      btn.addEventListener("mouseenter", function () { if (!pinned) { btn.classList.add("active"); show(p, btn); } });
      btn.addEventListener("mouseleave", function () { if (!pinned) { btn.classList.remove("active"); hide(); } });
      btn.addEventListener("click", function (e) { e.stopPropagation(); map.querySelectorAll(".hotspot.active").forEach(function (h) { h.classList.remove("active"); }); btn.classList.add("active"); show(p, btn); pinned = p; });
      map.appendChild(btn);
    });
    document.addEventListener("click", function (e) { if (pinned && !e.target.closest(".map-popup") && !e.target.closest(".hotspot")) hide(); });
    var coordEl = document.getElementById("coord");
    map.addEventListener("mousemove", function (e) {
      var r = map.getBoundingClientRect();
      var x = (((e.clientX - r.left) / r.width) * 100).toFixed(1), y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
      if (coordEl) coordEl.textContent = "Toạ độ con trỏ:  x: " + x + "%   y: " + y + "%";
    });
  }

  /* ===================== MARQUEE (MẠNH THƯỜNG QUÂN) ===================== */
  function renderPatronMarquee() {
    var track = document.getElementById("patron-track");
    if (!track || !D.supporters) return;

    // Gom tất cả mạnh thường quân ở các hạng vào 1 mảng chung
    var allSupporters = [].concat(
        D.supporters.platinum || [], 
        D.supporters.diamond || [], 
        D.supporters.gold || []
    );

    // Bỏ qua những ô trống chưa nhập tên
    var validSupporters = allSupporters.filter(function(s) { return s.name && s.name !== "Tên" && s.name !== "Tên nhà tài trợ"; });
    if(validSupporters.length === 0) return;

    // Render HTML
    var html = validSupporters.map(function(s) {
        var img = s.logo 
            ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '">' 
            : '<span style="font-size:2.5rem">🤝</span>';
            
        return '<div class="marquee-item">' + img + 
               '<strong>' + esc(s.name) + '</strong>' + 
               '<small>' + esc(s.field) + '</small></div>';
    }).join("");

    // NHÂN ĐÔI MÃ HTML VÀO TRACK ĐỂ TẠO VÒNG LẶP VÔ TẬN
    track.innerHTML = html + html;
  }

  /* ===================== KHỞI TẠO TẤT CẢ KHI TRANG TẢI XONG ===================== */
  document.addEventListener("DOMContentLoaded", async function () {
    
    // 1. Chờ lấy dữ liệu từ Database
    if (typeof fetchWebData === "function") await fetchWebData();
    
    // 2. Gán dữ liệu vào biến D
    D = window.NEST_DATA || {};

    // 3. Chạy các hàm render
    applyOrg();
    applyContent();
    renderContentArrays();   
    renderSupporters();
    
    renderPatronMarquee(); 
    
    renderCourses();
    initMap();               
    initThree();
    initGSAP();
    initMarquee();           
    initUI();
    renderFund();
  });

})(); 
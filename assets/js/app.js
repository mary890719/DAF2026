(() => {
  const D = DAF_DATA;
  const C = DAF_COMPONENTS;
  const root = document.querySelector("#app");
  const page = document.body.dataset.page;
  const workCatalog = [...D.works, ...D.soundArtists];
  const queryId = () => Math.max(1, Number(new URLSearchParams(location.search).get("id")) || 1);
  const observationState = {x: window.innerWidth / 2, y: window.innerHeight / 2, active: false, mode: "idle"};
  const siteResizeHandlers = new Set();
  window.addEventListener("resize", () => siteResizeHandlers.forEach(handler => handler()), {passive: true});

  const workCards = works => works.map(work => `
    <a class="work-card" href="work-detail.html?id=${work.id}">
      <div class="work-card-media">
        ${C.placeholder(work.images?.[0]?.alt || "作品圖片")}
        <div class="work-card-overlay"><span>${[work.creators?.map(creator => creator.name).join("／"), work.medium].filter(Boolean).join("<br>")}</span></div>
      </div>
      <div class="work-label"><span class="work-no">${work.number}</span>${work.title}</div>
    </a>`).join("");

  const artistViewData = artist => {
    const linkedWork = workCatalog.find(work => work.id === artist.workId);
    return {
      ...artist,
      imageMarkup: artist.image?.src
        ? `<img src="${artist.image.src}" alt="${artist.name} 圖片">`
        : C.placeholder("藝術家圖片待提供"),
      detailUrl: linkedWork ? `work-detail.html?id=${linkedWork.id}` : ""
    };
  };

  const artistAction = artist => artist.detailUrl
    ? `<a href="${artist.detailUrl}">&gt; 前往詳細頁面</a>`
    : `<span class="artist-action-pending">&gt; 資料待提供</span>`;

  const artistAccordionItems = artists => artists.map(artistViewData).map(artist => `
    <article class="artist-accordion-item" data-artist-id="${artist.id}">
      <div class="artist-accordion-media">
        ${artist.imageMarkup}
      </div>
      <div class="artist-accordion-info">
        <h3>${artist.name}</h3>
        <p>${artist.workTitle}</p>
        ${artistAction(artist)}
      </div>
    </article>`).join("");

  const artistGridItems = artists => artists.map(artistViewData).map(artist => `
    <article class="artist-grid-card" data-artist-id="${artist.id}">
      <div class="artist-grid-media">
        ${artist.imageMarkup}
        <div class="artist-grid-overlay">
          <div class="artist-grid-info">
            <h3>${artist.name}</h3>
            <p>${artist.workTitle}</p>
            ${artistAction(artist)}
          </div>
        </div>
      </div>
    </article>`).join("");

  const workFacts = work => [
    ["創作年份", work.year], ["使用媒材", work.medium], ["作品尺寸", work.dimensions],
    ["展出地點", work.location], ["作品介紹", work.description]
  ].filter(([, value]) => value).map(([label, value]) => `
    <dt class="${label === "展出地點" ? "location-label" : ""}">${label === "展出地點" ? C.icon("location", "") : ""}${label}</dt>
    <dd>${value}</dd>`).join("");

  const renderWorkDetail = () => {
    const foundIndex = workCatalog.findIndex(item => item.id === queryId());
    const currentIndex = Math.max(0, foundIndex);
    const work = workCatalog[currentIndex];
    const previous = workCatalog[(currentIndex - 1 + workCatalog.length) % workCatalog.length];
    const next = workCatalog[(currentIndex + 1) % workCatalog.length];
    root.innerHTML = `
      <main class="container">
        ${C.crumb([{label: "展覽資訊", href: "works.html"}, {label: `${work.number} ${work.title}`}])}
        <article class="detail-shell">
          <section class="detail-left">
            <h1 class="detail-title">${work.number}　${work.title}</h1>
            <dl>${workFacts(work)}</dl>
            <div class="gallery">${(work.images || []).map(image => C.placeholder(image.alt)).join("")}</div>
          </section>
          <section>
            ${C.placeholder(work.images?.[0]?.alt || "主要圖片", "detail-main")}
            <div class="artist-copy">${(work.creators || []).filter(creator => creator.name || creator.bio).map(creator => `${creator.name ? `<h2>${creator.name}</h2>` : ""}${creator.bio ? `<p>${creator.bio}</p>` : ""}`).join("")}</div>
          </section>
          <div class="share"><span>分享至</span><a href="#" aria-label="分享到 Instagram">${C.icon("instagram", "")}</a><a href="#" aria-label="分享到 Facebook">${C.icon("facebook", "")}</a><button class="copy-link" type="button" aria-label="複製作品連結">${C.icon("link", "")}</button></div>
          <nav class="pager"><a href="work-detail.html?id=${previous.id}">←　上一件作品<br>${previous.title}</a><a href="work-detail.html?id=${next.id}">下一件作品　→<br>${next.title}</a></nav>
        </article>
      </main>`;
  };

  const renderEventDetail = () => {
    const event = D.events.find(item => item.id === queryId()) || D.events[0];
    const leader = event.speaker || event.instructor;
    root.innerHTML = `
      <main class="container">
        ${C.crumb([{label: "活動時程", href: "timeline.html"}, {label: event.title}])}
        <article class="event-detail">
          <p class="event-detail-type">${event.type}</p>
          <h1>${event.title}</h1>
          <dl>${[["日期", event.date], ["時間", event.time], ["地點", event.location], [event.type === "講座" ? "講者" : "帶領者", leader]].filter(([, value]) => value).map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}</dl>
          <section><h2>活動介紹</h2><p>${event.description}</p></section>
          <section><h2>活動紀錄</h2><div class="event-gallery">${event.images.map(image => C.placeholder(image.alt)).join("")}</div></section>
        </article>
      </main>`;
  };

  const networkProfile = {
    nodeBaseAlpha: .20,
    nodeObservationAlpha: .28,
    connectionBaseAlpha: .06,
    connectionProximityAlpha: .055,
    connectionObservationAlpha: .205,
    observationConnectionDistance: 60,
    lightCenterAlpha: .033,
    lightEdgeAlpha: .01
  };

  const initializeSiteObservation = () => {
    const hero = document.querySelector("#hero-observation");
    const targets = hero ? [...hero.querySelectorAll("[data-observation-id]")] : [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let frameId = 0;

    const observeAt = (viewportX, viewportY, active) => {
      observationState.x = viewportX;
      observationState.y = viewportY;
      observationState.active = active;
      observationState.mode = document.body.dataset.observationMode || "idle";
      document.documentElement.style.setProperty("--observation-viewport-x", `${viewportX}px`);
      document.documentElement.style.setProperty("--observation-viewport-y", `${viewportY}px`);
      document.documentElement.style.setProperty("--observation-active", active ? "1" : "0");

      let nearest = null;
      let nearestDistance = Infinity;
      targets.forEach(target => {
        const rect = target.getBoundingClientRect();
        const distance = Math.hypot(viewportX - (rect.left + rect.width / 2), viewportY - (rect.top + rect.height / 2));
        if (distance < nearestDistance) {
          nearest = target;
          nearestDistance = distance;
        }
      });
      targets.forEach(target => target.toggleAttribute("data-observed", active && target === nearest));
      if (hero) hero.dataset.observationTarget = active && nearest ? nearest.dataset.observationId : "";
    };

    const scheduleObservation = (x, y, active) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        observeAt(x, y, active);
        frameId = 0;
      });
    };

    const observeViewportCenter = () => {
      if (desktopPointer.matches || reducedMotion.matches) return;
      document.body.dataset.observationMode = "viewport-center";
      scheduleObservation(window.innerWidth / 2, window.innerHeight / 2, true);
    };

    if (reducedMotion.matches) {
      document.body.dataset.observationMode = "reduced-motion";
      observationState.mode = "reduced-motion";
      document.documentElement.style.setProperty("--observation-active", "0");
      return;
    }

    window.addEventListener("pointermove", event => {
      if (!desktopPointer.matches) return;
      document.body.dataset.observationMode = "pointer";
      scheduleObservation(event.clientX, event.clientY, true);
    }, {passive: true});
    document.documentElement.addEventListener("pointerleave", () => {
      if (desktopPointer.matches) scheduleObservation(window.innerWidth / 2, window.innerHeight / 2, false);
    });
    window.addEventListener("scroll", observeViewportCenter, {passive: true});
    siteResizeHandlers.add(observeViewportCenter);
    observeViewportCenter();
  };

  const initializeSiteNetwork = () => {
    const canvas = document.querySelector("#site-network-canvas");
    const context = canvas.getContext("2d", {alpha: true});
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let nodes = [];
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastTime = performance.now();

    const nodeCountForViewport = () => {
      const area = width * height;
      let baseCount;
      if (width <= 600) baseCount = Math.max(14, Math.min(28, Math.round(area / 36000)));
      else if (width <= 900) baseCount = Math.max(20, Math.min(44, Math.round(area / 30000)));
      else baseCount = Math.max(28, Math.min(70, Math.round(area / 24000)));
      return baseCount;
    };

    const createNodes = () => {
      nodes = Array.from({length: nodeCountForViewport()}, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .08,
        vy: (Math.random() - .5) * .08,
        radius: .65 + Math.random() * .85,
        observed: 0
      }));
    };

    const resizeCanvas = () => {
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createNodes();
      drawNetwork(0, true);
    };

    const updateNode = (node, step) => {
      if (!reducedMotion.matches) {
        node.x += node.vx * step;
        node.y += node.vy * step;
        if (node.x < -10) node.x = width + 10;
        else if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        else if (node.y > height + 10) node.y = -10;
      }
      const distance = Math.hypot(node.x - observationState.x, node.y - observationState.y);
      const observationRadius = width <= 900 ? 170 : 250;
      const target = !reducedMotion.matches && observationState.active
        ? Math.max(0, 1 - distance / observationRadius)
        : 0;
      node.observed += (target - node.observed) * Math.min(1, .055 * step);
    };

    const drawNetwork = (step = 1, staticFrame = false) => {
      context.clearRect(0, 0, width, height);
      nodes.forEach(node => updateNode(node, staticFrame ? 0 : step));

      const baseDistance = width <= 600 ? 118 : 145;
      const observedDistance = baseDistance + networkProfile.observationConnectionDistance;
      const cellSize = observedDistance;
      const buckets = new Map();
      nodes.forEach((node, index) => {
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        const key = `${cellX},${cellY}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(index);
      });

      context.lineWidth = .55;
      nodes.forEach((node, index) => {
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            const nearby = buckets.get(`${cellX + offsetX},${cellY + offsetY}`) || [];
            nearby.forEach(otherIndex => {
              if (otherIndex <= index) return;
              const other = nodes[otherIndex];
              const distance = Math.hypot(node.x - other.x, node.y - other.y);
              const localObservation = Math.max(node.observed, other.observed);
              const connectionDistance = baseDistance + networkProfile.observationConnectionDistance * localObservation;
              if (distance > connectionDistance) return;
              const proximity = 1 - distance / connectionDistance;
              const alpha = networkProfile.connectionBaseAlpha
                + proximity * networkProfile.connectionProximityAlpha
                + localObservation * networkProfile.connectionObservationAlpha;
              context.strokeStyle = `rgba(205, 205, 205, ${alpha})`;
              context.beginPath();
              context.moveTo(node.x, node.y);
              context.lineTo(other.x, other.y);
              context.stroke();
            });
          }
        }
      });

      nodes.forEach(node => {
        context.fillStyle = `rgba(235, 235, 235, ${networkProfile.nodeBaseAlpha + node.observed * networkProfile.nodeObservationAlpha})`;
        context.beginPath();
        context.arc(node.x, node.y, node.radius + node.observed * .45, 0, Math.PI * 2);
        context.fill();
      });
    };

    const animate = now => {
      if (document.hidden || reducedMotion.matches) {
        animationFrame = 0;
        return;
      }
      const step = Math.min(2, (now - lastTime) / (1000 / 60));
      lastTime = now;
      drawNetwork(step);
      animationFrame = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (animationFrame || document.hidden || reducedMotion.matches) return;
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const scheduleCanvasResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeCanvas();
        resizeFrame = 0;
      });
    };
    siteResizeHandlers.add(scheduleCanvasResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else if (reducedMotion.matches) drawNetwork(0, true);
      else startAnimation();
    });
    reducedMotion.addEventListener("change", () => {
      stopAnimation();
      drawNetwork(0, true);
      startAnimation();
    });
    window.addEventListener("scroll", () => {
      if (reducedMotion.matches) drawNetwork(0, true);
    }, {passive: true});

    resizeCanvas();
    startAnimation();
  };

  const initializeArtistAccordion = () => {
    const accordion = document.querySelector("#home-artist-accordion");
    const items = [...accordion.querySelectorAll(".artist-accordion-item")];
    const hoverInput = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let activeIndex = Math.floor((items.length - 1) / 2);
    let observationFrame = 0;

    const setActive = index => {
      if (index < 0 || index >= items.length || index === activeIndex && items[index].classList.contains("is-active")) return;
      activeIndex = index;
      items.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === activeIndex));
    };

    const activateNearestToObservation = () => {
      if (hoverInput.matches || !items.length) return;
      const accordionRect = accordion.getBoundingClientRect();
      if (accordionRect.bottom <= 0 || accordionRect.top >= window.innerHeight) return;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const distance = Math.hypot(
          observationState.x - (rect.left + rect.width / 2),
          observationState.y - (rect.top + rect.height / 2)
        );
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      });
      setActive(nearestIndex);
    };

    const scheduleObservationCheck = () => {
      if (observationFrame) cancelAnimationFrame(observationFrame);
      observationFrame = requestAnimationFrame(() => {
        activateNearestToObservation();
        observationFrame = 0;
      });
    };

    accordion.addEventListener("pointerover", event => {
      if (!hoverInput.matches) return;
      const item = event.target.closest(".artist-accordion-item");
      if (item && accordion.contains(item)) setActive(items.indexOf(item));
    });
    accordion.addEventListener("focusin", event => {
      const item = event.target.closest(".artist-accordion-item");
      if (item && accordion.contains(item)) setActive(items.indexOf(item));
    });
    window.addEventListener("scroll", scheduleObservationCheck, {passive: true});
    siteResizeHandlers.add(scheduleObservationCheck);
    hoverInput.addEventListener("change", scheduleObservationCheck);

    setActive(activeIndex);
    scheduleObservationCheck();
  };

  const initializeArtistGrid = () => {
    const grid = document.querySelector("#home-artist-grid");
    const cards = [...grid.querySelectorAll(".artist-grid-card")];
    const hoverInput = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let activeIndex = -1;
    let observationFrame = 0;

    const setActive = index => {
      if (index === activeIndex) return;
      activeIndex = index;
      cards.forEach((card, cardIndex) => card.classList.toggle("is-observed", cardIndex === activeIndex));
    };

    const activateNearestToObservation = () => {
      if (hoverInput.matches || !cards.length) {
        setActive(-1);
        return;
      }
      const gridRect = grid.getBoundingClientRect();
      if (gridRect.bottom <= 0 || gridRect.top >= window.innerHeight) {
        setActive(-1);
        return;
      }
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.hypot(
          observationState.x - (rect.left + rect.width / 2),
          observationState.y - (rect.top + rect.height / 2)
        );
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      });
      setActive(nearestIndex);
    };

    const scheduleObservationCheck = () => {
      if (observationFrame) cancelAnimationFrame(observationFrame);
      observationFrame = requestAnimationFrame(() => {
        activateNearestToObservation();
        observationFrame = 0;
      });
    };

    window.addEventListener("scroll", scheduleObservationCheck, {passive: true});
    siteResizeHandlers.add(scheduleObservationCheck);
    hoverInput.addEventListener("change", scheduleObservationCheck);
    scheduleObservationCheck();
  };

  const runHeroSequence = async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.querySelector("#hero-observation");
    const titleElements = [...hero.querySelectorAll(".hero-scramble")];
    const messageGroup = hero.querySelector(".hero-system-messages");
    const messageLines = [...messageGroup.querySelectorAll("p")];
    const navigation = hero.querySelector(".hero-system-links");
    const scrollLink = hero.querySelector(".hero-scroll");
    const finalMessages = messageLines.map(line => line.textContent);
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&▓";
    const wait = duration => new Promise(resolve => window.setTimeout(resolve, duration));
    const transitions = messageLines.slice(0, -1).map(() => {
      const pause = Math.random() < .42;
      return {
        type: pause ? "pause" : "normal",
        delay: pause
          ? Math.round(1000 + Math.random() * 800)
          : Math.round(250 + Math.random() * 200)
      };
    });

    messageGroup.style.width = `${Math.ceil(messageGroup.getBoundingClientRect().width)}px`;
    messageLines.forEach(line => { line.textContent = ""; });
    transitions.forEach((transition, index) => {
      const nextLine = messageLines[index + 1];
      nextLine.dataset.transition = transition.type;
      nextLine.dataset.transitionDelay = String(transition.delay);
      if (transition.type === "pause") messageGroup.style.setProperty(`--system-gap-${index + 1}`, "var(--space-2)");
    });
    hero.classList.add("hero-sequence-running");

    const scramble = (element, delay = 0) => new Promise(resolve => {
      const finalText = element.textContent;
      const characters = [...finalText];
      const duration = 720;
      const frame = 40;
      const randomize = resolved => characters.map((character, index) => character === " " || index < resolved ? character : glyphs[Math.floor(Math.random() * glyphs.length)]).join("");
      element.setAttribute("aria-label", finalText);
      element.textContent = randomize(0);
      window.setTimeout(() => {
        const startedAt = performance.now();
        const tick = now => {
          const progress = Math.min((now - startedAt) / duration, 1);
          element.textContent = randomize(Math.floor(progress * characters.length));
          if (progress < 1) window.setTimeout(() => requestAnimationFrame(tick), frame);
          else {
            element.textContent = finalText;
            element.removeAttribute("aria-label");
            resolve();
          }
        };
        requestAnimationFrame(tick);
      }, delay);
    });

    const typeLine = async (element, text) => {
      for (const character of [...text]) {
        element.textContent += character;
        await wait(/[\x00-\x7F]/.test(character) ? 36 : 58);
      }
    };

    await Promise.all(titleElements.map((element, index) => scramble(element, index * 140)));
    await wait(240);
    for (let index = 0; index < messageLines.length; index += 1) {
      await typeLine(messageLines[index], finalMessages[index]);
      if (index < messageLines.length - 1) await wait(transitions[index].delay);
    }
    await wait(230);
    navigation.classList.add("is-visible");
    await wait(540);
    scrollLink.classList.add("is-visible");
  };

  const hydrateHome = () => {
    document.querySelector("#home-artist-accordion").innerHTML = artistAccordionItems(D.artists);
    document.querySelector("#home-artist-grid").innerHTML = artistGridItems(D.artists);
    const instagram = D.social.instagram;
    const facebook = D.social.facebook;
    document.querySelector("#instagram-label").textContent = instagram.label;
    document.querySelector("#instagram-handle").textContent = instagram.handle;
    document.querySelector("#instagram-link").href = instagram.url;
    document.querySelector("#facebook-label").textContent = facebook.label;
    document.querySelector("#facebook-name").textContent = facebook.name;
    document.querySelector("#facebook-link").href = facebook.url;
    document.querySelector("#facebook-embed").src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebook.url)}&tabs=timeline&width=328&height=430&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

    initializeArtistAccordion();
    initializeArtistGrid();
    runHeroSequence();
  };

  const initializeBackToTop = () => {
    document.body.insertAdjacentHTML("beforeend", C.backToTop());
    const control = document.querySelector(".back-to-top");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const threshold = 600;
    let scrollFrame = 0;

    const updateVisibility = () => {
      control.classList.toggle("is-visible", window.scrollY >= threshold);
      scrollFrame = 0;
    };
    const scheduleVisibilityUpdate = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateVisibility);
    };

    control.addEventListener("click", () => {
      window.scrollTo({top: 0, behavior: reducedMotion.matches ? "auto" : "smooth"});
    });
    window.addEventListener("scroll", scheduleVisibilityUpdate, {passive: true});
    updateVisibility();
  };

  const renderMap = () => {
    document.querySelector("#map-markers").innerHTML = D.mapMarkers.map(marker => {
      const work = D.works.find(item => item.id === marker.workId);
      return `<button class="marker" style="left:${marker.x}%;top:${marker.y}%" data-id="${work.id}" aria-label="查看 ${work.title}">${C.icon("location", "")}<span>${work.number}</span></button>`;
    }).join("");
    document.querySelector("#map-work-list").insertAdjacentHTML("beforeend", D.mapMarkers.map(marker => {
      const work = D.works.find(item => item.id === marker.workId);
      return `<div>${work.number}. ${work.title}</div>`;
    }).join(""));
  };

  const initializeMapInteraction = () => {
    const map = document.querySelector("#map");
    const card = document.querySelector("#marker-card");
    const uiLayer = document.querySelector(".map-ui-layer");
    let activeMarker = null;
    const isCompactMap = () => window.matchMedia("(max-width: 900px)").matches;
    const syncMapCardMode = () => {
      document.body.classList.toggle("map-modal-open", !card.hidden && isCompactMap());
      if (!card.hidden && !isCompactMap()) positionMarkerCard();
    };
    const closeMarkerCard = () => {
      card.hidden = true;
      uiLayer.classList.remove("is-open");
      document.body.classList.remove("map-modal-open");
      if (activeMarker) activeMarker.setAttribute("aria-expanded", "false");
      activeMarker = null;
    };
    const positionMarkerCard = () => {
      if (!activeMarker || card.hidden || isCompactMap()) return;
      card.classList.remove("arrow-left", "arrow-right");
      const mapRect = map.getBoundingClientRect();
      const markerRect = activeMarker.getBoundingClientRect();
      const markerX = markerRect.left + markerRect.width / 2 - mapRect.left;
      const markerBottom = markerRect.bottom - mapRect.top;
      const isLeft = markerX < mapRect.width / 2;
      card.classList.add(isLeft ? "arrow-left" : "arrow-right");
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      const edge = 12;
      const arrowInset = 30;
      const preferredLeft = isLeft ? markerX - arrowInset : markerX - cardWidth + arrowInset;
      const maxLeft = Math.max(edge, mapRect.width - cardWidth - edge);
      const left = Math.min(Math.max(preferredLeft, edge), maxLeft);
      const preferredTop = markerBottom + 14;
      const maxTop = Math.max(edge, mapRect.height - cardHeight - edge);
      const top = Math.min(Math.max(preferredTop, edge), maxTop);
      const arrowX = Math.min(Math.max(markerX - left, 18), cardWidth - 18);
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      card.style.setProperty("--marker-arrow-x", `${arrowX}px`);
    };
    document.querySelectorAll(".marker").forEach(marker => marker.addEventListener("click", () => {
      const work = D.works.find(item => item.id === Number(marker.dataset.id));
      activeMarker = marker;
      document.querySelectorAll(".marker[aria-expanded='true']").forEach(item => item.setAttribute("aria-expanded", "false"));
      marker.setAttribute("aria-expanded", "true");
      card.innerHTML = `<button class="marker-card-close" type="button" aria-label="關閉作品資訊卡">×</button>${C.placeholder()}<strong><span class="work-no">${work.number}</span>${work.title}</strong><p>${work.creators.map(creator => creator.name).join("／")}<br>${work.medium}</p><p class="marker-card-description">${work.description}</p>${C.button("作品詳細資訊 >", `work-detail.html?id=${work.id}`)}`;
      card.hidden = false;
      uiLayer.classList.add("is-open");
      card.querySelector(".marker-card-close").addEventListener("click", closeMarkerCard);
      requestAnimationFrame(syncMapCardMode);
    }));
    uiLayer.addEventListener("click", event => { if (event.target === uiLayer) closeMarkerCard(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !card.hidden) closeMarkerCard(); });
    window.addEventListener("resize", syncMapCardMode);
  };

  document.body.insertAdjacentHTML("afterbegin", C.siteBackground());
  document.body.dataset.networkProfile = "site";
  document.documentElement.style.setProperty("--observation-light-center", String(networkProfile.lightCenterAlpha));
  document.documentElement.style.setProperty("--observation-light-edge", String(networkProfile.lightEdgeAlpha));
  document.querySelector("#site-header").innerHTML = C.header(page);
  document.querySelector("#site-footer").innerHTML = C.footer();
  initializeBackToTop();

  const breadcrumbLabels = {about: "年度主題", map: "探索地圖", works: "展覽資訊", timeline: "活動時程", transport: "交通資訊"};
  if (breadcrumbLabels[page]) document.querySelector("#breadcrumb").innerHTML = C.crumb(breadcrumbLabels[page]);

  if (page === "home") hydrateHome();
  if (page === "works") {
    document.querySelector("#works-grid").innerHTML = workCards(D.works);
    document.querySelector("#sound-grid").innerHTML = workCards(D.soundArtists);
  }
  if (page === "timeline") document.querySelector("#events-list").innerHTML = D.events.map(event => `<a class="event-row" href="event-detail.html?id=${event.id}"><span class="event-type">${event.type}</span><strong>${event.title}</strong><span>${event.date}・${event.time}</span></a>`).join("");
  if (page === "map") {
    renderMap();
    initializeMapInteraction();
  }
  if (page === "work-detail") renderWorkDetail();
  if (page === "event-detail") renderEventDetail();
  initializeSiteObservation();
  initializeSiteNetwork();

  document.querySelector(".menu-toggle").addEventListener("click", event => {
    const navigation = document.querySelector(".header-nav");
    const open = navigation.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll(".copy-link").forEach(button => button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      button.setAttribute("aria-label", "連結已複製");
    } catch (_) {
      // Clipboard may require a secure context; the visual control remains available.
    }
  }));
})();

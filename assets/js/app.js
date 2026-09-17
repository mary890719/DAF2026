(() => {
  const D = DAF_DATA;
  const C = DAF_COMPONENTS;
  const page = document.body.dataset.page;
  const isEnglish = C.getCurrentLanguage() === "en";
  const textFor = (item, field) => C.localizedText(item, field);
  const workCatalog = [...D.works];
  const artistsForWork = work => (work.artistIds || []).map(id => D.artists.find(artist => artist.id === id)).filter(Boolean);
  const artistNamesForWork = work => artistsForWork(work).map(artist => textFor(artist, "name")).filter(Boolean).join("／");
  const venueById = id => D.venues.find(venue => venue.id === id);
  const venueForWork = work => venueById(work?.venueId)
    || D.venues.find(venue => venue.workIds?.some(workId => String(workId) === String(work?.id)));
  const venueName = venue => isEnglish ? venue?.nameEn || venue?.nameZh : venue?.nameZh || venue?.nameEn;
  const workLocationName = work => venueName(venueForWork(work)) || work?.location || "-";
  const queryId = () => new URLSearchParams(location.search).get("id");
  const observationState = {x: window.innerWidth / 2, y: window.innerHeight / 2, active: false, mode: "idle"};
  const siteResizeHandlers = new Set();
  const narrowNavigationMedia = window.matchMedia("(max-width: 900px)");
  const touchNavigationMedia = window.matchMedia("(any-pointer: coarse), (any-hover: none)");
  const usesTouchNavigation = () => narrowNavigationMedia.matches || navigator.maxTouchPoints > 0 || touchNavigationMedia.matches;
  const syncTouchNavigationClass = () => document.documentElement.classList.toggle("touch-navigation", usesTouchNavigation());
  syncTouchNavigationClass();
  window.addEventListener("resize", () => siteResizeHandlers.forEach(handler => handler()), {passive: true});

  const normalizeImage = (image, fallbackLabel, allowEmpty = false) => {
    if (typeof image === "string") return image || allowEmpty ? {src: image, alt: fallbackLabel} : null;
    if (!image || typeof image !== "object") return null;
    const src = image.src || image.url || "";
    if (!src && !allowEmpty) return null;
    return {src, alt: image.alt || fallbackLabel};
  };

  const coverImageFor = (item, fallbackLabel) => normalizeImage(item?.coverImage, fallbackLabel)
    || normalizeImage(item?.image, fallbackLabel)
    || normalizeImage(item?.images?.[0], fallbackLabel);

  const galleryImagesFor = (item, fallbackLabel, preservePlaceholders = false) => {
    const images = Array.isArray(item?.images)
      ? item.images.map(image => normalizeImage(image, fallbackLabel, preservePlaceholders)).filter(Boolean)
      : [];
    if (images.length) return images;
    const fallback = normalizeImage(item?.coverImage, fallbackLabel) || normalizeImage(item?.image, fallbackLabel);
    return fallback ? [fallback] : [];
  };

  const imageMarkup = (image, fallbackLabel, cls = "") => image?.src
    ? `<img class="${cls}" src="${C.assetRoute(image.src)}" alt="${image.alt || fallbackLabel}">`
    : C.placeholder(image?.alt || fallbackLabel, cls);

  const storeRecordForStatus = (id, source) => (source === "shop" ? D.shops : D.venues).find(item => item.id === id);
  const storeStatusMarkup = (store, {compact = false, source = "venue", className = ""} = {}) => {
    if (!store || (source === "venue" && store.type !== "district")) return "";
    const result = C.getStoreOpenStatus(store);
    return `<span class="store-open-status is-${result.status}${className ? ` ${className}` : ""}" data-store-open-status data-store-id="${store.id}" data-store-source="${source}" data-store-status-format="${compact ? "compact" : "full"}">${C.storeOpenStatusText(result, {compact})}</span>`;
  };
  const updateStoreStatusElements = (scope = document) => {
    scope.querySelectorAll("[data-store-open-status]").forEach(element => {
      const store = storeRecordForStatus(element.dataset.storeId, element.dataset.storeSource);
      if (!store) return;
      const result = C.getStoreOpenStatus(store);
      const compact = element.dataset.storeStatusFormat === "compact";
      element.classList.remove("is-open", "is-before_open", "is-closed", "is-day_off", "is-unknown");
      element.classList.add(`is-${result.status}`);
      element.textContent = C.storeOpenStatusText(result, {compact});
    });
  };
  const initializeStoreStatusUpdates = () => {
    updateStoreStatusElements();
    const timer = window.setInterval(updateStoreStatusElements, 60000);
    window.addEventListener("pagehide", () => window.clearInterval(timer), {once: true});
  };

  const closeDismissiblePanel = ({panel, layer, bodyClass, hideLayer = false, afterClose}) => {
    if (panel) panel.hidden = true;
    if (layer) {
      if (hideLayer) layer.hidden = true;
      layer.classList.remove("is-open");
    }
    if (bodyClass) document.body.classList.remove(bodyClass);
    afterClose?.();
  };

  let modalScrollPosition = 0;
  const lockModalPageScroll = bodyClass => {
    modalScrollPosition = window.scrollY;
    document.body.classList.add(bodyClass);
    document.body.style.position = "fixed";
    document.body.style.inset = `${-modalScrollPosition}px 0 auto`;
    document.body.style.width = "100%";
  };
  const unlockModalPageScroll = bodyClass => {
    const savedScrollY = modalScrollPosition;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    document.body.classList.remove(bodyClass);
    document.body.style.position = "";
    document.body.style.inset = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  };

  const workCards = works => works.map(work => `
    <a class="work-card" href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}">
      <div class="work-card-media">
        ${imageMarkup(coverImageFor(work, `${textFor(work, "title")} ${isEnglish ? "work image" : "作品圖片"}`), `${textFor(work, "title")} ${isEnglish ? "work image" : "作品圖片"}`)}
        <span class="work-card-number">${work.number}</span>
        <div class="work-card-overlay"><span>${[artistNamesForWork(work), work.medium].filter(Boolean).join("<br>")}</span></div>
      </div>
      <div class="work-label">${artistNamesForWork(work) ? `<span class="work-card-artist">${artistNamesForWork(work)}</span>` : ""}<strong class="work-card-title">${textFor(work, "title")}</strong></div>
    </a>`).join("");

  const creatorLinks = creator => [["website", "home", isEnglish ? "Website" : "官方網站"], ["instagram", "instagram", "Instagram"], ["facebook", "facebook", "Facebook"]]
    .map(([field, icon, label]) => creator[field] ? `<a href="${creator[field]}" target="_blank" rel="noopener noreferrer" aria-label="${textFor(creator, "name")} ${label}">${C.icon(icon, "")}</a>` : "")
    .join("");

  const taipeiProgramDate = value => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const source = String(value).trim();
    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(source)) {
      const date = new Date(source);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const match = /^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?$/.exec(source);
    if (!match) return null;
    const [, year, month, day, hour = "0", minute = "0"] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 8, Number(minute)));
  };

  const programTimeRange = event => {
    const start = taipeiProgramDate(event.startDateTime || `${event.date} ${event.startTime || "00:00"}`);
    let end = taipeiProgramDate(event.endDateTime || `${event.date} ${event.endTime || event.startTime || "23:59"}`);
    if (!start || !end) return null;
    if (end <= start && event.endTime) end = new Date(end.getTime() + 86400000);
    return {start, end};
  };

  const programKind = event => {
    if (event.id === "opening-performance") return "opening";
    const type = `${event.type || ""} ${event.typeEn || ""}`.toLowerCase();
    if (event.type === "導覽" || /\btours?\b/.test(type)) return "tour";
    if (event.type === "工作坊" || /\bworkshops?\b/.test(type)) return "workshop";
    if (event.type === "講座" || /\b(?:talks?|lectures?)\b/.test(type)) return "talk";
    return "other";
  };

  const getNextProgramByType = (events, kind, now = new Date()) => events
    .filter(event => programKind(event) === kind)
    .map(event => ({event, range: programTimeRange(event)}))
    .filter(({event, range}) => range && range.end > now && textFor(event, "title") && (event.route || event.detailId != null || event.id != null))
    .map(item => ({...item, ongoing: item.range.start <= now, kind}))
    .sort((a, b) => Number(b.ongoing) - Number(a.ongoing) || a.range.start - b.range.start)[0] || null;

  const homeProgramSlotsAt = (events, now = new Date()) => {
    const opening = getNextProgramByType(events, "opening", now);
    const firstSlot = opening || getNextProgramByType(events, "tour", now);
    return [
      firstSlot,
      getNextProgramByType(events, "workshop", now),
      getNextProgramByType(events, "talk", now)
    ].filter(Boolean);
  };

  const featuredProgramCards = entries => entries.map(({event, ongoing, kind}) => {
    const image = coverImageFor(event, `${textFor(event, "title")} ${isEnglish ? "program image" : "活動圖片"}`);
    const route = event.route || `event-detail.html?id=${event.detailId ?? event.id}`;
    return `
    <a class="home-featured-card" href="${C.localizedRoute(route)}">
      ${image ? `<div class="home-featured-card-media">${imageMarkup(image, `${textFor(event, "title")} ${isEnglish ? "program image" : "活動圖片"}`)}</div>` : ""}
      <div class="home-featured-card-body">
        <p class="home-featured-card-meta">${isEnglish ? ({opening:"Performance", tour:"Tour", workshop:"Workshop", talk:"Talk"}[kind] || event.typeEn || event.type) : event.type}${ongoing ? ` · <strong>${isEnglish ? "Now" : "進行中"}</strong>` : ""}</p>
        <h3>${textFor(event, "title")}</h3>
        <p>${[event.date, event.time || [event.startTime, event.endTime].filter(Boolean).join("–")].filter(Boolean).join(" · ")}</p>
        ${textFor(event, "location") ? `<p>${textFor(event, "location")}</p>` : ""}
        <span class="home-featured-card-action">&gt; ${isEnglish ? "VIEW DETAILS" : "查看詳細資訊"}</span>
      </div>
    </a>
  `;}).join("");

  const artistImageMarkup = (artist, {priority = false, thumbnail = false} = {}) => {
    if (!artist.image?.src) return C.placeholder(isEnglish ? "Artist image pending" : "藝術家圖片待提供");
    const source = thumbnail ? `assets/images/artists/thumbs/${artist.id}.webp` : artist.image.src;
    return `<img src="${C.assetRoute(source)}" alt="${textFor(artist, "name")} 圖片" loading="${priority ? "eager" : "lazy"}" decoding="async" fetchpriority="${priority ? "high" : "low"}">`;
  };

  const homeArtworkImageMarkup = (artist, {priority = false} = {}) => {
    const source = D.homeArtworkImages?.[artist.workId];
    if (!source) return C.placeholder(isEnglish ? "Artwork image pending" : "作品圖片待提供");
    const thumbnail = source.replace("/home/", "/home/thumbs/").replace(/\.[^.]+$/, ".webp");
    return `<img src="${C.assetRoute(thumbnail)}" alt="${textFor(artist, "workTitle")} ${isEnglish ? "artwork image" : "作品圖片"}" loading="${priority ? "eager" : "lazy"}" decoding="async" fetchpriority="${priority ? "high" : "low"}">`;
  };

  const artistViewData = artist => {
    const linkedWork = workCatalog.find(work => work.id === artist.workId);
    return {
      ...artist,
      name: textFor(artist, "name"),
      workTitle: textFor(artist, "workTitle"),
      imageMarkup: artistImageMarkup(artist),
      detailUrl: linkedWork ? C.localizedRoute(`work-detail.html?id=${linkedWork.id}`) : ""
    };
  };

  const artistAction = artist => artist.detailUrl
    ? `<a href="${artist.detailUrl}">&gt; ${isEnglish ? "VIEW DETAILS" : "前往詳細頁面"}</a>`
    : `<span class="artist-action-pending">&gt; ${isEnglish ? "INFORMATION PENDING" : "資料待提供"}</span>`;

  const artistAccordionItems = artists => {
    const defaultIndex = Math.floor((artists.length - 1) / 2);
    return artists.map(artistViewData).map((artist, index) => `
    <article class="artist-accordion-item" data-artist-id="${artist.id}" data-accordion-index="${index}">
      <div class="artist-accordion-media">
        ${homeArtworkImageMarkup(artist, {priority: index === defaultIndex})}
      </div>
      <div class="artist-accordion-info">
        <h3>${artist.name}</h3>
        <p>${artist.workTitle}</p>
        ${artistAction(artist)}
      </div>
    </article>`).join("");
  };

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

  const setDetailText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value ?? "";
  };

  const setDetailField = (field, value, prefix) => {
    const row = document.querySelector(`[data-${prefix}-field="${field}"]`);
    const slot = document.querySelector(`[data-${prefix}-${field}]`);
    const available = value !== undefined && value !== null && value !== "";
    if (row) row.hidden = !available;
    if (slot) slot.textContent = available ? value : "";
  };

  const renderWorkDetail = () => {
    const foundIndex = workCatalog.findIndex(item => String(item.id) === queryId());
    const article = document.querySelector("[data-work-detail]");
    const error = document.querySelector("[data-work-error]");
    if (foundIndex < 0) {
      article.remove();
      error.hidden = false;
      document.querySelector("#breadcrumb").innerHTML = C.crumb(isEnglish ? "Work not found" : "找不到此作品");
      document.title = isEnglish ? "Work not found｜2026 Taipei Digital Art Festival" : "找不到此作品｜2026 臺北數位藝術節";
      return;
    }
    const currentIndex = foundIndex;
    const work = workCatalog[currentIndex];
    const previous = currentIndex > 0 ? workCatalog[currentIndex - 1] : null;
    const next = currentIndex < workCatalog.length - 1 ? workCatalog[currentIndex + 1] : null;
    const creatorNames = artistNamesForWork(work);
    document.title = `${textFor(work, "title")}｜${isEnglish ? "2026 Taipei Digital Art Festival" : "2026 臺北數位藝術節"}`;
    const areaCrumbs = work.category === "main"
      ? [
          {label: isEnglish ? "TAIPEI COLLECTIBLE BOTANICAL GARDEN" : "臺北典藏植物園", href: "works.html#garden"},
          {label: isEnglish ? "MAIN VENUE" : "主展場", href: "works.html#main-venue"}
        ]
      : work.category === "outdoor"
        ? [
            {label: isEnglish ? "TAIPEI COLLECTIBLE BOTANICAL GARDEN" : "臺北典藏植物園", href: "works.html#garden"},
            {label: isEnglish ? "OUTDOOR WORKS" : "戶外作品", href: "works.html#outdoor-works"}
          ]
        : [{label: isEnglish ? "TAIPEI YUANSHAN DISTRICT" : "臺北圓山街區", href: "works.html#art-in-stores"}];
    document.querySelector("#breadcrumb").innerHTML = C.crumb([
      {label: isEnglish ? "WORKS" : "作品介紹", href: "works.html"},
      ...areaCrumbs,
      {label: textFor(work, "title")}
    ]);
    setDetailText("[data-work-number]", work.number ? `${isEnglish ? "WORK NO." : "作品編號"} ${work.number}` : "");
    setDetailText("[data-work-title]", textFor(work, "title"));
    setDetailText("[data-work-creator-names]", creatorNames);
    setDetailField("year", work.year, "work");
    setDetailField("workType", textFor(work, "workType"), "work");
    setDetailField("medium", textFor(work, "medium"), "work");
    setDetailField("location", workLocationName(work), "work");
    setDetailText("[data-work-description]", textFor(work, "description"));
    document.querySelector("[data-work-description-section]").hidden = !textFor(work, "description");
    const images = galleryImagesFor(work, "作品圖片", true);
    const galleryElement = document.querySelector("[data-work-gallery]");
    const gallerySection = document.querySelector("[data-work-gallery-section]");
    gallerySection.hidden = images.length === 0;
    const galleryLabels = isEnglish ? {
      gallery: "Work image gallery", image: "Work image", open: "Open image viewer",
      previous: "Previous image", next: "Next image", close: "Close image viewer"
    } : {
      gallery: "作品圖片藝廊", image: "作品圖片", open: "開啟作品圖片放大檢視",
      previous: "上一張圖片", next: "下一張圖片", close: "關閉作品圖片放大檢視"
    };
    const hasLightboxImage = image => Boolean(image?.src);
    galleryElement.innerHTML = images.length ? `
      <div class="work-gallery-carousel" data-work-gallery-carousel aria-label="${galleryLabels.gallery}">
        <div class="work-gallery-stage">
          <button class="work-gallery-open" type="button" data-work-gallery-open aria-label="${galleryLabels.open}"${hasLightboxImage(images[0]) ? "" : " hidden"}>
            <img class="work-gallery-image" data-work-gallery-image src="${hasLightboxImage(images[0]) ? C.assetRoute(images[0].src) : ""}" alt="${images[0].alt || `${galleryLabels.image} 1`}" decoding="async">
          </button>
          <div class="work-gallery-placeholder" data-work-gallery-placeholder${hasLightboxImage(images[0]) ? " hidden" : ""}>${C.placeholder(images[0].alt || galleryLabels.image)}</div>
          ${images.length > 1 ? `<button class="work-gallery-arrow is-previous" type="button" data-work-gallery-direction="-1" aria-label="${galleryLabels.previous}">‹</button><button class="work-gallery-arrow is-next" type="button" data-work-gallery-direction="1" aria-label="${galleryLabels.next}">›</button>` : ""}
          ${images.length > 1 ? `<div class="gallery-dots work-gallery-dots" aria-label="${isEnglish ? "Image pagination" : "圖片分頁"}">${images.map((_, index) => `<button type="button" data-work-gallery-index="${index}" aria-label="${isEnglish ? `View image ${index + 1}` : `查看第 ${index + 1} 張圖片`}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("")}</div>` : ""}
        </div>
      </div>
      <div class="work-lightbox" data-work-lightbox hidden role="dialog" aria-modal="true" aria-label="${galleryLabels.gallery}">
        <button class="work-lightbox-close" type="button" data-work-lightbox-close aria-label="${galleryLabels.close}">×</button>
        <div class="work-lightbox-stage">
          <img data-work-lightbox-image src="" alt="">
        </div>
        ${images.length > 1 ? `<button class="work-lightbox-arrow is-previous" type="button" data-work-lightbox-direction="-1" aria-label="${galleryLabels.previous}">‹</button><button class="work-lightbox-arrow is-next" type="button" data-work-lightbox-direction="1" aria-label="${galleryLabels.next}">›</button>` : ""}
        <span class="work-lightbox-count" data-work-lightbox-count>1 / ${images.length}</span>
      </div>` : "";
    if (images.length) {
      const carousel = galleryElement.querySelector("[data-work-gallery-carousel]");
      const galleryImage = carousel.querySelector("[data-work-gallery-image]");
      const galleryOpen = carousel.querySelector("[data-work-gallery-open]");
      const galleryPlaceholder = carousel.querySelector("[data-work-gallery-placeholder]");
      const lightbox = galleryElement.querySelector("[data-work-lightbox]");
      document.body.append(lightbox);
      const lightboxImage = lightbox.querySelector("[data-work-lightbox-image]");
      const lightboxCount = lightbox.querySelector("[data-work-lightbox-count]");
      const lightboxClose = lightbox.querySelector("[data-work-lightbox-close]");
      let activeIndex = 0;
      let swipeStartX = null;
      let lightboxSwipeStartX = null;

      const updateGallery = index => {
        activeIndex = (index + images.length) % images.length;
        const image = images[activeIndex];
        const available = hasLightboxImage(image);
        galleryOpen.hidden = !available;
        galleryPlaceholder.hidden = available;
        if (available) {
          galleryImage.src = C.assetRoute(image.src);
          galleryImage.alt = image.alt || `${galleryLabels.image} ${activeIndex + 1}`;
        }
        carousel.querySelectorAll("[data-work-gallery-index]").forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === activeIndex)));
        if (!lightbox.hidden) updateLightbox();
      };
      const updateLightbox = () => {
        const image = images[activeIndex];
        if (!hasLightboxImage(image)) return;
        lightboxImage.src = C.assetRoute(image.src);
        lightboxImage.alt = image.alt || `${galleryLabels.image} ${activeIndex + 1}`;
        lightboxCount.textContent = `${activeIndex + 1} / ${images.length}`;
      };
      const openLightbox = () => {
        if (!hasLightboxImage(images[activeIndex])) return;
        updateLightbox();
        lightbox.hidden = false;
        document.body.classList.add("work-lightbox-open");
        lightboxClose.focus();
      };
      const closeLightbox = () => {
        lightbox.hidden = true;
        document.body.classList.remove("work-lightbox-open");
        galleryOpen.focus();
      };
      const completeSwipe = (startX, endX) => {
        const distance = endX - startX;
        if (Math.abs(distance) >= 45) updateGallery(activeIndex + (distance < 0 ? 1 : -1));
      };

      carousel.addEventListener("click", event => {
        const direction = event.target.closest("[data-work-gallery-direction]");
        const dot = event.target.closest("[data-work-gallery-index]");
        if (direction) updateGallery(activeIndex + Number(direction.dataset.workGalleryDirection));
        else if (dot) updateGallery(Number(dot.dataset.workGalleryIndex));
      });
      galleryOpen.addEventListener("click", openLightbox);
      carousel.addEventListener("pointerdown", event => { if (event.pointerType === "touch") swipeStartX = event.clientX; }, {passive: true});
      carousel.addEventListener("pointerup", event => {
        if (swipeStartX === null) return;
        completeSwipe(swipeStartX, event.clientX);
        swipeStartX = null;
      }, {passive: true});
      carousel.addEventListener("pointercancel", () => { swipeStartX = null; }, {passive: true});
      lightbox.addEventListener("click", event => {
        const direction = event.target.closest("[data-work-lightbox-direction]");
        if (direction) updateGallery(activeIndex + Number(direction.dataset.workLightboxDirection));
        else if (event.target === lightbox || event.target.closest("[data-work-lightbox-close]")) closeLightbox();
      });
      lightbox.addEventListener("pointerdown", event => { if (event.pointerType === "touch") lightboxSwipeStartX = event.clientX; }, {passive: true});
      lightbox.addEventListener("pointerup", event => {
        if (lightboxSwipeStartX === null) return;
        completeSwipe(lightboxSwipeStartX, event.clientX);
        lightboxSwipeStartX = null;
      }, {passive: true});
      lightbox.addEventListener("pointercancel", () => { lightboxSwipeStartX = null; }, {passive: true});
      document.addEventListener("keydown", event => {
        if (lightbox.hidden) return;
        if (event.key === "Escape") closeLightbox();
        else if (event.key === "ArrowLeft") updateGallery(activeIndex - 1);
        else if (event.key === "ArrowRight") updateGallery(activeIndex + 1);
      });
    }
    const artists = artistsForWork(work).filter(creator => textFor(creator, "name") || textFor(creator, "bio"));
    const primaryArtist = artists[0];
    const artistImageLabel = primaryArtist
      ? `${textFor(primaryArtist, "name")} ${isEnglish ? "artist portrait" : "藝術家照片"}`
      : (isEnglish ? "Artist image pending" : "藝術家圖片待提供");
    document.querySelector("[data-work-primary-media]").innerHTML = imageMarkup(
      normalizeImage(primaryArtist?.image, artistImageLabel),
      isEnglish ? "Artist image pending" : "藝術家圖片待提供",
      `detail-main${primaryArtist?.id === "artist-26" ? " is-logo" : ""}`
    );
    const workLinks = document.querySelector("[data-work-links]");
    const videoUrls = (work.videoUrls?.length ? work.videoUrls : [work.videoUrl]).filter(Boolean);
    workLinks.innerHTML = videoUrls.map((url, index) => `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? `Open work video ${index + 1}` : `開啟作品影片／影像連結 ${index + 1}`}">${C.icon("video", "")}<span>${isEnglish ? "VIDEO / MOVING IMAGE" : "作品影片／影像連結"}${videoUrls.length > 1 ? ` ${index + 1}` : ""}</span></a>`).join("");
    workLinks.hidden = videoUrls.length === 0;
    document.querySelector("[data-work-artists]").innerHTML = artists.length
      ? artists.map(creator => {
        const nationality = textFor(creator, "nationality");
        const biography = textFor(creator, "bio");
        const career = textFor(creator, "career");
        return `<article>${textFor(creator, "name") ? `<h3>${textFor(creator, "name")}</h3>` : ""}${nationality ? `<p class="artist-nationality">${nationality}</p>` : ""}${biography ? `<p class="artist-biography">${biography}</p>` : ""}${career ? `<section class="artist-career"><h4>${isEnglish ? "EXPERIENCE" : "經歷"}</h4><p>${career}</p></section>` : ""}${creatorLinks(creator) ? `<div class="artist-links">${creatorLinks(creator)}</div>` : ""}</article>`;
      }).join("")
      : `<p class="data-pending">${isEnglish ? "(Information pending)" : "(待補)"}</p>`;
    const previousLink = document.querySelector("[data-work-previous]");
    const nextLink = document.querySelector("[data-work-next]");
    previousLink.hidden = !previous;
    nextLink.hidden = !next;
    if (previous) previousLink.href = C.localizedRoute(`work-detail.html?id=${previous.id}`);
    else previousLink.removeAttribute("href");
    if (next) nextLink.href = C.localizedRoute(`work-detail.html?id=${next.id}`);
    else nextLink.removeAttribute("href");
    setDetailText("[data-work-previous-title]", previous ? textFor(previous, "title") : "");
    setDetailText("[data-work-next-title]", next ? textFor(next, "title") : "");
  };

  const openingText = (item, field) => isEnglish
    ? item?.[`${field}En`] || item?.[field] || ""
    : item?.[`${field}Zh`] || item?.[field] || "";

  const openingLinks = item => {
    if (!item) return "";
    return creatorLinks(item);
  };

  const renderOpeningPerformers = container => {
    if (!container) return;
    const paragraphMarkup = value => value
      ? value.split("\n").map(paragraph => paragraph ? `<p>${paragraph}</p>` : "").join("")
      : "";
    const performerRecord = work => {
      const artist = artistsForWork(work)[0];
      const name = openingText(artist, "name");
      const alternateName = isEnglish ? artist?.nameZh : artist?.nameEn;
      const nationality = openingText(artist, "nationality");
      const bio = openingText(artist, "bio");
      const career = openingText(artist, "career");
      const members = openingText(artist, "members");
      const performanceDescription = openingText(work, "description");
      const performanceType = openingText(work, "workType");
      const links = openingLinks(artist);
      return {work, artist, name, alternateName: alternateName && alternateName !== name ? alternateName : "", nationality, bio, career, members, performanceDescription, performanceType, links};
    };
    const performanceDetailMarkup = (performance, parentId) => {
      const performanceName = openingText(performance, "name");
      const alternatePerformanceName = isEnglish ? performance.nameZh : performance.nameEn;
      const performanceTitle = openingText(performance, "title");
      const alternateTitle = isEnglish ? performance.titleZh : performance.titleEn;
      const performanceNationality = openingText(performance, "nationality");
      const performanceBio = openingText(performance, "bio");
      const performanceCareer = openingText(performance, "career");
      const performanceWorkType = openingText(performance, "workType");
      const performanceCopy = openingText(performance, "description");
      const performanceLinks = openingLinks(performance);
      const performerImage = normalizeImage(performance.performerImage, performanceName);
      const performerImageMarkup = performerImage
        ? `<div class="opening-performance-media is-artist">${imageMarkup(performerImage, performanceName)}</div>`
        : "";
      const workImages = Array.isArray(performance.workImages)
        ? performance.workImages.map(image => normalizeImage(image, performanceTitle || performanceName)).filter(Boolean)
        : [];
      const workGallery = workImages.length ? `<section class="opening-detail-section"><h4>${isEnglish ? "Performance Images" : "本次演出"}</h4><div class="shop-gallery" data-opening-performance-gallery data-gallery-index="0">
        <img data-opening-performance-gallery-image src="${C.assetRoute(workImages[0].src)}" alt="${performanceTitle || performanceName} ${isEnglish ? "performance image" : "演出作品圖片"} 1">
        ${workImages.length > 1 ? `<button class="shop-gallery-arrow is-previous" type="button" data-opening-performance-gallery-direction="-1" aria-label="${isEnglish ? "Previous image" : "上一張圖片"}">‹</button><button class="shop-gallery-arrow is-next" type="button" data-opening-performance-gallery-direction="1" aria-label="${isEnglish ? "Next image" : "下一張圖片"}">›</button><span class="shop-gallery-count" data-opening-performance-gallery-count>1 / ${workImages.length}</span>` : ""}
      </div></section>` : "";
      const backButton = `<button class="opening-detail-back" type="button" data-opening-detail-back="${parentId}">&lt; ${isEnglish ? "Back to Performance Team" : "返回演出團隊"}</button>`;
      return `<div class="opening-detail-content">
        ${backButton}
        <header class="opening-detail-header">
          <p class="opening-subperformance-artist">${performanceName}</p>
          ${alternatePerformanceName && alternatePerformanceName !== performanceName ? `<p class="opening-detail-name-en">${alternatePerformanceName}</p>` : ""}
          ${performanceTitle ? `<h3 id="opening-detail-title">${performanceTitle}</h3>` : `<h3 id="opening-detail-title">${performanceName}</h3>`}
          ${alternateTitle && alternateTitle !== performanceTitle ? `<p class="opening-detail-name-en">${alternateTitle}</p>` : ""}
          ${(performance.year || performanceWorkType || performanceNationality) ? `<p class="opening-performer-meta">${[performance.year, performanceWorkType, performanceNationality].filter(Boolean).join("｜")}</p>` : ""}
        </header>
        ${performerImageMarkup}
        ${performanceCopy ? `<section class="opening-detail-section"><h4>${isEnglish ? "Performance Description" : "演出介紹"}</h4>${paragraphMarkup(performanceCopy)}</section>` : ""}
        ${performanceBio ? `<section class="opening-detail-section"><h4>${isEnglish ? "Biography" : "藝術家簡介"}</h4>${paragraphMarkup(performanceBio)}</section>` : ""}
        ${performanceCareer ? `<section class="opening-detail-section"><h4>${isEnglish ? "Experience" : "藝術家經歷"}</h4>${paragraphMarkup(performanceCareer)}</section>` : ""}
        ${performanceLinks ? `<div class="opening-performer-links">${performanceLinks}</div>` : ""}
        ${workGallery}
        ${backButton}
      </div>`;
    };
    const detailMarkup = record => {
      const {work, artist, name, alternateName, nationality, bio, career, performanceDescription, performanceType, links} = record;
      const performanceList = (work.performances || []).map(performance => `<button class="opening-performance-list-item" type="button" data-opening-performance-id="${performance.id}"><span>${openingText(performance, "name")}</span><strong>《${openingText(performance, "title")}》</strong><i aria-hidden="true">&gt;</i></button>`).join("");
      const collaborators = (work.collaborators || []).map(collaborator => `<li><strong>${openingText(collaborator, "name")}</strong>${openingText(collaborator, "role") ? `<span>${openingText(collaborator, "role")}</span>` : ""}</li>`).join("");
      const artistMedia = artist?.image?.src
        ? `<div class="opening-performance-media ${artist.id === "artist-26" ? "is-logo" : "is-artist"}">${imageMarkup(normalizeImage(artist.image, name), name, artist.id === "artist-26" ? "is-logo" : "")}</div>`
        : "";
      return `<div class="opening-detail-content">
        <header class="opening-detail-header">
          <p class="opening-performer-number">${work.number}</p>
          <h3 id="opening-detail-title">${name}</h3>
          ${alternateName ? `<p class="opening-detail-name-en">${alternateName}</p>` : ""}
          ${nationality ? `<p class="opening-performer-meta">${nationality}</p>` : ""}
        </header>
        ${artistMedia}
        ${bio ? `<section class="opening-detail-section"><h4>${isEnglish ? "Biography" : "簡介"}</h4>${paragraphMarkup(bio)}</section>` : ""}
        ${career ? `<section class="opening-detail-section"><h4>${isEnglish ? "Career" : "經歷"}</h4>${paragraphMarkup(career)}</section>` : ""}
        ${links ? `<div class="opening-performer-links">${links}</div>` : ""}
        ${performanceList ? `<section class="opening-detail-section"><h4>${isEnglish ? "Performances" : "本次演出"}</h4><div class="opening-performance-list">${performanceList}</div></section>` : ""}
        ${!performanceList && (work.year || performanceType || performanceDescription) ? `<section class="opening-detail-section"><h4>${isEnglish ? "This Performance" : "本次演出資訊"}</h4>${(work.year || performanceType) ? `<p class="opening-performer-type">${[work.year, performanceType].filter(Boolean).join("｜")}</p>` : ""}${performanceDescription ? `<p class="opening-performer-description">${performanceDescription}</p>` : ""}</section>` : ""}
        ${collaborators ? `<section class="opening-detail-section"><h4>${isEnglish ? "Collaborating Artist" : "合作藝術家"}</h4><ul class="opening-collaborators">${collaborators}</ul></section>` : ""}
      </div>`;
    };
    const records = D.soundArtists.map(performerRecord);
    container.innerHTML = records.map(record => {
      const {work, name, alternateName, bio, career} = record;
      const isTeam = (work.performances || []).length > 0;
      return `<article class="opening-performer-card opening-performer-summary">
        <div class="opening-performer-copy">
          <p class="opening-performer-number">${work.number}</p>
          <h3>${name}</h3>
          ${alternateName ? `<p class="opening-detail-name-en">${alternateName}</p>` : ""}
          ${bio ? `<div class="opening-team-summary"><h4>${isEnglish ? (isTeam ? "Team Introduction" : "Biography") : (isTeam ? "團隊簡介" : "簡介")}</h4>${paragraphMarkup(bio)}</div>` : ""}
          ${career ? `<div class="opening-team-summary opening-team-career"><h4>${isEnglish ? "Experience" : (isTeam ? "團隊經歷" : "經歷")}</h4>${paragraphMarkup(career)}</div>` : ""}
          <button class="button opening-detail-trigger" type="button" data-opening-detail-id="${work.id}" aria-haspopup="dialog">${isEnglish ? "View details" : "查看詳細資訊"}</button>
        </div>
      </article>`;
    }).join("");

    const section = container.closest(".opening-performance-works");
    const layer = section?.querySelector("[data-opening-detail-layer]");
    const panel = layer?.querySelector(".opening-detail-panel");
    if (!layer || !panel) return;
    document.body.append(layer);
    let returnFocus = null;
    const closeDetail = () => {
      closeDismissiblePanel({panel, layer, hideLayer: true});
      unlockModalPageScroll("opening-detail-open");
      returnFocus?.focus({preventScroll: true});
      returnFocus = null;
    };
    const openDetail = (record, trigger) => {
      returnFocus = trigger;
      let activePerformanceId = "";
      const renderPanel = content => {
        panel.innerHTML = `<button class="marker-card-close opening-detail-close" type="button" aria-label="${isEnglish ? "Close performing artist details" : "關閉演出團隊詳細資訊"}">×</button>${content}`;
        panel.querySelector(".opening-detail-close").addEventListener("click", closeDetail);
      };
      renderPanel(detailMarkup(record));
      layer.hidden = false;
      panel.hidden = false;
      layer.scrollTop = 0;
      lockModalPageScroll("opening-detail-open");
      panel.querySelector(".opening-detail-close").focus();
      panel.onclick = event => {
        const performanceTrigger = event.target.closest("[data-opening-performance-id]");
        const backTrigger = event.target.closest("[data-opening-detail-back]");
        const galleryDirection = event.target.closest("[data-opening-performance-gallery-direction]");
        if (galleryDirection) {
          const performance = (record.work.performances || []).find(item => item.id === activePerformanceId);
          const images = Array.isArray(performance?.workImages) ? performance.workImages : [];
          const gallery = galleryDirection.closest("[data-opening-performance-gallery]");
          if (!images.length || !gallery) return;
          const nextIndex = (Number(gallery.dataset.galleryIndex || 0) + Number(galleryDirection.dataset.openingPerformanceGalleryDirection) + images.length) % images.length;
          gallery.dataset.galleryIndex = String(nextIndex);
          const image = gallery.querySelector("[data-opening-performance-gallery-image]");
          image.src = C.assetRoute(images[nextIndex]);
          image.alt = `${openingText(performance, "title") || openingText(performance, "name")} ${isEnglish ? "performance image" : "演出作品圖片"} ${nextIndex + 1}`;
          gallery.querySelector("[data-opening-performance-gallery-count]").textContent = `${nextIndex + 1} / ${images.length}`;
        } else if (performanceTrigger) {
          const performance = (record.work.performances || []).find(item => item.id === performanceTrigger.dataset.openingPerformanceId);
          if (performance) {
            activePerformanceId = performance.id;
            renderPanel(performanceDetailMarkup(performance, record.work.id));
            layer.scrollTop = 0;
            panel.querySelector(".opening-detail-back")?.focus();
          }
        } else if (backTrigger) {
          renderPanel(detailMarkup(record));
          layer.scrollTop = 0;
          panel.querySelector(`[data-opening-performance-id="${activePerformanceId}"]`)?.focus();
        }
      };
    };
    container.addEventListener("click", event => {
      const trigger = event.target.closest("[data-opening-detail-id]");
      if (!trigger) return;
      const record = records.find(item => item.work.id === trigger.dataset.openingDetailId);
      if (record) openDetail(record, trigger);
    });
    layer.addEventListener("click", event => { if (event.target === layer) closeDetail(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !layer.hidden) closeDetail();
    });
  };

  const renderEventDetail = () => {
    const event = D.events.find(item => String(item.id) === queryId());
    const article = document.querySelector("[data-event-detail]");
    const error = document.querySelector("[data-event-error]");
    if (!event) {
      article.remove();
      error.hidden = false;
      document.querySelector("#breadcrumb").innerHTML = C.crumb(isEnglish ? "Program not found" : "找不到此活動");
      document.title = isEnglish ? "Program not found｜2026 Taipei Digital Art Festival" : "找不到此活動｜2026 臺北數位藝術節";
      return;
    }
    const leader = event.speaker || event.instructor;
    const isOpeningPerformance = event.id === "opening-performance";
    article.classList.toggle("is-opening-performance", isOpeningPerformance);
    document.title = `${textFor(event, "title")}｜${isEnglish ? "2026 Taipei Digital Art Festival" : "2026 臺北數位藝術節"}`;
    document.querySelector("#breadcrumb").innerHTML = C.crumb([{label: isEnglish ? "PROGRAM" : "活動節目", href: "program.html"}, {label: textFor(event, "title")}]);
    setDetailText("[data-event-type]", isOpeningPerformance
      ? (isEnglish ? "Performance" : "表演")
      : [event.number, isEnglish ? event.typeEn || event.type : event.type].filter(Boolean).join("｜"));
    setDetailText("[data-event-title]", textFor(event, "title"));
    setDetailField("date", event.date, "event");
    setDetailField("time", event.time, "event");
    setDetailField("location", textFor(event, "location"), "event");
    if (isOpeningPerformance) {
      const timeLabel = document.querySelector('[data-event-field="time"] dt');
      const locationLabel = document.querySelector('[data-event-field="location"] dt');
      if (timeLabel) timeLabel.textContent = isEnglish ? "Performance Time" : "表演時間";
      if (locationLabel) locationLabel.textContent = isEnglish ? "Location" : "表演地點";
      const performersSection = document.querySelector("[data-opening-performers-section]");
      if (performersSection) {
        performersSection.hidden = false;
        renderOpeningPerformers(performersSection.querySelector("[data-opening-performer-list]"));
      }
    }
    const leaderRow = document.querySelector("[data-event-leader-row]");
    if (isOpeningPerformance) leaderRow.remove();
    else {
      leaderRow.hidden = !leader;
      setDetailText("[data-event-leader-label]", isEnglish ? (event.type === "講座" ? "Speaker" : "Instructor") : (event.type === "講座" ? "講者" : "帶領者"));
      setDetailText("[data-event-leader]", leader);
    }
    const registrationRow = document.querySelector("[data-event-registration-row]");
    if (isOpeningPerformance) registrationRow.remove();
    else {
      registrationRow.hidden = !event.registration;
      setDetailText("[data-event-registration]", event.registration);
    }
    const descriptionSection = document.querySelector("[data-event-description-section]");
    if (isOpeningPerformance) descriptionSection.remove();
    else {
      setDetailText("[data-event-description]", textFor(event, "description"));
      descriptionSection.hidden = !textFor(event, "description");
    }
    const recordImages = galleryImagesFor(event, "活動紀錄圖片");
    document.querySelector("[data-event-gallery]").innerHTML = recordImages.map(image => imageMarkup(image, "活動紀錄圖片")).join("");
    document.querySelector("[data-event-gallery-section]").hidden = recordImages.length === 0;
  };

  const programRoute = event => event.route || `event-detail.html?id=${event.detailId ?? event.id}`;
  const programTime = event => event.startTime
    ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ""}`
    : event.time || "";
  const programDate = value => {
    const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value || "");
    if (!match) return null;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return {date, key: value, short: `${match[2]}.${match[3]}`, weekdayIndex: date.getUTCDay()};
  };

  const initializeProgramPage = () => {
    const events = D.events;
    const orderField = event => ["displayOrder", "order", "sort", "sequence"]
      .map(field => Number(event[field]))
      .find(Number.isFinite);
    const openingIndex = events.findIndex(event => event.id === "opening-performance");
    const openingEvent = openingIndex >= 0 ? events[openingIndex] : null;
    const orderedEvents = events
      .map((event, index) => ({event, index, order: orderField(event)}))
      .filter(item => item.event !== openingEvent)
      .sort((a, b) => {
        if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
        if (a.order != null && b.order == null) return -1;
        if (a.order == null && b.order != null) return 1;
        const aStart = programTimeRange(a.event)?.start?.getTime() ?? Number.POSITIVE_INFINITY;
        const bStart = programTimeRange(b.event)?.start?.getTime() ?? Number.POSITIVE_INFINITY;
        return aStart - bStart || a.index - b.index;
      })
      .map(item => item.event);
    if (openingEvent) orderedEvents.unshift(openingEvent);
    const list = document.querySelector("#program-card-list");
    const filters = [...document.querySelectorAll("[data-program-filter]")];
    const locale = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh-Hant";
    const labels = {
      "zh-Hant": {
        overview: "節目總覽", schedule: "日程表",
        filterAll: "全部", filterTalks: "講座", filterWorkshops: "工作坊", filterTours: "導覽",
        noEvents: "活動資料待提供", eventCountSuffix: "場活動",
        weekdays: ["日", "一", "二", "三", "四", "五", "六"]
      },
      en: {
        overview: "Program Overview", schedule: "Schedule",
        filterAll: "All", filterTalks: "Talks", filterWorkshops: "Workshops", filterTours: "Tours",
        noEvents: "Program information pending", eventCountSuffix: "events",
        weekdays: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
      }
    }[locale];
    const displayTitle = event => locale === "en" ? event.titleEn || event.title : event.title;
    const displayType = event => locale === "en" ? event.typeEn || event.type : event.type;
    const displayWeekday = date => date ? labels.weekdays[date.weekdayIndex] : "";
    document.querySelectorAll("[data-program-label]").forEach(node => {
      node.textContent = labels[node.dataset.programLabel] || node.textContent;
    });
    document.querySelector("#program-calendar-weekdays").innerHTML = [1, 2, 3, 4, 5, 6, 0]
      .map(index => `<span>${labels.weekdays[index]}</span>`).join("");

    const renderOverview = filter => {
      const filtered = filter === "all" ? orderedEvents : orderedEvents.filter(event => event.type === filter);
      list.innerHTML = filtered.length ? filtered.map(event => {
        const index = orderedEvents.indexOf(event) + 1;
        const date = programDate(event.date);
        return `<a class="program-card" href="${programRoute(event)}">
          <span class="program-card-number">${String(index).padStart(2, "0")}</span>
          <span class="program-card-content"><small>${displayType(event)}</small><strong>${displayTitle(event)}</strong></span>
          <span class="program-card-meta">${date || event.date ? `<span>${date ? date.short : event.date}</span>` : ""}${date ? `<span>${displayWeekday(date)}</span>` : ""}${programTime(event) ? `<span>${programTime(event)}</span>` : ""}</span>
          <span class="program-card-arrow" aria-hidden="true">&gt;</span>
        </a>`;
      }).join("") : `<p class="program-empty data-pending">${labels.noEvents}</p>`;
    };

    filters.forEach(button => button.addEventListener("click", () => {
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderOverview(button.dataset.programFilter);
    }));
    renderOverview("all");

    const datedEvents = events.map(event => ({event, date: programDate(event.date)})).filter(item => item.date).sort((a, b) => a.date.date - b.date.date);
    const eventsByDate = new Map();
    datedEvents.forEach(item => {
      if (!eventsByDate.has(item.date.key)) eventsByDate.set(item.date.key, []);
      eventsByDate.get(item.date.key).push(item.event);
    });

    const calendarGrid = document.querySelector("#program-calendar-grid");
    const start = new Date(Date.UTC(2026, 9, 31));
    const end = new Date(Date.UTC(2026, 10, 15));
    const calendarCells = Array.from({length: (start.getUTCDay() + 6) % 7}, () => '<span class="program-calendar-blank" aria-hidden="true"></span>');
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const key = `${cursor.getUTCFullYear()}.${String(cursor.getUTCMonth() + 1).padStart(2, "0")}.${String(cursor.getUTCDate()).padStart(2, "0")}`;
      const dayEvents = eventsByDate.get(key) || [];
      const label = `${cursor.getUTCMonth() + 1}/${cursor.getUTCDate()}`;
      calendarCells.push(dayEvents.length
        ? `<button type="button" class="program-calendar-day has-event" data-program-date="${key}" aria-pressed="false" aria-label="${label}，${dayEvents.length} ${labels.eventCountSuffix}"><span>${label}</span><i aria-hidden="true"></i></button>`
        : `<span class="program-calendar-day"><span>${label}</span></span>`);
    }
    calendarGrid.innerHTML = calendarCells.join("");

    const selectedPanel = document.querySelector("#program-selected-date");
    const dateButtons = [...calendarGrid.querySelectorAll("[data-program-date]")];
    const selectDate = key => {
      dateButtons.forEach(button => {
        const active = button.dataset.programDate === key;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const date = programDate(key);
      const selectedEvents = eventsByDate.get(key) || [];
      selectedPanel.innerHTML = `<p class="program-selected-date-label">${key} ${displayWeekday(date)}</p>${selectedEvents.map(event => `<a href="${programRoute(event)}"><span>${programTime(event)}</span><strong>${displayTitle(event)}</strong><i aria-hidden="true">&gt;</i></a>`).join("")}`;
    };
    dateButtons.forEach(button => button.addEventListener("click", () => selectDate(button.dataset.programDate)));
    if (dateButtons.length) selectDate(dateButtons[0].dataset.programDate);
    else selectedPanel.innerHTML = `<p class="data-pending">${isEnglish ? "Program dates pending" : "活動日期資料待提供"}</p>`;

  };

  const networkProfile = {
    nodeBaseAlpha: .24,
    nodeObservationAlpha: .34,
    connectionBaseAlpha: .075,
    connectionProximityAlpha: .07,
    connectionObservationAlpha: .25,
    observationConnectionDistance: 60,
    lightCenterAlpha: .042,
    lightEdgeAlpha: .013
  };

  const initializeSiteObservation = () => {
    const hero = document.querySelector("#hero-observation");
    const targets = hero ? [...hero.querySelectorAll("[data-observation-id]")] : [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let frameId = 0;
    let targetMeasureFrame = 0;
    let heroVisible = Boolean(hero);
    let targetCenters = [];
    let observedTarget = null;

    const measureHeroTargets = () => {
      targetMeasureFrame = 0;
      if (!heroVisible) return;
      targetCenters = targets.map(target => {
        const rect = target.getBoundingClientRect();
        return {target, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
      });
    };

    const scheduleTargetMeasurement = () => {
      if (!targetMeasureFrame) targetMeasureFrame = requestAnimationFrame(measureHeroTargets);
    };

    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) scheduleTargetMeasurement();
        else {
          observedTarget?.removeAttribute("data-observed");
          observedTarget = null;
          hero.dataset.observationTarget = "";
        }
      }).observe(hero);
    }
    scheduleTargetMeasurement();

    const observeAt = (viewportX, viewportY, active) => {
      observationState.x = viewportX;
      observationState.y = viewportY;
      observationState.active = active;
      observationState.mode = document.body.dataset.observationMode || "idle";
      document.documentElement.style.setProperty("--observation-viewport-x", `${viewportX}px`);
      document.documentElement.style.setProperty("--observation-viewport-y", `${viewportY}px`);
      document.documentElement.style.setProperty("--observation-active", active ? "1" : "0");

      if (heroVisible && targetCenters.length) {
        const nearest = targetCenters.reduce((result, point) => {
          const distance = Math.hypot(viewportX - point.x, viewportY - point.y);
          return distance < result.distance ? {target: point.target, distance} : result;
        }, {target: null, distance: Infinity}).target;
        const nextObservedTarget = active ? nearest : null;
        if (nextObservedTarget !== observedTarget) {
          observedTarget?.removeAttribute("data-observed");
          nextObservedTarget?.setAttribute("data-observed", "");
          observedTarget = nextObservedTarget;
        }
        if (hero) hero.dataset.observationTarget = nextObservedTarget?.dataset.observationId || "";
      }
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
    window.addEventListener("scroll", () => {
      observeViewportCenter();
      scheduleTargetMeasurement();
    }, {passive: true});
    siteResizeHandlers.add(() => {
      observeViewportCenter();
      scheduleTargetMeasurement();
    });
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
    if (!accordion) return;
    const items = [...accordion.querySelectorAll(".artist-accordion-item")];
    const hoverInput = window.matchMedia("(hover: hover) and (pointer: fine)");
    const touchInput = window.matchMedia("(hover: none), (pointer: coarse)");
    const section = accordion.closest(".home-accordion-section");
    const defaultIndex = Math.floor((items.length - 1) / 2);
    let activeIndex = -1;
    let observationFrame = 0;
    let transitionLocked = false;
    let lockTimer = 0;
    let touchStartY = 0;
    let touchCurrentY = 0;
    let trackingTouch = false;

    const setActive = index => {
      if (index < 0 || index >= items.length || index === activeIndex) return;
      const previousItem = items[activeIndex];
      const nextItem = items[index];
      previousItem?.classList.remove("is-active");
      nextItem.classList.add("is-active");
      activeIndex = index;
    };

    const activateNearestToObservation = () => {
      if (hoverInput.matches || touchInput.matches || section?.classList.contains("is-touch-sequential") || !items.length) return;
      const observedElement = document.elementFromPoint(observationState.x, observationState.y);
      const observedItem = observedElement?.closest(".artist-accordion-item");
      if (observedItem && accordion.contains(observedItem)) setActive(Number(observedItem.dataset.accordionIndex));
    };

    const scheduleObservationCheck = () => {
      if (observationFrame) cancelAnimationFrame(observationFrame);
      observationFrame = requestAnimationFrame(() => {
        activateNearestToObservation();
        observationFrame = 0;
      });
    };

    const syncSequentialLayout = () => {
      if (!section) return;
      const enabled = touchInput.matches && !hoverInput.matches;
      section.classList.toggle("is-touch-sequential", enabled);
    };

    const releaseSequentialSection = direction => {
      const target = direction > 0 ? section?.nextElementSibling : section?.previousElementSibling;
      target?.scrollIntoView({block: direction > 0 ? "start" : "end", behavior: "auto"});
    };

    const finishSequentialSwipe = () => {
      if (!trackingTouch || transitionLocked) return;
      trackingTouch = false;
      const delta = touchStartY - touchCurrentY;
      if (Math.abs(delta) < 36) return;
      const direction = delta > 0 ? 1 : -1;
      const nextIndex = activeIndex + direction;
      if (nextIndex < 0 || nextIndex >= items.length) {
        releaseSequentialSection(direction);
        return;
      }
      setActive(nextIndex);
      transitionLocked = true;
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => { transitionLocked = false; }, 220);
    };

    accordion.addEventListener("pointerover", event => {
      if (event.pointerType === "touch") return;
      const item = event.target.closest(".artist-accordion-item");
      const previousItem = event.relatedTarget?.closest?.(".artist-accordion-item");
      if (item && accordion.contains(item) && item !== previousItem) {
        section?.classList.remove("is-touch-sequential");
        setActive(Number(item.dataset.accordionIndex));
      }
    });
    accordion.addEventListener("focusin", event => {
      const item = event.target.closest(".artist-accordion-item");
      if (item && accordion.contains(item)) setActive(Number(item.dataset.accordionIndex));
    });
    section?.addEventListener("touchstart", event => {
      if (event.touches.length !== 1) return;
      section.classList.add("is-touch-sequential");
      trackingTouch = true;
      touchStartY = event.touches[0].clientY;
      touchCurrentY = touchStartY;
    }, {passive: true});
    section?.addEventListener("touchmove", event => {
      if (!trackingTouch || event.touches.length !== 1) return;
      touchCurrentY = event.touches[0].clientY;
      event.preventDefault();
    }, {passive: false});
    section?.addEventListener("touchend", finishSequentialSwipe, {passive: true});
    section?.addEventListener("touchcancel", () => { trackingTouch = false; }, {passive: true});
    window.addEventListener("scroll", scheduleObservationCheck, {passive: true});
    siteResizeHandlers.add(() => { syncSequentialLayout(); scheduleObservationCheck(); });
    hoverInput.addEventListener("change", () => { syncSequentialLayout(); scheduleObservationCheck(); });
    touchInput.addEventListener("change", syncSequentialLayout);

    syncSequentialLayout();
    setActive(touchInput.matches && !hoverInput.matches ? 0 : defaultIndex);
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

  let heroSequenceHasCompleted = false;
  let heroScrollPosition = 0;
  let heroScrollSafetyTimer = 0;
  let heroBodyInlineStyles = null;

  const lockHeroScroll = () => {
    if (page !== "home" || heroSequenceHasCompleted || document.documentElement.classList.contains("hero-scroll-locked")) return;
    heroScrollPosition = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    heroBodyInlineStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight
    };
    document.documentElement.classList.add("hero-scroll-locked");
    document.body.classList.add("hero-scroll-locked");
    document.body.style.position = "fixed";
    document.body.style.top = `-${heroScrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarWidth) document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const unlockHeroScroll = () => {
    if (heroSequenceHasCompleted) return;
    heroSequenceHasCompleted = true;
    window.clearTimeout(heroScrollSafetyTimer);
    document.documentElement.classList.remove("hero-scroll-locked");
    document.body.classList.remove("hero-scroll-locked");
    if (heroBodyInlineStyles) Object.assign(document.body.style, heroBodyInlineStyles);
    window.scrollTo({top: heroScrollPosition, left: 0, behavior: "auto"});
  };

  const runHeroSequence = async () => {
    const hero = document.querySelector("#hero-observation");
    const titleStage = hero.querySelector(".hero-title-stage");
    const titleVideo = titleStage.querySelector(".hero-title-video");
    const logoPrototype = titleStage.classList.contains("hero-logo-prototype");
    const completeSequence = () => window.dispatchEvent(new CustomEvent("heroSequenceComplete"));
    window.addEventListener("heroSequenceComplete", unlockHeroScroll, {once: true});
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      titleVideo?.pause();
      titleStage.classList.add("is-mark-visible");
      completeSequence();
      return;
    }
    lockHeroScroll();
    heroScrollSafetyTimer = window.setTimeout(unlockHeroScroll, 8000);

    const titleElements = [...hero.querySelectorAll(".hero-scramble")];
    const messageGroup = hero.querySelector(".hero-system-messages");
    const messageLines = [...messageGroup.querySelectorAll("p")];
    const scrollLink = hero.querySelector(".hero-scroll");
    const finalMessages = messageLines.map(line => line.textContent);
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
    if (document.fonts?.load) {
      await Promise.race([
        Promise.all([
          document.fonts.load('500 1em "Noto Serif JP"'),
          document.fonts.load('400 1em "Germania One"')
        ]),
        wait(1200)
      ]).catch(() => {});
    }
    hero.classList.add("hero-sequence-running");
    titleStage.classList.add("hero-sequence-running");

    const scrambleTitles = (elements, options = {}) => new Promise(resolve => {
      const duration = options.duration || 2060;
      const fromRatio = options.fromRatio ?? .25;
      const toRatio = options.toRatio ?? .94;
      const volatility = options.volatility || 0;
      const useEnglishFontMix = options.englishFontMix || false;
      const prototypeTiming = Object.keys(options).length > 0;
      const legacyTimeline = [
        {start: 0, end: 900, from: .25, to: .35},
        {start: 900, end: 1700, from: .65, to: .78},
        {start: 1700, end: 2060, from: .9, to: .94}
      ];
      const frame = 46;
      const shuffle = values => {
        const result = [...values];
        for (let index = result.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
      };
      const states = elements.map(element => {
        const characters = [...(element.dataset.finalText || element.textContent)];
        const slots = characters.map((character, index) => character === " " ? -1 : index).filter(index => index >= 0);
        const isEnglishTitle = element.matches(".hero-logo-recognition-en") || element.closest(".hero-title-language-en");
        if (!element.dataset.finalText) element.setAttribute("aria-label", element.textContent);
        const state = {
          element,
          characters,
          slots,
          resolutionOrder: shuffle(slots),
          resolved: new Set(),
          glyphs: [...(isEnglishTitle ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?#%+-/\\01▒▓" : "灰色自動體未識別中?#%+/\\01▒▓")],
          isEnglishTitle
        };
        if (isEnglishTitle && useEnglishFontMix) {
          state.glyphNodes = [];
          state.currentGlyphs = [];
          state.currentResolved = [];
          element.textContent = "";
          state.glyphLine = document.createElement("span");
          state.glyphLine.className = "hero-logo-glyph-line";
          element.append(state.glyphLine);
          characters.forEach((character, index) => {
            if (character === " ") {
              state.glyphLine.append(document.createTextNode(" "));
              return;
            }
            const glyph = document.createElement("span");
            glyph.className = "hero-logo-glyph is-togetoge";
            state.glyphLine.append(glyph);
            state.glyphNodes[index] = glyph;
          });
        }
        return state;
      });
      const chooseEnglishFont = mixProgress => {
        const togetogeChance = 1 / 3 + (2 / 3 * mixProgress);
        const random = Math.random();
        if (random < togetogeChance) return "is-togetoge";
        return random < togetogeChance + (1 - togetogeChance) / 2 ? "is-turret" : "is-serif";
      };
      const startedAt = performance.now();
      const tick = now => {
        const elapsed = Math.min(now - startedAt, duration);
        const progress = elapsed / duration;
        const legacyStage = legacyTimeline.find(stage => elapsed <= stage.end) || legacyTimeline.at(-1);
        const legacyProgress = Math.min(1, Math.max(0, (elapsed - legacyStage.start) / (legacyStage.end - legacyStage.start)));
        const ratio = prototypeTiming
          ? fromRatio + ((toRatio - fromRatio) * progress)
          : legacyStage.from + ((legacyStage.to - legacyStage.from) * legacyProgress);
        const mixProgress = useEnglishFontMix && options.fontMixRecognition ? progress : 0;
        if (!prototypeTiming) titleStage.dataset.decodeStage = String(legacyTimeline.indexOf(legacyStage) + 1);
        states.forEach(state => {
          const maxResolved = prototypeTiming ? state.slots.length : state.slots.length - 1;
          const target = Math.min(maxResolved, Math.max(prototypeTiming ? 0 : 1, Math.round(state.slots.length * ratio)));
          while (state.resolved.size < target) state.resolved.add(state.resolutionOrder[state.resolved.size]);
          const glyphs = state.characters.map((character, index) => {
            if (character === " ") return character;
            const isResolved = state.resolved.has(index) && !(volatility && Math.random() < volatility * (1 - progress));
            if (isResolved) return character;
            const unresolvedGlyphs = state.glyphs.filter(glyph => glyph !== character);
            return unresolvedGlyphs[Math.floor(Math.random() * unresolvedGlyphs.length)];
          });
          if (state.glyphNodes) {
            glyphs.forEach((glyph, index) => {
              if (state.characters[index] === " ") return;
              const isResolved = glyph === state.characters[index] && state.resolved.has(index);
              if (state.currentGlyphs[index] !== glyph || state.currentResolved[index] !== isResolved) {
                const node = state.glyphNodes[index];
                node.textContent = glyph;
                node.className = `hero-logo-glyph ${chooseEnglishFont(mixProgress)}`;
                state.currentGlyphs[index] = glyph;
                state.currentResolved[index] = isResolved;
              }
            });
          } else state.element.textContent = glyphs.join("");
        });
        if (elapsed < duration) window.setTimeout(() => requestAnimationFrame(tick), frame);
        else resolve(states);
      };
      requestAnimationFrame(tick);
    });

    const typeLine = async (element, text) => {
      for (const character of [...text]) {
        element.textContent += character;
        await wait(/[\x00-\x7F]/.test(character) ? 36 : 58);
      }
    };

    const playHeroVideo = async () => {
      if (!titleVideo || !titleVideo.canPlayType('video/webm; codecs="vp9"')) return false;
      try {
        titleVideo.pause();
        titleVideo.currentTime = 0;
        titleVideo.muted = true;
        const completion = new Promise((resolve, reject) => {
          titleVideo.addEventListener("ended", resolve, {once: true});
          titleVideo.addEventListener("error", reject, {once: true});
        });
        titleStage.classList.add("is-video-active");
        await titleVideo.play();
        await completion;
        return true;
      } catch (error) {
        titleVideo.pause();
        titleStage.classList.remove("is-video-active");
        console.warn("Hero video unavailable; using DOM animation fallback.", error);
        return false;
      }
    };

    try {
      const videoPlayed = await playHeroVideo();
      if (!videoPlayed && logoPrototype) await window.DAFHeroLogoAnimation.run(titleStage);
      else if (!videoPlayed) {
        await scrambleTitles(titleElements);
        titleStage.classList.add("is-final-transition");
        await wait(80);
        titleStage.classList.add("is-final-flicker");
        await wait(60);
        titleStage.classList.add("is-final-resolved");
        await wait(120);
        titleStage.classList.add("is-mark-visible");
        titleStage.classList.remove("is-final-transition", "is-final-flicker", "is-final-resolved");
      }
    } catch (error) {
      console.error("Hero logo animation fallback:", error);
      titleStage.className = titleStage.className.replace(/\bis-[\w-]+\b/g, "").replace(/\s+/g, " ").trim();
      titleStage.classList.add("is-mark-visible");
    }
    for (let index = 0; index < messageLines.length; index += 1) {
      await typeLine(messageLines[index], finalMessages[index]);
      if (index < messageLines.length - 1) await wait(transitions[index].delay);
    }
    await wait(230);
    await wait(540);
    scrollLink.classList.add("is-visible");
    await wait(320);
    completeSequence();
  };

  const initializeFeaturedPagination = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paginations = [...document.querySelectorAll("[data-featured-pagination]")].map(pagination => {
      const track = document.querySelector(`#${pagination.dataset.featuredPagination}`);
      let buttons = [];
      let scrollFrame = 0;

      const updateActiveDot = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const activeIndex = buttons.length > 1 && maxScroll > 0
          ? Math.round((track.scrollLeft / maxScroll) * (buttons.length - 1))
          : 0;
        buttons.forEach((button, index) => {
          button.classList.toggle("is-active", index === activeIndex);
          if (index === activeIndex) button.setAttribute("aria-current", "true");
          else button.removeAttribute("aria-current");
        });
        scrollFrame = 0;
      };

      const rebuild = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const pageCount = maxScroll > 1 ? Math.ceil(maxScroll / track.clientWidth) + 1 : 1;
        pagination.hidden = pageCount <= 1;
        pagination.innerHTML = Array.from({length: pageCount}, (_, index) => `<button type="button" aria-label="${isEnglish ? `Go to featured section ${index + 1}` : `前往第 ${index + 1} 個精選區段`}"></button>`).join("");
        buttons = [...pagination.querySelectorAll("button")];
        buttons.forEach((button, index) => button.addEventListener("click", () => {
          const left = buttons.length > 1 ? maxScroll * index / (buttons.length - 1) : 0;
          track.scrollTo({left, behavior: reducedMotion.matches ? "auto" : "smooth"});
        }));
        updateActiveDot();
      };

      track.addEventListener("scroll", () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveDot);
      }, {passive: true});
      rebuild();
      return rebuild;
    });

    let resizeFrame = 0;
    siteResizeHandlers.add(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        paginations.forEach(rebuild => rebuild());
        resizeFrame = 0;
      });
    });
    return () => paginations.forEach(rebuild => rebuild());
  };

  const hydrateHome = () => {
    document.querySelector("#home-artist-accordion").innerHTML = artistAccordionItems(D.artists.filter(artist => textFor(artist, "name") && D.homeArtworkImages?.[artist.workId]));
    const upcomingSection = document.querySelector("#upcoming-programs");
    const upcomingTrack = document.querySelector("#home-upcoming-programs");
    const renderUpcomingPrograms = () => {
      const upcoming = homeProgramSlotsAt(D.events);
      upcomingSection.hidden = upcoming.length === 0;
      upcomingTrack.innerHTML = featuredProgramCards(upcoming);
    };
    renderUpcomingPrograms();
    initializeArtistAccordion();
    const rebuildFeaturedPagination = initializeFeaturedPagination();
    const upcomingTimer = window.setInterval(() => {
      renderUpcomingPrograms();
      rebuildFeaturedPagination();
    }, 60000);
    window.addEventListener("pagehide", () => window.clearInterval(upcomingTimer), {once: true});
    runHeroSequence();
  };

  const initializeFolderTabs = () => {
    document.querySelectorAll("[data-folder-tabs]").forEach(widget => {
      const tabs = [...widget.querySelectorAll('[role="tab"]')];
      const panels = [...widget.querySelectorAll('[role="tabpanel"]')];
      if (!tabs.length || !panels.length) return;

      const activate = (tab, {focus = false, updateHash = true} = {}) => {
        tabs.forEach(item => {
          const active = item === tab;
          item.setAttribute("aria-selected", String(active));
          item.tabIndex = active ? 0 : -1;
        });
        panels.forEach(panel => { panel.hidden = panel.id !== tab.dataset.tabTarget; });
        if (focus) tab.focus();
        if (updateHash && history.replaceState) history.replaceState(null, "", `#${tab.dataset.tabTarget}`);
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(tab));
        tab.addEventListener("keydown", event => {
          const keys = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};
          let nextIndex = keys[event.key] == null ? index : (index + keys[event.key] + tabs.length) % tabs.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = tabs.length - 1;
          if (nextIndex === index && !["Home", "End"].includes(event.key)) return;
          event.preventDefault();
          activate(tabs[nextIndex], {focus: true});
        });
      });

      const activateFromHash = () => {
        const target = location.hash.slice(1);
        const tab = tabs.find(item => item.dataset.tabTarget === target);
        if (tab) activate(tab, {updateHash: false});
      };
      activateFromHash();
      window.addEventListener("hashchange", activateFromHash);
    });
  };

  const initializeAboutWebsiteLinks = () => {
    if (page !== "about") return;
    document.querySelectorAll(".about-organization-profile").forEach(profile => {
      const logoLink = profile.querySelector(":scope > a[href]");
      const content = profile.querySelector(":scope > div");
      if (!logoLink || !content || content.querySelector("a.button[href]")) return;
      const websiteButton = document.createElement("a");
      websiteButton.className = "button";
      websiteButton.href = logoLink.href;
      websiteButton.target = "_blank";
      websiteButton.rel = "noopener noreferrer";
      websiteButton.textContent = isEnglish ? "WEBSITE" : "官方網站";
      content.append(websiteButton);
    });
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
    const workById = id => D.mapWorks.find(item => item.id === id);
    const mapArtist = work => isEnglish ? work.artistEn || work.artist : work.artist || work.artistEn;
    const mapTitle = work => isEnglish ? work.titleEn || work.title : work.title || work.titleEn;
    document.querySelectorAll(".map-shell[data-map-id]").forEach(map => {
      const mapId = map.dataset.mapId;
      const locations = D.mapLocations.filter(item => item.map === mapId);
      const markerLayer = map.querySelector("[data-map-markers]");
      markerLayer.innerHTML = locations.map(location => {
        const works = location.workIds.map(workById).filter(Boolean);
        const label = location.name || works.map(work => `${mapArtist(work)} ${mapTitle(work)}`).join("、");
        return `<button class="marker" style="left:${location.x}%;top:${location.y}%" data-location-id="${location.id}" data-location-type="${location.type}" aria-label="${isEnglish ? "View" : "查看"} ${label}" aria-expanded="false"><svg class="marker-symbol" viewBox="0 0 385.5 515.9" aria-hidden="true"><path d="M.1,188.9C.1,84.5,86.4,0,192.8,0s192.7,84.5,192.7,188.9-120.6,262.8-171,317.4c-5.9,6.4-13.8,9.6-21.7,9.6-7.9,0-15.8-3.2-21.7-9.6C120.6,451.7,0,308.4,0,188.9h.1Z"/></svg><span class="marker-number">${location.number}</span></button>`;
      }).join("");
    });

    document.querySelectorAll("[data-map-list]").forEach(list => {
      const listType = list.dataset.mapListType;
      const locations = D.mapLocations.filter(item => item.map === list.dataset.mapList && (!listType || item.type === listType));
      const heading = list.querySelector("strong")?.outerHTML || "";
      const works = locations.flatMap(location => location.workIds.map(workById).filter(Boolean));
      list.innerHTML = heading + `<div class="map-list-entries">${works.map(work => `<article class="map-list-item"><span class="map-list-number">${work.number}</span><span class="map-list-artist">${mapArtist(work)}</span>${mapTitle(work) ? `<strong class="map-list-title">${mapTitle(work)}</strong>` : ""}</article>`).join("")}</div>`;
    });
  };

  const initializeMapInteraction = () => {
    const workById = id => D.mapWorks.find(item => item.id === id);
    const mapArtist = work => isEnglish ? work.artistEn || work.artist : work.artist || work.artistEn;
    const mapTitle = work => isEnglish ? work.titleEn || work.title : work.title || work.titleEn;
    const catalogWorkFor = mapWork => mapWork?.workId == null
      ? null
      : workCatalog.find(item => String(item.id) === String(mapWork.workId));
    const isCompactMap = () => window.matchMedia("(max-width: 900px)").matches;
    let activeCard = null;
    let activeMarker = null;
    let activeUiLayer = null;
    const closeMarkerCard = () => {
      closeDismissiblePanel({
        panel: activeCard,
        layer: activeUiLayer,
        bodyClass: "map-modal-open",
        afterClose: () => {
          if (activeMarker) activeMarker.setAttribute("aria-expanded", "false");
          activeCard = null;
          activeMarker = null;
          activeUiLayer = null;
        }
      });
    };

    document.querySelectorAll(".map-shell[data-map-id]").forEach(map => {
      const markerLayer = map.querySelector("[data-map-markers]");
      const card = map.querySelector(".marker-card");
      const uiLayer = map.querySelector(".map-ui-layer");
      const positionMarkerCard = () => {
        if (activeCard !== card || !activeMarker || card.hidden || isCompactMap()) return;
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
      const syncMapCardMode = () => {
        if (activeCard !== card) return;
        document.body.classList.toggle("map-modal-open", !card.hidden && isCompactMap());
        if (!card.hidden && !isCompactMap()) positionMarkerCard();
      };
      const markers = [...map.querySelectorAll(".marker")];
      let collisionGroups = [];
      let spreadGroup = null;
      const collisionPadding = 6;
      const rebuildCollisionGroups = () => {
        const parent = markers.map((_, index) => index);
        const find = index => parent[index] === index ? index : (parent[index] = find(parent[index]));
        const join = (a, b) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent[rb] = ra; };
        const rects = markers.map(marker => marker.getBoundingClientRect());
        rects.forEach((source, i) => rects.slice(i + 1).forEach((target, offset) => {
          const overlaps = source.right + collisionPadding > target.left
            && source.left - collisionPadding < target.right
            && source.bottom + collisionPadding > target.top
            && source.top - collisionPadding < target.bottom;
          if (overlaps) join(i, i + offset + 1);
        }));
        const groups = new Map();
        markers.forEach((marker, index) => { const root = find(index); if (!groups.has(root)) groups.set(root, []); groups.get(root).push(marker); });
        collisionGroups = [...groups.values()].filter(group => group.length > 1);
        if (window.__DEBUG_MAP_COLLISION__) {
          console.debug("[MapCollision] groups:", collisionGroups.map(group => group.map(marker => ({id: marker.dataset.locationId, rect: (() => { const r = marker.getBoundingClientRect(); return {left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom)}; })()}))));
        }
      };
      const groupFor = marker => collisionGroups.find(group => group.includes(marker));
      const clearSpread = () => {
        markerLayer?.querySelector("[data-marker-spread-layer]")?.remove();
        markers.forEach(marker => { marker.style.removeProperty("--spread-x"); marker.style.removeProperty("--spread-y"); marker.style.removeProperty("z-index"); });
        spreadGroup = null;
      };
      const spread = group => {
        clearSpread();
        const layer = document.createElement("div");
        layer.dataset.markerSpreadLayer = "";
        layer.className = "marker-spread-layer";
        markerLayer?.prepend(layer);
        const layerRect = layer.getBoundingClientRect();
        const anchors = group.map(marker => {
          const rect = marker.getBoundingClientRect();
          return {marker, x: rect.left + rect.width / 2 - layerRect.left, y: rect.bottom - layerRect.top};
        });
        const minX = 28; const maxX = Math.max(minX, layerRect.width - 28); const minY = 34; const maxY = Math.max(minY, layerRect.height - 34);
        anchors.forEach(({marker, x: anchorX, y: anchorY}, index) => {
          const rect = marker.getBoundingClientRect();
          const halfWidth = rect.width / 2;
          const markerHeight = rect.height;
          const ids = group.map(item => item.dataset.locationId);
          const outdoor = ids.includes("outdoor-01") && ids.includes("outdoor-02");
          const artStores = ["district-05", "district-06", "district-07"].every(id => ids.includes(id));
          const hint = outdoor
            ? ({"outdoor-01": {x: -18, y: 0}, "outdoor-02": {x: 0, y: -48}}[marker.dataset.locationId] || {x: 0, y: 0})
            : artStores
              ? ({"district-05": {x: -56, y: -28}, "district-07": {x: -56, y: 28}}[marker.dataset.locationId] || {x: 0, y: 0})
              : {x: 0, y: 0};
          const targetX = Math.min(maxX, Math.max(minX, anchorX + hint.x));
          const targetY = Math.min(maxY, Math.max(minY, anchorY + hint.y));
          const dx = targetX - anchorX; const dy = targetY - anchorY;
          if (dx || dy) {
            marker.style.setProperty("--spread-x", `${dx}px`); marker.style.setProperty("--spread-y", `${dy}px`);
            marker.style.zIndex = "21";
            const line = document.createElement("span"); line.className = "marker-spread-line";
            line.style.left = `${anchorX}px`; line.style.top = `${anchorY}px`; line.style.width = `${Math.hypot(dx, dy)}px`; line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            const anchor = document.createElement("span"); anchor.className = "marker-spread-anchor"; anchor.style.left = `${anchorX}px`; anchor.style.top = `${anchorY}px`; anchor.style.background = marker.dataset.locationType === "outdoor" ? "var(--map-marker-outdoor)" : "var(--map-marker-district)";
            layer.append(line, anchor);
            if (window.__DEBUG_MAP_ANCHOR__ && marker.dataset.locationId === "district-05") {
              requestAnimationFrame(() => {
                const markerRect = marker.getBoundingClientRect();
                const anchorRect = anchor.getBoundingClientRect();
                console.debug("[MapAnchorDebug]", {
                  markerRect: {left: markerRect.left - dx, top: markerRect.top - dy, width: markerRect.width, height: markerRect.height},
                  tipViewportX: anchorX + layerRect.left,
                  tipViewportY: anchorY + layerRect.top,
                  anchorContainingBlockRect: {left: layerRect.left, top: layerRect.top},
                  anchorLocalX: anchorX,
                  anchorLocalY: anchorY,
                  anchorViewportCenterX: anchorRect.left + anchorRect.width / 2,
                  anchorViewportCenterY: anchorRect.top + anchorRect.height / 2,
                  dx: anchorRect.left + anchorRect.width / 2 - (anchorX + layerRect.left),
                  dy: anchorRect.top + anchorRect.height / 2 - (anchorY + layerRect.top)
                });
              });
            }
          }
        });
        spreadGroup = group;
      };
      rebuildCollisionGroups();
      const recalcCollision = () => { clearSpread(); rebuildCollisionGroups(); };
      window.addEventListener("resize", recalcCollision, {passive: true});
      window.addEventListener("orientationchange", recalcCollision, {passive: true});
      const overlappingMarkers = marker => {
        const source = marker.getBoundingClientRect();
        const sourceX = source.left + source.width / 2;
        const sourceY = source.top + source.height / 2;
        return markers.filter(candidate => {
          const rect = candidate.getBoundingClientRect();
          return Math.hypot(rect.left + rect.width / 2 - sourceX, rect.top + rect.height / 2 - sourceY) < 34;
        });
      };
      markers.forEach(marker => marker.addEventListener("click", () => {
        const alreadySpread = spreadGroup?.includes(marker);
        if (!alreadySpread) rebuildCollisionGroups();
        let collisionGroup = alreadySpread ? spreadGroup : groupFor(marker);
        if (collisionGroup && !((collisionGroup.some(item => item.dataset.locationId === "outdoor-01") && collisionGroup.some(item => item.dataset.locationId === "outdoor-02")) || ["district-05", "district-06", "district-07"].every(id => collisionGroup.some(item => item.dataset.locationId === id)))) collisionGroup = null;
        if (collisionGroup && spreadGroup !== collisionGroup) { spread(collisionGroup); return; }
        let selectedMarker = marker;
        if (activeCard === card && !card.hidden) {
          const overlaps = overlappingMarkers(marker);
          if (overlaps.length > 1 && overlaps.includes(activeMarker)) {
            selectedMarker = overlaps[(overlaps.indexOf(activeMarker) + 1) % overlaps.length];
          } else if (activeMarker !== marker) {
            selectedMarker = marker;
          } else {
            closeMarkerCard();
            return;
          }
        }
        closeMarkerCard();
        const location = D.mapLocations.find(item => item.id === selectedMarker.dataset.locationId);
        const works = location.workIds.map(workById).filter(Boolean);
        const venue = venueById(location.venueId);
        activeMarker = selectedMarker;
        activeCard = card;
        activeUiLayer = uiLayer;
        selectedMarker.setAttribute("aria-expanded", "true");
        const workMarkup = works.map(work => {
          const catalogWork = catalogWorkFor(work);
          const content = `<span class="marker-work-number">${work.number}</span><span class="marker-work-copy"><span class="marker-work-title-line"><span class="marker-work-artist">${mapArtist(work)}</span>${mapTitle(work) ? `<span aria-hidden="true">｜</span><strong>${mapTitle(work)}</strong>` : ""}</span>${catalogWork?.year ? `<span class="marker-work-year">${catalogWork.year}</span>` : ""}</span><span class="marker-work-arrow" aria-hidden="true">&gt;</span>`;
          return catalogWork
            ? `<a class="marker-card-work" href="${C.localizedRoute(`work-detail.html?id=${catalogWork.id}`)}">${content}</a>`
            : `<div class="marker-card-work is-pending">${content}</div>`;
        }).join("");
        const galleryImages = works.flatMap(work => galleryImagesFor(catalogWorkFor(work), `${mapTitle(work)} ${isEnglish ? "image" : "作品圖片"}`));
        const mediaMarkup = galleryImages.length ? `<div class="marker-card-media" data-marker-gallery data-gallery-index="0">
          ${imageMarkup(galleryImages[0], galleryImages[0].alt)}
          ${galleryImages.length > 1 ? `<button class="marker-card-media-arrow is-previous" type="button" data-marker-gallery-direction="-1" aria-label="${isEnglish ? "Previous image" : "上一張圖片"}">‹</button><button class="marker-card-media-arrow is-next" type="button" data-marker-gallery-direction="1" aria-label="${isEnglish ? "Next image" : "下一張圖片"}">›</button><div class="gallery-dots" aria-label="${isEnglish ? "Image pagination" : "圖片分頁"}">${galleryImages.map((_, index) => `<button type="button" data-marker-gallery-index="${index}" aria-label="${isEnglish ? `View image ${index + 1}` : `查看第 ${index + 1} 張圖片`}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("")}</div>` : ""}
        </div>` : `<div class="marker-card-media">${C.placeholder(isEnglish ? "Work image pending" : "作品圖片待提供")}</div>`;
        card.innerHTML = `<div class="marker-card-controls"><button class="marker-card-close" type="button" aria-label="${isEnglish ? "Close location information" : "關閉位置資訊卡"}">×</button></div>${mediaMarkup}<header class="marker-card-location"><span class="venue-number">${venue?.displayNumber || "00"}</span><strong>${venueName(venue)}</strong>${storeStatusMarkup(venue, {compact:true})}</header><div class="marker-card-works">${workMarkup}</div>`;
        card.hidden = false;
        uiLayer.classList.add("is-open");
        card.querySelector(".marker-card-close").addEventListener("click", closeMarkerCard);
        const gallery = card.querySelector("[data-marker-gallery]");
        const showGalleryImage = index => {
          if (!gallery || !galleryImages.length) return;
          const nextIndex = (index + galleryImages.length) % galleryImages.length;
          gallery.dataset.galleryIndex = String(nextIndex);
          const image = gallery.querySelector("img");
          image.src = C.assetRoute(galleryImages[nextIndex].src);
          image.alt = galleryImages[nextIndex].alt;
          gallery.querySelectorAll("[data-marker-gallery-index]").forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === nextIndex)));
        };
        card.querySelectorAll("[data-marker-gallery-direction]").forEach(button => button.addEventListener("click", () => showGalleryImage(Number(gallery.dataset.galleryIndex) + Number(button.dataset.markerGalleryDirection))));
        card.querySelectorAll("[data-marker-gallery-index]").forEach(button => button.addEventListener("click", () => showGalleryImage(Number(button.dataset.markerGalleryIndex))));
        syncMapCardMode();
      }));
      map.addEventListener("click", event => { if (!event.target.closest(".marker, .marker-card")) clearSpread(); });
      window.addEventListener("resize", syncMapCardMode);
    });

    document.addEventListener("click", event => {
      if (!activeCard || event.target.closest(".marker-card, .marker")) return;
      closeMarkerCard();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && activeCard) closeMarkerCard();
    });
  };

  const initializeShops = () => {
    const lists = [...document.querySelectorAll("[data-shop-list]")];
    const layer = document.querySelector("[data-shop-detail-layer]");
    const panel = layer?.querySelector(".shop-detail-panel");
    if (!lists.length || !layer || !panel || !Array.isArray(D.shops)) return;
    document.body.append(layer);
    const syncShopVisualViewport = () => {
      const viewport = window.visualViewport;
      layer.style.setProperty("--visual-viewport-top", `${viewport?.offsetTop || 0}px`);
      layer.style.setProperty("--visual-viewport-height", `${viewport?.height || window.innerHeight}px`);
    };
    syncShopVisualViewport();
    window.visualViewport?.addEventListener("resize", syncShopVisualViewport);
    window.visualViewport?.addEventListener("scroll", syncShopVisualViewport);

    let returnFocus = null;
    let activeGalleryIndex = 0;
    let activeShop = null;
    const shopName = shop => isEnglish ? shop.nameEn || shop.nameZh : shop.nameZh || shop.nameEn;
    const shopSecondaryName = shop => !isEnglish && shop.nameEn && shop.nameEn !== shop.nameZh ? shop.nameEn : "";
    const shopAddress = shop => isEnglish ? shop.addressEn || shop.addressZh || shop.address : shop.addressZh || shop.address;
    const shopDescription = shop => isEnglish ? shop.descriptionEn || shop.descriptionZh || shop.description : shop.descriptionZh || shop.description;
    const shopBusinessHours = shop => isEnglish && shop.businessHoursEn?.length ? shop.businessHoursEn : shop.businessHours;
    const labels = isEnglish ? {
      address: "ADDRESS", hours: "BUSINESS HOURS", phone: "PHONE", description: "ABOUT",
      close: "Close partner store details", previous: "Previous image", next: "Next image", detail: "View details"
    } : {
      address: "地址", hours: "營業時間", phone: "電話", description: "店家介紹",
      close: "關閉合作店家資訊", previous: "上一張圖片", next: "下一張圖片", detail: "查看詳細資訊"
    };

    const linkMarkup = shop => Object.entries(shop.links || {}).map(([type, url]) => {
      if (!url) return "";
      const iconName = type === "website" ? "home" : type;
      const channel = type === "website" ? (isEnglish ? "official website" : "官方網站") : type === "instagram" ? "Instagram" : "Facebook";
      return `<a class="shop-external-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? `Visit ${shopName(shop)} ${channel}` : `前往${shopName(shop)}${channel}`}">${C.icon(iconName, "")}</a>`;
    }).join("");

    const galleryMarkup = shop => {
      const images = Array.isArray(shop.images) ? shop.images : [];
      if (!images.length) return "";
      return `<div class="shop-gallery" data-shop-list-gallery data-gallery-index="0">
        <img src="${C.assetRoute(images[0])}" alt="${shopName(shop)} ${isEnglish ? "image" : "圖片"} 1">
        ${images.length > 1 ? `<button class="shop-gallery-arrow is-previous" type="button" data-shop-list-gallery-direction="-1" aria-label="${labels.previous}" data-shop-id="${shop.id}">‹</button><button class="shop-gallery-arrow is-next" type="button" data-shop-list-gallery-direction="1" aria-label="${labels.next}" data-shop-id="${shop.id}">›</button>` : ""}
        ${images.length > 1 ? `<div class="gallery-dots" aria-label="${isEnglish ? "Image pagination" : "圖片分頁"}">${images.map((_, index) => `<button type="button" data-shop-list-gallery-index="${index}" data-shop-id="${shop.id}" aria-label="${isEnglish ? `View image ${index + 1}` : `查看第 ${index + 1} 張圖片`}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("")}</div>` : ""}
      </div>`;
    };

    const listCard = shop => `<article class="shop-list-item">
      <div class="shop-list-content">
        <span class="shop-number">${shop.displayNumber}</span>
        <span class="shop-list-name"><strong>${shopName(shop)}</strong>${shopSecondaryName(shop) ? `<span>${shopSecondaryName(shop)}</span>` : ""}</span>
        ${shopAddress(shop) ? `<p>${shopAddress(shop)}</p>` : ""}
        ${shop.phone ? `<p>${shop.phone}</p>` : ""}
        ${storeStatusMarkup(shop, {source:shop.recordType === "partner" ? "shop" : "venue", className:"shop-list-status"})}
        ${galleryMarkup(shop)}
        <button class="button shop-detail-trigger" type="button" data-shop-id="${shop.id}" aria-haspopup="dialog">${labels.detail}</button>
      </div>
    </article>`;

    const partnerShops = D.shops.map((shop, index) => ({...shop, displayNumber: String(index + 1).padStart(2, "0"), recordType: "partner"}));
    const artVenues = D.venues.filter(venue => venue.type === "district").map(venue => ({...venue, recordType: "venue"}));
    const records = [...partnerShops, ...artVenues];
    lists.forEach(list => {
      const source = list.dataset.shopList === "venues" ? artVenues : partnerShops;
      list.innerHTML = source.map(listCard).join("");
    });

    const closeShopPanel = ({restoreFocus = true} = {}) => {
      closeDismissiblePanel({panel, layer, hideLayer: true});
      unlockModalPageScroll("shop-modal-open");
      activeShop = null;
      if (restoreFocus && returnFocus) returnFocus.focus({preventScroll: true});
      returnFocus = null;
    };

    const updateGallery = direction => {
      const images = activeShop?.images || [];
      if (!images.length) return;
      activeGalleryIndex = (activeGalleryIndex + direction + images.length) % images.length;
      const image = panel.querySelector("[data-shop-gallery-image]");
      const count = panel.querySelector("[data-shop-gallery-count]");
      image.src = C.assetRoute(images[activeGalleryIndex]);
      image.alt = `${shopName(activeShop)} ${isEnglish ? "image" : "圖片"} ${activeGalleryIndex + 1}`;
      if (count) count.textContent = `${activeGalleryIndex + 1} / ${images.length}`;
    };

    const openShopPanel = (shop, trigger) => {
      activeShop = shop;
      activeGalleryIndex = 0;
      returnFocus = trigger;
      const images = Array.isArray(shop.images) ? shop.images : [];
      panel.classList.toggle("has-gallery", images.length > 0);
      const gallery = images.length ? `
        <div class="shop-gallery">
          <img data-shop-gallery-image src="${C.assetRoute(images[0])}" alt="${shopName(shop)} ${isEnglish ? "image" : "圖片"} 1">
          ${images.length > 1 ? `<button class="shop-gallery-arrow is-previous" type="button" data-shop-gallery-direction="-1" aria-label="${labels.previous}">‹</button><button class="shop-gallery-arrow is-next" type="button" data-shop-gallery-direction="1" aria-label="${labels.next}">›</button>` : ""}
          ${images.length > 1 ? `<span class="shop-gallery-count" data-shop-gallery-count>1 / ${images.length}</span>` : ""}
        </div>` : "";
      panel.innerHTML = `
        <div class="shop-detail-controls"><button class="marker-card-close" type="button" aria-label="${labels.close}">×</button></div>
        ${gallery}
        <div class="shop-detail-content">
          <p class="shop-number">${shop.displayNumber}</p>
          <h3 id="shop-detail-title">${shopName(shop)}</h3>
          ${shopSecondaryName(shop) ? `<p class="shop-name-en">${shopSecondaryName(shop)}</p>` : ""}
          <dl class="shop-meta">
            ${shopAddress(shop) ? `<div><dt>${labels.address}</dt><dd>${shopAddress(shop)}</dd></div>` : ""}
            ${shopBusinessHours(shop)?.length ? `<div><dt>${labels.hours}</dt><dd>${shopBusinessHours(shop).map(line => `<span>${line}</span>`).join("")}</dd></div>` : ""}
            ${shop.phone ? `<div><dt>${labels.phone}</dt><dd>${shop.phone}</dd></div>` : ""}
          </dl>
          ${shopDescription(shop) ? `<section class="shop-description"><h4>${labels.description}</h4>${shopDescription(shop).split("\n").map(paragraph => `<p>${paragraph}</p>`).join("")}</section>` : ""}
          ${linkMarkup(shop) ? `<div class="shop-links">${linkMarkup(shop)}</div>` : ""}
          ${shop.recordType === "venue" && shop.workIds?.length ? `<div class="shop-venue-works">${shop.workIds.map(id => workCatalog.find(work => String(work.id) === String(id))).filter(Boolean).map(work => `<a href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}"><span>${work.number}</span>${textFor(work, "title")}</a>`).join("")}</div>` : ""}
        </div>`;
      layer.hidden = false;
      panel.hidden = false;
      syncShopVisualViewport();
      panel.scrollTop = 0;
      layer.classList.add("is-open");
      lockModalPageScroll("shop-modal-open");
      panel.querySelector(".marker-card-close").addEventListener("click", () => closeShopPanel());
      panel.querySelectorAll("[data-shop-gallery-direction]").forEach(button => button.addEventListener("click", () => updateGallery(Number(button.dataset.shopGalleryDirection))));
      panel.querySelector(".marker-card-close").focus();
    };

    lists.forEach(list => list.addEventListener("click", event => {
      const galleryButton = event.target.closest("[data-shop-list-gallery-direction]");
      const galleryDot = event.target.closest("[data-shop-list-gallery-index]");
      if (galleryButton || galleryDot) {
        const control = galleryButton || galleryDot;
        const shop = records.find(item => item.id === control.dataset.shopId);
        const gallery = control.closest("[data-shop-list-gallery]");
        const images = shop?.images || [];
        if (!gallery || !images.length) return;
        const nextIndex = galleryDot
          ? Number(galleryDot.dataset.shopListGalleryIndex)
          : (Number(gallery.dataset.galleryIndex) + Number(galleryButton.dataset.shopListGalleryDirection) + images.length) % images.length;
        gallery.dataset.galleryIndex = String(nextIndex);
        const image = gallery.querySelector("img");
        image.src = C.assetRoute(images[nextIndex]);
        image.alt = `${shopName(shop)} ${isEnglish ? "image" : "圖片"} ${nextIndex + 1}`;
        gallery.querySelectorAll("[data-shop-list-gallery-index]").forEach((dot, index) => dot.setAttribute("aria-current", String(index === nextIndex)));
        return;
      }
      const trigger = event.target.closest("[data-shop-id]");
      if (!trigger) return;
      const shop = records.find(item => item.id === trigger.dataset.shopId);
      if (shop) openShopPanel(shop, trigger);
    }));
    layer.addEventListener("click", event => {
      if (event.target === layer) closeShopPanel();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !layer.hidden) closeShopPanel();
    });
  };

  document.body.insertAdjacentHTML("afterbegin", C.siteBackground());
  document.body.dataset.networkProfile = "site";
  document.documentElement.style.setProperty("--observation-light-center", String(networkProfile.lightCenterAlpha));
  document.documentElement.style.setProperty("--observation-light-edge", String(networkProfile.lightEdgeAlpha));
  document.querySelector("#site-header").innerHTML = C.header(page);
  document.querySelector("#site-footer").innerHTML = C.footer();
  initializeBackToTop();

  const breadcrumbLabels = isEnglish ? {about:"ABOUT", map:"MAP", works:"WORKS", program:"PROGRAM", visit:"Visit"} : {about:"關於", map:"探索地圖", works:"作品介紹", program:"活動節目", visit:"參觀資訊"};
  if (breadcrumbLabels[page]) {
    const breadcrumb = page === "works" && location.hash === "#art-in-stores"
      ? [
          {label: breadcrumbLabels.works, href: "works.html"},
          {label: isEnglish ? "TAIPEI YUANSHAN DISTRICT" : "臺北圓山街區"}
        ]
      : breadcrumbLabels[page];
    document.querySelector("#breadcrumb").innerHTML = C.crumb(breadcrumb);
  }

  if (page === "home") hydrateHome();
  if (page === "works") {
    document.querySelector("#works-grid-main").innerHTML = workCards(D.works.filter(work => work.category === "main"));
    document.querySelector("#works-grid-outdoor").innerHTML = workCards(D.works.filter(work => work.category === "outdoor"));
    document.querySelector("#works-grid-district").innerHTML = workCards(D.works.filter(work => work.category === "district"));
  }
  if (page === "program") {
    initializeProgramPage();
  }
  if (page === "map") {
    renderMap();
    initializeMapInteraction();
    initializeShops();
    initializeStoreStatusUpdates();
  }
  if (page === "work-detail") renderWorkDetail();
  if (page === "event-detail") renderEventDetail();
  initializeFolderTabs();
  initializeAboutWebsiteLinks();
  initializeSiteObservation();
  initializeSiteNetwork();

  const menuToggle = document.querySelector(".menu-toggle");
  const menuIcon = menuToggle.querySelector("[data-menu-icon]");
  const navigation = document.querySelector(".header-nav");
  const submenuToggles = [...navigation.querySelectorAll(".nav-submenu-toggle")];
  const pageContent = [document.querySelector("#app"), document.querySelector("#site-footer"), document.querySelector(".back-to-top")].filter(Boolean);
  let menuReturnFocus = null;

  const setPageInert = inert => pageContent.forEach(element => {
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  });

  const closeMobileMenu = ({restoreFocus = true} = {}) => {
    const wasOpen = navigation.classList.contains("open");
    navigation.classList.remove("open");
    document.body.classList.remove("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", menuToggle.dataset.openLabel);
    menuIcon.src = menuIcon.dataset.openIcon;
    submenuToggles.forEach(button => {
      const item = button.closest("[data-submenu-container]");
      item.classList.remove("is-expanded");
      button.setAttribute("aria-expanded", "false");
      const label = button.dataset.submenuLabel || "";
      button.setAttribute("aria-label", `${isEnglish ? "Expand " : "展開"}${label}${isEnglish ? " submenu" : "第二層選單"}`);
    });
    if (usesTouchNavigation()) navigation.setAttribute("aria-hidden", "true");
    else navigation.removeAttribute("aria-hidden");
    setPageInert(false);
    if (wasOpen && restoreFocus && menuReturnFocus) menuReturnFocus.focus();
  };

  const openMobileMenu = () => {
    if (!usesTouchNavigation()) return;
    menuReturnFocus = document.activeElement;
    navigation.classList.add("open");
    document.body.classList.add("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", menuToggle.dataset.closeLabel);
    menuIcon.src = menuIcon.dataset.closeIcon;
    navigation.setAttribute("aria-hidden", "false");
    setPageInert(true);
    menuToggle.focus({preventScroll: true});
  };

  menuToggle.addEventListener("click", () => navigation.classList.contains("open") ? closeMobileMenu() : openMobileMenu());
  submenuToggles.forEach(button => button.addEventListener("click", () => {
    if (!usesTouchNavigation()) return;
    const item = button.closest("[data-submenu-container]");
    const expanded = !item.classList.contains("is-expanded");
    item.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    const label = button.dataset.submenuLabel || "";
    button.setAttribute("aria-label", `${isEnglish ? (expanded ? "Collapse " : "Expand ") : (expanded ? "收合" : "展開")}${label}${isEnglish ? " submenu" : "第二層選單"}`);
  }));
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMobileMenu({restoreFocus: false})));
  document.addEventListener("keydown", event => {
    if (!navigation.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [menuToggle, ...navigation.querySelectorAll("a, button")].filter(element => !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const resetMobileMenuForBreakpoint = () => {
    if (navigation.contains(document.activeElement)) document.activeElement.blur();
    closeMobileMenu({restoreFocus: false});
  };
  narrowNavigationMedia.addEventListener("change", resetMobileMenuForBreakpoint);
  touchNavigationMedia.addEventListener("change", () => { syncTouchNavigationClass(); resetMobileMenuForBreakpoint(); });
  resetMobileMenuForBreakpoint();

  const fallbackCopy = value => {
    const field = document.createElement("textarea");
    const previousFocus = document.activeElement;
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    let copied = false;
    try {
      field.focus();
      field.select();
      copied = document.execCommand("copy");
    } finally {
      field.remove();
      previousFocus?.focus?.({preventScroll: true});
    }
    return copied;
  };
  const copyCurrentPage = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        return true;
      }
      return fallbackCopy(window.location.href);
    } catch (_) {
      return fallbackCopy(window.location.href);
    }
  };
  const showCopyToast = (button, copied) => {
    const toast = button.closest(".share")?.querySelector(".copy-link-toast");
    if (!toast) return;
    const message = copied
      ? (isEnglish ? "Link copied" : "連結已複製")
      : (isEnglish ? "Unable to copy link" : "無法複製連結");
    const messageSlot = toast.querySelector("span");
    window.clearTimeout(toast._hideTimer);
    cancelAnimationFrame(toast._showFrame);
    messageSlot.textContent = "";
    toast.classList.remove("is-visible");
    toast._showFrame = requestAnimationFrame(() => {
      messageSlot.textContent = message;
      toast.classList.add("is-visible");
      toast._hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1500);
    });
  };

  let activeShareMenu = null;
  const closeShareMenu = (restoreFocus = false) => {
    if (!activeShareMenu) return;
    const {button, menu} = activeShareMenu;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    activeShareMenu = null;
    if (restoreFocus) button.focus({preventScroll: true});
  };
  const positionShareMenu = menu => {
    menu.classList.remove("opens-below");
    menu.style.setProperty("--share-menu-shift-x", "0px");
    if (menu.getBoundingClientRect().top < 12) menu.classList.add("opens-below");
    const rect = menu.getBoundingClientRect();
    const safeEdge = 12;
    const shift = rect.left < safeEdge
      ? safeEdge - rect.left
      : rect.right > window.innerWidth - safeEdge
        ? window.innerWidth - safeEdge - rect.right
        : 0;
    menu.style.setProperty("--share-menu-shift-x", `${Math.round(shift)}px`);
  };
  document.querySelectorAll("[data-share-native]").forEach((button, index) => {
    const wrap = button.closest(".share-native-wrap");
    if (!wrap) return;
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    const menu = document.createElement("div");
    menu.className = "share-menu";
    menu.id = `share-menu-${index + 1}`;
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    menu.innerHTML = `
      <a role="menuitem" href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" rel="noopener noreferrer">Facebook</a>
      <a role="menuitem" href="https://social-plugins.line.me/lineit/share?url=${pageUrl}" target="_blank" rel="noopener noreferrer">LINE</a>
      <a role="menuitem" href="https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener noreferrer">X</a>
      <a role="menuitem" href="mailto:?subject=${pageTitle}&body=${pageUrl}">${isEnglish ? "Email" : "電子郵件"}</a>
      <button type="button" role="menuitem" data-share-menu-copy>${isEnglish ? "Copy Link" : "複製連結"}</button>`;
    wrap.append(menu);
    button.setAttribute("aria-controls", menu.id);
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const openMenu = () => {
      closeShareMenu();
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      activeShareMenu = {button, menu};
      positionShareMenu(menu);
      items[0]?.focus({preventScroll: true});
    };
    button.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({title: document.title, url: window.location.href});
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }
      if (activeShareMenu?.menu === menu) closeShareMenu(true);
      else openMenu();
    });
    menu.addEventListener("keydown", event => {
      const current = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeShareMenu(true);
      } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const target = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[target]?.focus();
      }
    });
    menu.querySelector("[data-share-menu-copy]").addEventListener("click", async () => {
      const copied = await copyCurrentPage();
      closeShareMenu(true);
      showCopyToast(button, copied);
    });
    menu.querySelectorAll("a").forEach(item => item.addEventListener("click", () => closeShareMenu(true)));
  });
  document.addEventListener("pointerdown", event => {
    if (activeShareMenu && !activeShareMenu.menu.contains(event.target) && event.target !== activeShareMenu.button) closeShareMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeShareMenu) {
      event.preventDefault();
      closeShareMenu(true);
    }
  });
  window.addEventListener("resize", () => {
    if (activeShareMenu) positionShareMenu(activeShareMenu.menu);
  }, {passive: true});
})();

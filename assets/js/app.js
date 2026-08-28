(() => {
  const D = DAF_DATA;
  const C = DAF_COMPONENTS;
  const page = document.body.dataset.page;
  const isEnglish = C.getCurrentLanguage() === "en";
  const textFor = (item, field) => C.localizedText(item, field);
  const workCatalog = [...D.works, ...D.soundArtists.filter(work => work.title)];
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

  const workCards = works => works.map(work => `
    <a class="work-card" href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}">
      <div class="work-card-media">
        ${imageMarkup(coverImageFor(work, `${work.title} 作品圖片`), `${work.title} 作品圖片`)}
        <span class="work-card-number">${work.number}</span>
        <div class="work-card-overlay"><span>${[artistNamesForWork(work), work.medium].filter(Boolean).join("<br>")}</span></div>
      </div>
      <div class="work-label">${artistNamesForWork(work) ? `<span class="work-card-artist">${artistNamesForWork(work)}</span>` : ""}<strong class="work-card-title">${textFor(work, "title")}</strong></div>
    </a>`).join("");

  const creatorLinks = creator => [["website", "home", isEnglish ? "Website" : "官方網站"], ["instagram", "instagram", "Instagram"], ["facebook", "facebook", "Facebook"]]
    .map(([field, icon, label]) => creator[field] ? `<a href="${creator[field]}" target="_blank" rel="noopener noreferrer" aria-label="${textFor(creator, "name")} ${label}">${C.icon(icon, "")}</a>` : "")
    .join("");

  const featuredWorkCards = works => works.map(work => `
    <a class="home-featured-card" href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}">
      <div class="home-featured-card-media">${imageMarkup(coverImageFor(work, `${work.title} 作品圖片`), `${work.title} 作品圖片`)}</div>
      <div class="home-featured-card-body">
        <p class="home-featured-card-meta"><span class="work-no">${work.number}</span></p>
        <h3>${textFor(work, "title")}</h3>
        <p>${artistNamesForWork(work)}</p>
      </div>
    </a>
  `).join("");

  const featuredProgramCards = events => events.map(event => `
    <a class="home-featured-card" href="${C.localizedRoute(`event-detail.html?id=${event.id}`)}">
      <div class="home-featured-card-media">${imageMarkup(coverImageFor(event, `${event.title} 活動圖片`), `${event.title} 活動圖片`)}</div>
      <div class="home-featured-card-body">
        <p class="home-featured-card-meta">${isEnglish ? event.typeEn || event.type : event.type}</p>
        <h3>${textFor(event, "title")}</h3>
        <p>${event.date}</p>
      </div>
    </a>
  `).join("");

  const artistImageMarkup = (artist, {priority = false, thumbnail = false} = {}) => {
    if (!artist.image?.src) return C.placeholder("藝術家圖片待提供");
    const source = thumbnail ? `assets/images/artists/thumbs/${artist.id}.webp` : artist.image.src;
    return `<img src="${C.assetRoute(source)}" alt="${textFor(artist, "name")} 圖片" loading="${priority ? "eager" : "lazy"}" decoding="async" fetchpriority="${priority ? "high" : "low"}">`;
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
        ${artistImageMarkup(artist, {priority: index === defaultIndex, thumbnail: true})}
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
      document.querySelector("#breadcrumb").innerHTML = C.crumb("找不到此作品");
      document.title = "找不到此作品｜2026 臺北數位藝術節";
      return;
    }
    const currentIndex = foundIndex;
    const work = workCatalog[currentIndex];
    const previous = workCatalog[(currentIndex - 1 + workCatalog.length) % workCatalog.length];
    const next = workCatalog[(currentIndex + 1) % workCatalog.length];
    const creatorNames = artistNamesForWork(work);
    document.title = `${textFor(work, "title")}｜2026 臺北數位藝術節`;
    document.querySelector("#breadcrumb").innerHTML = C.crumb([{label: isEnglish ? "ARTISTS & WORKS" : "藝術家與作品", href: "works.html"}, {label: textFor(work, "title")}]);
    setDetailText("[data-work-number]", work.number ? `${isEnglish ? "WORK NO." : "作品編號"} ${work.number}` : "");
    setDetailText("[data-work-title]", textFor(work, "title"));
    setDetailText("[data-work-creator-names]", creatorNames);
    setDetailField("year", work.year, "work");
    setDetailField("workType", work.workType, "work");
    setDetailField("medium", work.medium, "work");
    setDetailField("location", workLocationName(work), "work");
    setDetailText("[data-work-description]", textFor(work, "description"));
    document.querySelector("[data-work-description-section]").hidden = !work.description;
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
    const artists = artistsForWork(work).filter(creator => textFor(creator, "name") || creator.bio);
    const primaryArtist = artists[0];
    const artistImageLabel = primaryArtist
      ? `${textFor(primaryArtist, "name")} ${isEnglish ? "artist portrait" : "藝術家照片"}`
      : (isEnglish ? "Artist image pending" : "藝術家圖片待提供");
    document.querySelector("[data-work-primary-media]").innerHTML = imageMarkup(
      normalizeImage(primaryArtist?.image, artistImageLabel),
      isEnglish ? "Artist image pending" : "藝術家圖片待提供",
      "detail-main"
    );
    const workLinks = document.querySelector("[data-work-links]");
    workLinks.innerHTML = work.videoUrl ? `<a href="${work.videoUrl}" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? "Open work video" : "開啟作品影片／影像連結"}">${C.icon("video", "")}<span>${isEnglish ? "VIDEO / MOVING IMAGE" : "作品影片／影像連結"}</span></a>` : "";
    workLinks.hidden = !work.videoUrl;
    document.querySelector("[data-work-artists]").innerHTML = artists.length
      ? artists.map(creator => `<article>${textFor(creator, "name") ? `<h3>${textFor(creator, "name")}</h3>` : ""}${creator.nationality ? `<p class="artist-nationality">${creator.nationality}</p>` : ""}${creator.bio ? `<p>${creator.bio}</p>` : ""}${creator.career ? `<section class="artist-career"><h4>${isEnglish ? "EXPERIENCE" : "經歷"}</h4><p>${creator.career}</p></section>` : ""}${creatorLinks(creator) ? `<div class="artist-links">${creatorLinks(creator)}</div>` : ""}</article>`).join("")
      : `<p class="data-pending">(待補)</p>`;
    const previousLink = document.querySelector("[data-work-previous]");
    const nextLink = document.querySelector("[data-work-next]");
    previousLink.href = C.localizedRoute(`work-detail.html?id=${previous.id}`);
    nextLink.href = C.localizedRoute(`work-detail.html?id=${next.id}`);
    setDetailText("[data-work-previous-title]", textFor(previous, "title"));
    setDetailText("[data-work-next-title]", textFor(next, "title"));
  };

  const renderEventDetail = () => {
    const event = D.events.find(item => String(item.id) === queryId());
    const article = document.querySelector("[data-event-detail]");
    const error = document.querySelector("[data-event-error]");
    if (!event) {
      article.remove();
      error.hidden = false;
      document.querySelector("#breadcrumb").innerHTML = C.crumb("找不到此活動");
      document.title = "找不到此活動｜2026 臺北數位藝術節";
      return;
    }
    const leader = event.speaker || event.instructor;
    const isOpeningPerformance = event.id === "opening-performance";
    article.classList.toggle("is-opening-performance", isOpeningPerformance);
    article.querySelector(".detail-meta")?.classList.toggle("opening-performance-information", isOpeningPerformance);
    document.title = `${textFor(event, "title")}｜2026 臺北數位藝術節`;
    document.querySelector("#breadcrumb").innerHTML = C.crumb([{label: isEnglish ? "PROGRAM" : "活動節目", href: "program.html"}, {label: textFor(event, "title")}]);
    setDetailText("[data-event-type]", [event.number, isEnglish ? event.typeEn || event.type : event.type].filter(Boolean).join("｜"));
    setDetailText("[data-event-title]", textFor(event, "title"));
    setDetailField("date", event.date, "event");
    setDetailField("time", event.time, "event");
    setDetailField("location", event.location, "event");
    const leaderRow = document.querySelector("[data-event-leader-row]");
    leaderRow.hidden = !leader;
    setDetailText("[data-event-leader-label]", event.type === "講座" ? "講者" : "帶領者");
    setDetailText("[data-event-leader]", leader);
    const registrationRow = document.querySelector("[data-event-registration-row]");
    registrationRow.hidden = !event.registration;
    setDetailText("[data-event-registration]", event.registration);
    setDetailText("[data-event-description]", textFor(event, "description"));
    document.querySelector("[data-event-description-section]").hidden = !event.description;
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
    const list = document.querySelector("#program-card-list");
    const filters = [...document.querySelectorAll("[data-program-filter]")];
    const locale = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh-Hant";
    const labels = {
      "zh-Hant": {
        overview: "節目總覽", schedule: "日程表", opening: "開幕表演",
        filterAll: "全部", filterTalks: "講座", filterWorkshops: "工作坊", filterTours: "導覽",
        date: "日期", performanceTime: "表演時間", performanceLocation: "表演地點",
        introduction: "介紹", performanceWorks: "演出作品", noEvents: "活動資料待提供", eventCountSuffix: "場活動",
        weekdays: ["日", "一", "二", "三", "四", "五", "六"]
      },
      en: {
        overview: "Program Overview", schedule: "Schedule", opening: "Opening Performance",
        filterAll: "All", filterTalks: "Talks", filterWorkshops: "Workshops", filterTours: "Tours",
        date: "Date", performanceTime: "Performance Time", performanceLocation: "Location",
        introduction: "Introduction", performanceWorks: "Works", noEvents: "Program information pending", eventCountSuffix: "events",
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
      const filtered = filter === "all" ? events : events.filter(event => event.type === filter);
      list.innerHTML = filtered.length ? filtered.map(event => {
        const index = events.indexOf(event) + 1;
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
    else selectedPanel.innerHTML = '<p class="data-pending">活動日期資料待提供</p>';

    const opening = events.find(event => event.featured && event.type === "表演") || events.find(event => event.id === "opening-performance");
    [["[data-opening-date]", opening?.date], ["[data-opening-time]", opening?.startTime || opening?.endTime ? programTime(opening) : opening?.time], ["[data-opening-location]", opening?.location], ["[data-opening-description]", opening?.description]].forEach(([selector, value]) => {
      const slot = document.querySelector(selector);
      if (!slot) return;
      slot.textContent = value || "";
      slot.closest("div")?.toggleAttribute("hidden", !value);
    });
    document.querySelector("#opening-work-grid").innerHTML = D.soundArtists.map(work => {
      const creatorNames = artistNamesForWork(work);
      const cover = coverImageFor(work, `${work.title || creatorNames || "演出"} 圖片`);
      const content = `<span class="opening-work-card-copy"><span class="work-no">${work.number}</span>${creatorNames ? `<strong>${creatorNames}</strong>` : ""}${work.title ? `<span>${work.title}</span>` : ""}${work.title ? `<i aria-hidden="true">&gt;</i>` : ""}</span>${cover ? `<span class="opening-work-card-media">${imageMarkup(cover, cover.alt)}</span>` : ""}`;
      return work.title
        ? `<a class="opening-work-card" href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}">${content}</a>`
        : `<article class="opening-work-card">${content}</article>`;
    }).join("");
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
    const items = [...accordion.querySelectorAll(".artist-accordion-item")];
    const hoverInput = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    const defaultIndex = Math.floor((items.length - 1) / 2);
    let activeIndex = -1;
    let observationFrame = 0;

    const setActive = index => {
      if (index < 0 || index >= items.length || index === activeIndex) return;
      const previousItem = items[activeIndex];
      const nextItem = items[index];
      previousItem?.classList.remove("is-active");
      nextItem.classList.add("is-active");
      activeIndex = index;
    };

    const activateNearestToObservation = () => {
      if (hoverInput.matches || !items.length) return;
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

    accordion.addEventListener("pointerover", event => {
      if (!hoverInput.matches) return;
      const item = event.target.closest(".artist-accordion-item");
      const previousItem = event.relatedTarget?.closest?.(".artist-accordion-item");
      if (item && accordion.contains(item) && item !== previousItem) setActive(Number(item.dataset.accordionIndex));
    });
    accordion.addEventListener("focusin", event => {
      const item = event.target.closest(".artist-accordion-item");
      if (item && accordion.contains(item)) setActive(Number(item.dataset.accordionIndex));
    });
    window.addEventListener("scroll", scheduleObservationCheck, {passive: true});
    siteResizeHandlers.add(scheduleObservationCheck);
    hoverInput.addEventListener("change", scheduleObservationCheck);

    setActive(defaultIndex);
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
    const hero = document.querySelector("#hero-observation");
    const titleStage = hero.querySelector(".hero-title-stage");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      titleStage.classList.add("is-mark-visible");
      return;
    }

    const titleElements = [...hero.querySelectorAll(".hero-scramble")];
    const messageGroup = hero.querySelector(".hero-system-messages");
    const messageLines = [...messageGroup.querySelectorAll("p")];
    const navigation = hero.querySelector(".hero-system-links");
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
      ]);
    }
    hero.classList.add("hero-sequence-running");

    const scrambleTitles = elements => new Promise(resolve => {
      const stageTimeline = [
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
        const characters = [...element.textContent];
        const slots = characters.map((character, index) => character === " " ? -1 : index).filter(index => index >= 0);
        const isEnglish = element.closest(".hero-title-language-en");
        element.setAttribute("aria-label", element.textContent);
        return {
          element,
          characters,
          slots,
          resolutionOrder: shuffle(slots),
          resolved: new Set(),
          glyphs: [...(isEnglish ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&+-/<>[]" : "灰色自動體未識別中▒▓█")]
        };
      });
      const ratioAt = elapsed => {
        const current = stageTimeline.find(stage => elapsed <= stage.end) || stageTimeline.at(-1);
        const progress = Math.min(1, Math.max(0, (elapsed - current.start) / (current.end - current.start)));
        return current.from + ((current.to - current.from) * progress);
      };
      const startedAt = performance.now();
      const tick = now => {
        const elapsed = Math.min(now - startedAt, stageTimeline.at(-1).end);
        const ratio = ratioAt(elapsed);
        const stageIndex = stageTimeline.findIndex(stage => elapsed <= stage.end);
        titleStage.dataset.decodeStage = String((stageIndex < 0 ? stageTimeline.length - 1 : stageIndex) + 1);
        states.forEach(state => {
          const target = Math.min(state.slots.length - 1, Math.max(1, Math.round(state.slots.length * ratio)));
          while (state.resolved.size < target) state.resolved.add(state.resolutionOrder[state.resolved.size]);
          state.element.textContent = state.characters.map((character, index) => {
            if (character === " " || state.resolved.has(index)) return character;
            const unresolvedGlyphs = state.glyphs.filter(glyph => glyph !== character);
            return unresolvedGlyphs[Math.floor(Math.random() * unresolvedGlyphs.length)];
          }).join("");
        });
        if (elapsed < stageTimeline.at(-1).end) window.setTimeout(() => requestAnimationFrame(tick), frame);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

    const typeLine = async (element, text) => {
      for (const character of [...text]) {
        element.textContent += character;
        await wait(/[\x00-\x7F]/.test(character) ? 36 : 58);
      }
    };

    await scrambleTitles(titleElements);
    titleStage.classList.add("is-final-transition");
    await wait(80);
    titleStage.classList.add("is-final-flicker");
    await wait(60);
    titleStage.classList.add("is-final-resolved");
    await wait(120);
    titleStage.classList.add("is-mark-visible");
    titleStage.classList.remove("is-final-transition", "is-final-flicker", "is-final-resolved");
    for (let index = 0; index < messageLines.length; index += 1) {
      await typeLine(messageLines[index], finalMessages[index]);
      if (index < messageLines.length - 1) await wait(transitions[index].delay);
    }
    await wait(230);
    navigation.classList.add("is-visible");
    await wait(540);
    scrollLink.classList.add("is-visible");
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
        pagination.innerHTML = Array.from({length: pageCount}, (_, index) => `<button type="button" aria-label="前往第 ${index + 1} 個精選區段"></button>`).join("");
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
  };

  const hydrateHome = () => {
    document.querySelector("#home-artist-accordion").innerHTML = artistAccordionItems(D.artists.filter(artist => textFor(artist, "name")));
    document.querySelector("#home-featured-works").innerHTML = featuredWorkCards(D.works.slice(0, 4));
    document.querySelector("#home-featured-programs").innerHTML = featuredProgramCards(D.events.slice(0, 4));
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
    initializeFeaturedPagination();
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
        return `<button class="marker" style="left:${location.x}%;top:${location.y}%" data-location-id="${location.id}" data-location-type="${location.type}" aria-label="${isEnglish ? "View" : "查看"} ${label}" aria-expanded="false"><span class="marker-symbol" aria-hidden="true"></span><span class="marker-number">${location.number}</span></button>`;
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
      map.querySelectorAll(".marker").forEach(marker => marker.addEventListener("click", () => {
        if (activeMarker === marker && activeCard === card && !card.hidden) {
          closeMarkerCard();
          return;
        }
        closeMarkerCard();
        const location = D.mapLocations.find(item => item.id === marker.dataset.locationId);
        const works = location.workIds.map(workById).filter(Boolean);
        const venue = venueById(location.venueId);
        activeMarker = marker;
        activeCard = card;
        activeUiLayer = uiLayer;
        marker.setAttribute("aria-expanded", "true");
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

    let returnFocus = null;
    let activeGalleryIndex = 0;
    let activeShop = null;
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
      return `<a class="shop-external-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? `Visit ${shop.nameEn} ${channel}` : `前往${shop.nameZh}${channel}`}">${C.icon(iconName, "")}</a>`;
    }).join("");

    const galleryMarkup = shop => {
      const images = Array.isArray(shop.images) ? shop.images : [];
      if (!images.length) return "";
      return `<div class="shop-gallery" data-shop-list-gallery data-gallery-index="0">
        <img src="${C.assetRoute(images[0])}" alt="${shop.nameZh} ${isEnglish ? "image" : "圖片"} 1">
        ${images.length > 1 ? `<button class="shop-gallery-arrow is-previous" type="button" data-shop-list-gallery-direction="-1" aria-label="${labels.previous}" data-shop-id="${shop.id}">‹</button><button class="shop-gallery-arrow is-next" type="button" data-shop-list-gallery-direction="1" aria-label="${labels.next}" data-shop-id="${shop.id}">›</button>` : ""}
        ${images.length > 1 ? `<div class="gallery-dots" aria-label="${isEnglish ? "Image pagination" : "圖片分頁"}">${images.map((_, index) => `<button type="button" data-shop-list-gallery-index="${index}" data-shop-id="${shop.id}" aria-label="${isEnglish ? `View image ${index + 1}` : `查看第 ${index + 1} 張圖片`}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("")}</div>` : ""}
      </div>`;
    };

    const listCard = shop => `<article class="shop-list-item">
      <div class="shop-list-content">
        <span class="shop-number">${shop.displayNumber}</span>
        <span class="shop-list-name"><strong>${shop.nameZh}</strong>${shop.nameEn ? `<span>${shop.nameEn}</span>` : ""}</span>
        ${shop.address ? `<p>${shop.address}</p>` : ""}
        ${shop.phone ? `<p>${shop.phone}</p>` : ""}
        ${storeStatusMarkup(shop, {source:shop.recordType === "partner" ? "shop" : "venue", className:"shop-list-status"})}
        ${galleryMarkup(shop)}
        <button class="button shop-detail-trigger" type="button" data-shop-id="${shop.id}" aria-haspopup="dialog">${labels.detail}</button>
      </div>
    </article>`;

    const partnerShops = D.shops.filter(shop => shop.id !== "shop-03").map((shop, index) => ({...shop, displayNumber: String(index + 1).padStart(2, "0"), recordType: "partner"}));
    const artVenues = D.venues.filter(venue => venue.type === "district").map(venue => ({...venue, recordType: "venue"}));
    const records = [...partnerShops, ...artVenues];
    lists.forEach(list => {
      const source = list.dataset.shopList === "venues" ? artVenues : partnerShops;
      list.innerHTML = source.map(listCard).join("");
    });

    const closeShopPanel = ({restoreFocus = true} = {}) => {
      closeDismissiblePanel({panel, layer, bodyClass: "shop-modal-open", hideLayer: true});
      activeShop = null;
      if (restoreFocus && returnFocus) returnFocus.focus();
      returnFocus = null;
    };

    const updateGallery = direction => {
      const images = activeShop?.images || [];
      if (!images.length) return;
      activeGalleryIndex = (activeGalleryIndex + direction + images.length) % images.length;
      const image = panel.querySelector("[data-shop-gallery-image]");
      const count = panel.querySelector("[data-shop-gallery-count]");
      image.src = C.assetRoute(images[activeGalleryIndex]);
      image.alt = `${activeShop.nameZh} ${isEnglish ? "image" : "圖片"} ${activeGalleryIndex + 1}`;
      count.textContent = `${activeGalleryIndex + 1} / ${images.length}`;
    };

    const openShopPanel = (shop, trigger) => {
      activeShop = shop;
      activeGalleryIndex = 0;
      returnFocus = trigger;
      const images = Array.isArray(shop.images) ? shop.images : [];
      panel.classList.toggle("has-gallery", images.length > 0);
      const gallery = images.length ? `
        <div class="shop-gallery">
          <img data-shop-gallery-image src="${C.assetRoute(images[0])}" alt="${shop.nameZh} ${isEnglish ? "image" : "圖片"} 1">
          ${images.length > 1 ? `<button class="shop-gallery-arrow is-previous" type="button" data-shop-gallery-direction="-1" aria-label="${labels.previous}">‹</button><button class="shop-gallery-arrow is-next" type="button" data-shop-gallery-direction="1" aria-label="${labels.next}">›</button>` : ""}
          <span class="shop-gallery-count" data-shop-gallery-count>1 / ${images.length}</span>
        </div>` : "";
      panel.innerHTML = `
        <div class="shop-detail-controls"><button class="marker-card-close" type="button" aria-label="${labels.close}">×</button></div>
        ${gallery}
        <div class="shop-detail-content">
          <p class="shop-number">${shop.displayNumber}</p>
          <h3 id="shop-detail-title">${shop.nameZh}</h3>
          ${shop.nameEn ? `<p class="shop-name-en">${shop.nameEn}</p>` : ""}
          <dl class="shop-meta">
            ${shop.address ? `<div><dt>${labels.address}</dt><dd>${shop.address}</dd></div>` : ""}
            ${shop.businessHours?.length ? `<div><dt>${labels.hours}</dt><dd>${shop.businessHours.map(line => `<span>${line}</span>`).join("")}</dd></div>` : ""}
            ${shop.phone ? `<div><dt>${labels.phone}</dt><dd>${shop.phone}</dd></div>` : ""}
          </dl>
          ${shop.description ? `<section class="shop-description"><h4>${labels.description}</h4>${shop.description.split("\n").map(paragraph => `<p>${paragraph}</p>`).join("")}</section>` : ""}
          ${linkMarkup(shop) ? `<div class="shop-links">${linkMarkup(shop)}</div>` : ""}
          ${shop.recordType === "venue" && shop.workIds?.length ? `<div class="shop-venue-works">${shop.workIds.map(id => workCatalog.find(work => String(work.id) === String(id))).filter(Boolean).map(work => `<a href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}"><span>${work.number}</span>${textFor(work, "title")}</a>`).join("")}</div>` : ""}
        </div>`;
      layer.hidden = false;
      panel.hidden = false;
      layer.classList.add("is-open");
      document.body.classList.add("shop-modal-open");
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
        image.alt = `${shop.nameZh} ${isEnglish ? "image" : "圖片"} ${nextIndex + 1}`;
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

  const breadcrumbLabels = isEnglish ? {about:"ABOUT", map:"MAP", works:"ARTISTS & WORKS", program:"PROGRAM", visit:"VISIT"} : {about:"關於", map:"探索地圖", works:"藝術家與作品", program:"活動節目", visit:"參觀"};
  if (breadcrumbLabels[page]) document.querySelector("#breadcrumb").innerHTML = C.crumb(breadcrumbLabels[page]);

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
  initializeSiteObservation();
  initializeSiteNetwork();

  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".mobile-menu-close");
  const navigation = document.querySelector(".header-nav");
  const submenuToggles = [...navigation.querySelectorAll(".nav-submenu-toggle")];
  const mobileMenuMedia = window.matchMedia("(max-width: 900px)");
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
    submenuToggles.forEach(button => {
      const item = button.closest(".nav-item");
      item.classList.remove("is-expanded");
      button.setAttribute("aria-expanded", "false");
      const label = item.querySelector(".nav-main-link").textContent.trim();
      button.setAttribute("aria-label", `展開${label}第二層選單`);
    });
    if (mobileMenuMedia.matches) navigation.setAttribute("aria-hidden", "true");
    else navigation.removeAttribute("aria-hidden");
    setPageInert(false);
    if (wasOpen && restoreFocus && menuReturnFocus) menuReturnFocus.focus();
  };

  const openMobileMenu = () => {
    if (!mobileMenuMedia.matches) return;
    menuReturnFocus = document.activeElement;
    navigation.classList.add("open");
    document.body.classList.add("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    navigation.setAttribute("aria-hidden", "false");
    setPageInert(true);
    menuClose.focus();
  };

  menuToggle.addEventListener("click", () => navigation.classList.contains("open") ? closeMobileMenu() : openMobileMenu());
  menuClose.addEventListener("click", () => closeMobileMenu());
  submenuToggles.forEach(button => button.addEventListener("click", () => {
    if (!mobileMenuMedia.matches) return;
    const item = button.closest(".nav-item");
    const expanded = !item.classList.contains("is-expanded");
    item.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    const label = item.querySelector(".nav-main-link").textContent.trim();
    button.setAttribute("aria-label", `${expanded ? "收合" : "展開"}${label}第二層選單`);
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
    const focusable = [...navigation.querySelectorAll("a, button")].filter(element => !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const resetMobileMenuForBreakpoint = () => {
    if (navigation.contains(document.activeElement)) document.activeElement.blur();
    closeMobileMenu({restoreFocus: false});
  };
  mobileMenuMedia.addEventListener("change", resetMobileMenuForBreakpoint);
  resetMobileMenuForBreakpoint();

  document.querySelectorAll(".copy-link").forEach(button => button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      button.setAttribute("aria-label", "連結已複製");
    } catch (_) {
      // Clipboard may require a secure context; the visual control remains available.
    }
  }));
})();

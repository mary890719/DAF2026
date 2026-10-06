window.DAF_COMPONENTS = (() => {
  const getCurrentLanguage = () => document.documentElement.lang.toLowerCase().startsWith("en") || /(^|\/)en(\/|$)/.test(location.pathname) ? "en" : "zh-Hant";
  const isExternal = value => /^(?:[a-z]+:|\/\/|#)/i.test(value || "");
  const isTestMap = () => /(^|\/)test_MAP(\/|$)/i.test(location.pathname);
  const isWordPress = () => Boolean(window.DAF_WP?.themeUri && window.DAF_WP?.homeUrl);
  const assetRoute = path => {
    if (!path || isExternal(path) || path.startsWith("../")) return path;
    if (isWordPress()) return `${window.DAF_WP.themeUri.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    return `${getCurrentLanguage() === "en" || isTestMap() ? "../" : ""}${path}`;
  };
  const localizedRoute = (route, targetLanguage = getCurrentLanguage()) => {
    if (!route || isExternal(route)) return route;
    const normalized = route.replace(/^\.\.\//, "").replace(/^en\//, "");
    if (isWordPress()) {
      const match = normalized.match(/^([^?#]*)([?#].*)?$/);
      const path = match?.[1] || "index.html";
      const suffix = match?.[2] || "";
      const slug = path === "index.html" ? "" : path.replace(/\.html$/, "").replace(/^\/+|\/+$/g, "");
      const base = window.DAF_WP.homeUrl.replace(/\/$/, "");
      const languagePrefix = targetLanguage === "en" ? "/en" : "";
      return `${base}${languagePrefix}${slug ? `/${slug}` : ""}/${suffix}`;
    }
    if (targetLanguage === getCurrentLanguage()) return normalized;
    if (isTestMap()) return targetLanguage === "en" ? `../en/${normalized}` : normalized;
    return targetLanguage === "en" ? `en/${normalized}` : `../${normalized}`;
  };
  const localizedText = (item, field) => getCurrentLanguage() === "en" && item?.[`${field}En`] ? item[`${field}En`] : item?.[field] || "";
  const languageSwitchRoute = () => {
    if (isWordPress()) {
      const segments = location.pathname.split("/").filter(Boolean);
      const language = getCurrentLanguage();
      const pageSegments = language === "en" && segments[0] === "en" ? segments.slice(1) : segments;
      const slug = pageSegments.join("/");
      const base = window.DAF_WP.homeUrl.replace(/\/$/, "");
      const targetPath = language === "en"
        ? (slug ? `/${slug}/` : "/")
        : `/en${slug ? `/${slug}` : ""}/`;
      return `${base}${targetPath}${location.search}${location.hash}`;
    }
    const filename = location.pathname.split("/").filter(Boolean).pop() || "index.html";
    const page = filename.endsWith(".html") ? filename : "index.html";
    return localizedRoute(`${page}${location.search}${location.hash}`, getCurrentLanguage() === "en" ? "zh-Hant" : "en");
  };
  const navZh = [
    {id: "home", label: "首頁", url: "index.html"},
    {id: "about", label: "關於", parentOnly: true, children: [
      ["關於臺北數位藝術節", "about.html"], ["策展論述", "curatorial.html"],
      ["單位介紹", "partners.html"]
    ]},
    {id: "map", label: "探索地圖", parentOnly: true, children: [
      ["臺北典藏植物園", "map.html"], ["藝術入店", "district-map.html"],
      ["合作店家", "shops.html"]
    ]},
    {id: "works", label: "作品介紹", parentOnly: true, children: [
      ["臺北典藏植物園", "works.html"],
      ["藝術入店", "district-works.html"]
    ]},
    {id: "program", label: "活動節目", url: "program.html"}
  ];
  const navEn = [
    {id:"home",label:"HOME",url:"index.html"},
    {id:"about",label:"ABOUT",parentOnly:true,children:[["ABOUT TAIPEI DIGITAL ART FESTIVAL","about.html"],["CURATORIAL STATEMENT","curatorial.html"],["EXECUTION AND PARTNERS","partners.html"]]},
    {id:"map",label:"MAP",parentOnly:true,children:[["TAIPEI COLLECTIBLE BOTANICAL GARDEN","map.html"],["ART IN STORES","district-map.html"],["PARTNER STORES","shops.html"]]},
    {id:"works",label:"WORKS",parentOnly:true,children:[["TAIPEI COLLECTIBLE BOTANICAL GARDEN","works.html"],["ART IN STORES","district-works.html"]]},
    {id:"program",label:"PROGRAM",url:"program.html"}
  ];
  const ui = () => getCurrentLanguage() === "en"
    ? {nav:navEn,home:"HOME",language:"中文",mainNav:"Main navigation",backToTop:"Back to top",expand:"Expand ",collapse:"Collapse ",submenu:" submenu",openNav:"Open main navigation",closeNav:"Close main navigation"}
    : {nav:navZh,home:"首頁",language:"EN",mainNav:"主要導覽",backToTop:"回到頁面頂端",expand:"展開",collapse:"收合",submenu:"第二層選單",openNav:"開啟主要導覽",closeNav:"關閉主要導覽"};
  function header(active) {
    const key = active === "work-detail" || active === "district-works" ? "works" : active === "event-detail" ? "program" : ["curatorial", "partners"].includes(active) ? "about" : ["district-map", "shops"].includes(active) ? "map" : active;
    const currentHash = location.hash;
    const navigation = ui().nav.map(item => {
      const active = key === item.id;
      const submenuId = `submenu-${item.id}`;
      const childData = child => Array.isArray(child) ? {label: child[0], url: child[1]} : child;
      const hasCurrentHash = child => {
        const data = childData(child);
        return Boolean(currentHash && (data.url?.endsWith(currentHash) || data.children?.some(hasCurrentHash)));
      };
      const renderChildren = (children, id, nested = false) => `<ul class="nav-submenu${nested ? " nav-submenu-nested" : ""}" id="${id}">${children.map((child, index) => {
        const data = childData(child);
        const [childPath, childHash] = (data.url || "").split("#");
        const currentPage = location.pathname.split("/").filter(Boolean).pop() || "index.html";
        const currentChild = isWordPress() ? childPath.replace(/\.html$/, "") : childPath;
        const current = active && currentChild === currentPage && (!childHash || !currentHash || `#${childHash}` === currentHash);
        const branchActive = active && hasCurrentHash(data);
        const childId = `${id}-${index}`;
        return `<li class="nav-submenu-item${data.children ? " has-children" : ""}${branchActive ? " is-expanded" : ""}"${data.children ? ' data-submenu-container' : ""}><div class="nav-submenu-row"><a class="nav-submenu-link${current ? " active" : ""}" href="${localizedRoute(data.url)}"${current ? ' aria-current="location"' : ""}>${data.label}</a>${data.children ? `<button class="nav-submenu-toggle nav-nested-toggle" type="button" data-submenu-label="${data.label}" aria-expanded="${branchActive ? "true" : "false"}" aria-controls="${childId}" aria-label="${branchActive ? ui().collapse : ui().expand}${data.label}${ui().submenu}"><span aria-hidden="true">＋</span></button>` : ""}</div>${data.children ? renderChildren(data.children, childId, true) : ""}</li>`;
      }).join("")}</ul>`;
      const activeChild = active && item.children?.some(hasCurrentHash);
      const submenu = item.children ? renderChildren(item.children, submenuId) : "";
      const primary = item.parentOnly
        ? `<button class="nav-main-link nav-parent-trigger${active ? " active" : ""}" type="button" data-submenu-label="${item.label}" aria-expanded="${activeChild ? "true" : "false"}" aria-controls="${submenuId}" aria-label="${activeChild ? ui().collapse : ui().expand}${item.label}${ui().submenu}">${item.label}</button>`
        : `<a href="${localizedRoute(item.url)}" class="nav-main-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
      return `<div class="nav-item${item.children ? " has-submenu" : ""}${activeChild ? " is-expanded" : ""}"${item.children ? ' data-submenu-container' : ""}><div class="nav-primary-row">${primary}${item.children && !item.parentOnly ? `<button class="nav-submenu-toggle" type="button" data-submenu-label="${item.label}" aria-expanded="${activeChild ? "true" : "false"}" aria-controls="${submenuId}" aria-label="${activeChild ? ui().collapse : ui().expand}${item.label}${ui().submenu}"><span aria-hidden="true">＋</span></button>` : ""}</div>${submenu}</div>`;
    }).join("");
    const brandLogo = `<img class="site-logo-image" src="${assetRoute("assets/images/logos/DAF26LOGO.svg")}" alt="${getCurrentLanguage() === "en" ? "2026 Taipei Digital Art Festival — Gray Autonomous Entity" : "2026 臺北數位藝術節－灰色自動體 Gray Autonomous Entity"}">`;
    return `<header class="site-header"><a class="logo" href="${localizedRoute("index.html")}">${brandLogo}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="${ui().openNav}" data-open-label="${ui().openNav}" data-close-label="${ui().closeNav}"><img src="${assetRoute("assets/icons/menu.svg")}" data-menu-icon data-open-icon="${assetRoute("assets/icons/menu.svg")}" data-close-icon="${assetRoute("assets/icons/x.svg")}" alt="" aria-hidden="true"></button><nav class="header-nav" id="main-nav" aria-label="${ui().mainNav}"><div class="mobile-menu-header"><a class="logo mobile-menu-logo" href="${localizedRoute("index.html")}">${brandLogo}</a><div class="mobile-menu-tools"><a class="language-switch" href="${languageSwitchRoute()}" hreflang="${getCurrentLanguage() === "en" ? "zh-Hant" : "en"}">${ui().language}</a></div></div><div class="header-nav-links">${navigation}</div></nav><div class="header-tools"><a class="language-switch" href="${languageSwitchRoute()}" hreflang="${getCurrentLanguage() === "en" ? "zh-Hant" : "en"}">${ui().language}</a></div></header>`;
  }
  function footer() {
    const social = DAF_DATA.social;
    const organizationTypeLabels = {
      "主辦單位": {zh: "主辦單位", en: "Organizer"},
      "協辦單位": {zh: "執行單位", en: "Executive Organizer"},
      "場地合作": {zh: "場地合作", en: "Venue Partner"},
      "合作單位": {zh: "合作單位", en: "Partners"},
      "贊助": {zh: "贊助", en: "Sponsors"},
      "多媒體設備贊助": {zh: "多媒體設備贊助", en: "Supporting Partner"}
    };
    const socialLinks = `<div class="footer-social"><a href="${social.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icon("instagram", "")}</a><a href="${social.facebook.url}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${icon("facebook", "")}</a></div>`;
    const organizationGroup = org => {
      const labels = organizationTypeLabels[org.type] || {zh: org.type, en: org.type};
      const heading = getCurrentLanguage() === "en" ? labels.en : labels.zh;
      return `<section class="org-group ${org.sponsor?"sponsor":""}"><strong>${heading}</strong><div class="org-logos">${org.names.map((name,index)=>{const displayName=getCurrentLanguage() === "en" ? (org.namesEn?.[index] || name) : name;const image=`<img src="${assetRoute(org.images[index])}" alt="${displayName}">`;const url=org.urls?.[index];const surface=org.surfaces?.[index]==="light"?" org-logo-light":"";const linkLabel=getCurrentLanguage() === "en" ? `Visit the official website of ${displayName} (opens in a new tab)` : `前往${displayName}官方網站（另開新分頁）`;return `<div class="org-logo${surface}">${url?`<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${linkLabel}">${image}</a>`:image}</div>`;}).join("")}</div></section>`;
    };
    const organizationRows = `<div class="container org-grid"><div class="org-row org-row-primary">${DAF_DATA.organizations.slice(0, 3).map(organizationGroup).join("")}</div><div class="org-row org-row-secondary">${DAF_DATA.organizations.slice(3).map(organizationGroup).join("")}</div></div>`;
    const organizationLabel = getCurrentLanguage() === "en" ? "Festival organizations" : "藝術節單位資訊";
    return `<section class="site-organizations" aria-label="${organizationLabel}">${organizationRows}</section><footer class="site-footer"><div class="container site-footer-inner"><div class="footer-info"><p class="copyright">© 2026 臺北數位藝術節 Taipei Digital Art Festival. All Rights Reserved.</p></div>${socialLinks}</div></footer>`;
  }
  const placeholder = (label="圖片 Placeholder", cls="") => `<div class="placeholder ${cls}"><span>${label}</span></div>`;
  const icon = (name, label, cls="") => `<img class="icon ${cls}" src="${assetRoute(`assets/icons/${name}.svg`)}" alt="${label}"${label ? "" : ' aria-hidden="true"'}>`;
  const crumb = (items) => {
    const trail = [{label: ui().home, href: "index.html"}, ...(Array.isArray(items) ? items : [{label: items}])];
    return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${trail.map((item, index) => {
      const current = index === trail.length - 1;
      return `<li>${current ? `<span aria-current="page">${item.label}</span>` : item.href ? `<a href="${localizedRoute(item.href)}">${item.label}</a>` : `<span>${item.label}</span>`}</li>`;
    }).join("")}</ol></nav>`;
  };
  const button = (label, href="index.html") => `<a class="button" href="${localizedRoute(href)}">${label}</a>`;
  const siteBackground = () => `<canvas class="site-network-canvas" id="site-network-canvas" aria-hidden="true"></canvas><div class="site-observation-light" aria-hidden="true"></div>`;
  const backToTop = () => `<button class="back-to-top" type="button" aria-label="${ui().backToTop}"><img class="icon" src="${assetRoute("assets/icons/chevron-up.svg")}" alt="" aria-hidden="true"><span aria-hidden="true">TOP</span></button>`;
  const taipeiTime = now => {
    const date = now instanceof Date ? now : new Date(now ?? Date.now());
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit",
      weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date).reduce((values, part) => ({...values, [part.type]: part.value}), {});
    const day = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6}[parts.weekday];
    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    return Number.isInteger(day) && Number.isFinite(hour) && Number.isFinite(minute)
      ? {day, date: `${parts.year}-${parts.month}-${parts.day}`, minutes: hour * 60 + minute}
      : null;
  };
  const timeToMinutes = value => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value || "");
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return hour >= 0 && hour <= 24 && minute >= 0 && minute < 60 && (hour < 24 || minute === 0)
      ? hour * 60 + minute
      : null;
  };
  const normalizedPeriods = periods => {
    if (!Array.isArray(periods)) return null;
    const normalized = periods.map(period => ({...period, openMinutes: timeToMinutes(period?.open), closeMinutes: timeToMinutes(period?.close)}));
    return normalized.every(period => period.openMinutes != null && period.closeMinutes != null)
      ? normalized.sort((a, b) => a.openMinutes - b.openMinutes)
      : null;
  };
  const previousDate = value => {
    const date = new Date(`${value}T00:00:00+08:00`);
    date.setUTCDate(date.getUTCDate() - 1);
    return new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Taipei", year:"numeric", month:"2-digit", day:"2-digit"}).format(date);
  };
  const getStoreOpenStatus = (store, now = new Date()) => {
    const schedule = store?.businessHoursSchedule;
    const current = taipeiTime(now);
    if (!schedule || !current) return {status:"unknown", label:"unknown", nextTime:null};

    const previousDay = (current.day + 6) % 7;
    const previousDateKey = previousDate(current.date);
    const previousWasSpecial = Object.prototype.hasOwnProperty.call(store.specialHours || {}, previousDateKey);
    const previousRawPeriods = previousWasSpecial
      ? store.specialHours[previousDateKey]
      : schedule[previousDay];
    const previousPeriods = normalizedPeriods(previousRawPeriods);
    if (previousPeriods === null && previousRawPeriods != null) return {status:"unknown", label:"unknown", nextTime:null};
    const overnight = previousPeriods?.find(period => period.closeMinutes <= period.openMinutes && current.minutes < period.closeMinutes);
    if (overnight) return {status:"open", label:"open", nextTime:overnight.close};

    const rawPeriods = Object.prototype.hasOwnProperty.call(store.specialHours || {}, current.date)
      ? store.specialHours[current.date]
      : schedule[current.day];
    if (rawPeriods == null || (Array.isArray(rawPeriods) && rawPeriods.length === 0)) return {status:"day_off", label:"day_off", nextTime:null};
    const periods = normalizedPeriods(rawPeriods);
    if (!periods) return {status:"unknown", label:"unknown", nextTime:null};
    for (const period of periods) {
      const closesNextDay = period.closeMinutes <= period.openMinutes;
      if (current.minutes >= period.openMinutes && (closesNextDay || current.minutes < period.closeMinutes)) {
        return {status:"open", label:"open", nextTime:period.close};
      }
      if (current.minutes < period.openMinutes) {
        const specialOvernightEnded = previousWasSpecial && previousPeriods?.some(previous => previous.closeMinutes <= previous.openMinutes && current.minutes >= previous.closeMinutes);
        return specialOvernightEnded
          ? {status:"closed", label:"closed", nextTime:null}
          : {status:"before_open", label:"before_open", nextTime:period.open};
      }
    }
    return {status:"closed", label:"closed", nextTime:null};
  };
  const storeOpenStatusText = (result, {language = getCurrentLanguage(), compact = false} = {}) => {
    if (language === "en") {
      return result.status === "open" ? compact ? "Open" : `Open · Until ${result.nextTime}`
        : result.status === "before_open" ? compact ? "Not open yet" : `Opens at ${result.nextTime}`
        : result.status === "day_off" ? "Closed today"
        : result.status === "closed" ? "Closed" : "Hours unavailable";
    }
    return result.status === "open" ? compact ? "營業中" : `營業中 · ${result.nextTime} 結束營業`
      : result.status === "before_open" ? compact ? "尚未營業" : `尚未營業 · ${result.nextTime} 開始營業`
      : result.status === "day_off" ? "今日公休"
      : result.status === "closed" ? "已打烊" : "營業時間未提供";
  };
  return {header, footer, placeholder, icon, crumb, button, siteBackground, backToTop, getCurrentLanguage, localizedRoute, localizedText, assetRoute, languageSwitchRoute, getStoreOpenStatus, storeOpenStatusText};
})();

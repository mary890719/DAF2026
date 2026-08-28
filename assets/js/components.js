window.DAF_COMPONENTS = (() => {
  const getCurrentLanguage = () => document.documentElement.lang.toLowerCase().startsWith("en") || /(^|\/)en(\/|$)/.test(location.pathname) ? "en" : "zh-Hant";
  const isExternal = value => /^(?:[a-z]+:|\/\/|#)/i.test(value || "");
  const assetRoute = path => !path || isExternal(path) || path.startsWith("../") ? path : `${getCurrentLanguage() === "en" ? "../" : ""}${path}`;
  const localizedRoute = (route, targetLanguage = getCurrentLanguage()) => {
    if (!route || isExternal(route)) return route;
    const normalized = route.replace(/^\.\.\//, "").replace(/^en\//, "");
    if (targetLanguage === getCurrentLanguage()) return normalized;
    return targetLanguage === "en" ? `en/${normalized}` : `../${normalized}`;
  };
  const localizedText = (item, field) => getCurrentLanguage() === "en" && item?.[`${field}En`] ? item[`${field}En`] : item?.[field] || "";
  const languageSwitchRoute = () => {
    const filename = location.pathname.split("/").filter(Boolean).pop() || "index.html";
    const page = filename.endsWith(".html") ? filename : "index.html";
    return localizedRoute(`${page}${location.search}${location.hash}`, getCurrentLanguage() === "en" ? "zh-Hant" : "en");
  };
  const navZh = [
    {id: "home", label: "首頁", url: "index.html"},
    {id: "about", label: "關於", url: "about.html", children: [
      ["關於台北數位藝術節", "about.html#festival"], ["年度策展主題", "about.html#theme"],
      ["策展人", "about.html#curators"], ["執行單位", "about.html#organizations"],
      ["合作單位", "about.html#partners"], ["贊助單位", "about.html#sponsors"]
    ]},
    {id: "map", label: "探索地圖", url: "map.html", children: [
      ["主展場", "map.html#garden-map"], ["街區地圖", "map.html#district-map"],
      ["合作店家", "map.html#partner-stores"]
    ]},
    {id: "works", label: "藝術家與作品", url: "works.html", children: [
      ["主展場", "works.html#garden"], ["街區", "works.html#district"]
    ]},
    {id: "program", label: "活動節目", url: "program.html", children: [
      ["節目總覽", "program.html#program-overview"], ["日程表", "program.html#schedule"],
      ["開幕表演", "program.html#opening-performance"]
    ]},
    {id: "visit", label: "參觀", url: "visit.html", children: [
      ["展覽時間", "visit.html#visit-hours"], ["展覽地點", "visit.html#visit-location"],
      ["交通方式", "visit.html#transportation"], ["場館地圖", "visit.html#venue-map"],
      ["無障礙資訊", "visit.html#accessibility"]
    ]}
  ];
  const navEn = [
    {id:"home",label:"HOME",url:"index.html"},
    {id:"about",label:"ABOUT",url:"about.html",children:[["ABOUT THE FESTIVAL","about.html#festival"],["ANNUAL THEME","about.html#theme"],["CURATORS","about.html#curators"],["ORGANIZERS","about.html#organizations"],["PARTNERS","about.html#partners"],["SPONSORS","about.html#sponsors"]]},
    {id:"map",label:"MAP",url:"map.html",children:[["BOTANICAL GARDEN","map.html#garden-map"],["DISTRICT MAP","map.html#district-map"],["PARTNER STORES","map.html#partner-stores"]]},
    {id:"works",label:"ARTISTS &amp; WORKS",url:"works.html",children:[["BOTANICAL GARDEN","works.html#garden"],["DISTRICT","works.html#district"]]},
    {id:"program",label:"PROGRAM",url:"program.html",children:[["PROGRAM OVERVIEW","program.html#program-overview"],["SCHEDULE","program.html#schedule"],["OPENING PERFORMANCE","program.html#opening-performance"]]},
    {id:"visit",label:"VISIT",url:"visit.html",children:[["OPENING HOURS","visit.html#visit-hours"],["VENUE","visit.html#visit-location"],["TRANSPORTATION","visit.html#transportation"],["VENUE MAP","visit.html#venue-map"],["ACCESSIBILITY","visit.html#accessibility"]]}
  ];
  const ui = () => getCurrentLanguage() === "en"
    ? {nav:navEn,home:"HOME",language:"中文",mainNav:"Main navigation",backToTop:"Back to top",expand:"Expand ",collapse:"Collapse ",submenu:" submenu",closeNav:"Close main navigation"}
    : {nav:navZh,home:"首頁",language:"EN",mainNav:"主要導覽",backToTop:"回到頁面頂端",expand:"展開",collapse:"收合",submenu:"第二層選單",closeNav:"關閉主要導覽"};
  function header(active) {
    const key = active === "work-detail" ? "works" : active === "event-detail" ? "program" : active;
    const currentHash = location.hash;
    const navigation = ui().nav.map(item => {
      const active = key === item.id;
      const submenuId = `submenu-${item.id}`;
      const activeChild = active && item.children?.some(([, url]) => currentHash && url.endsWith(currentHash));
      const submenu = item.children ? `<ul class="nav-submenu" id="${submenuId}">${item.children.map(([label, url]) => {
        const current = active && currentHash && url.endsWith(currentHash);
        return `<li><a class="nav-submenu-link${current ? " active" : ""}" href="${url}"${current ? ' aria-current="location"' : ""}>${label}</a></li>`;
      }).join("")}</ul>` : "";
      return `<div class="nav-item${item.children ? " has-submenu" : ""}${activeChild ? " is-expanded" : ""}"><div class="nav-primary-row"><a href="${item.url}" class="nav-main-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>${item.label}</a>${item.children ? `<button class="nav-submenu-toggle" type="button" aria-expanded="${activeChild ? "true" : "false"}" aria-controls="${submenuId}" aria-label="${activeChild ? ui().collapse : ui().expand}${item.label}${ui().submenu}"><span aria-hidden="true">＋</span></button>` : ""}</div>${submenu}</div>`;
    }).join("");
    const brandLogo = `<img class="site-logo-image" src="${assetRoute("assets/images/logos/DAF26LOGO_menu.png")}" alt="2026 臺北數位藝術節－灰色自動體 Gray Autonomous Entity">`;
    return `<header class="site-header"><a class="logo" href="${localizedRoute("index.html")}">${brandLogo}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">MENU</button><nav class="header-nav" id="main-nav" aria-label="${ui().mainNav}"><div class="mobile-menu-header"><a class="logo mobile-menu-logo" href="${localizedRoute("index.html")}">${brandLogo}</a><div class="mobile-menu-tools"><a class="language-switch" href="${languageSwitchRoute()}" hreflang="${getCurrentLanguage() === "en" ? "zh-Hant" : "en"}">${ui().language}</a><button class="mobile-menu-close" type="button" aria-label="${ui().closeNav}">CLOSE</button></div></div><div class="header-nav-links">${navigation}</div></nav><div class="header-tools"><a class="language-switch" href="${languageSwitchRoute()}" hreflang="${getCurrentLanguage() === "en" ? "zh-Hant" : "en"}">${ui().language}</a><span aria-label="Search">${icon("magnifying", "")}</span></div></header>`;
  }
  function footer() {
    const social = DAF_DATA.social;
    const socialLinks = `<div class="container footer-social"><a href="${social.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icon("instagram", "")}</a><a href="${social.facebook.url}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${icon("facebook", "")}</a></div>`;
    const organizationGroup = org => `<section class="org-group ${org.sponsor?"sponsor":""}"><strong>${org.type}</strong><div class="org-logos">${org.names.map((name,index)=>{const image=`<img src="${assetRoute(org.images[index])}" alt="${name}">`;const url=org.urls?.[index];const surface=org.surfaces?.[index]==="light"?" org-logo-light":"";return `<div class="org-logo${surface}">${url?`<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="前往${name}官方網站（另開新分頁）">${image}</a>`:image}</div>`;}).join("")}</div></section>`;
    const organizationRows = `<div class="container org-grid"><div class="org-row org-row-primary">${DAF_DATA.organizations.slice(0, 3).map(organizationGroup).join("")}</div><div class="org-row org-row-secondary">${DAF_DATA.organizations.slice(3).map(organizationGroup).join("")}</div></div>`;
    return `<footer class="site-footer">${organizationRows}${socialLinks}<p class="copyright">© 2026 臺北數位藝術節 Taipei Digital Art Festival. All Rights Reserved.</p></footer>`;
  }
  const placeholder = (label="圖片 Placeholder", cls="") => `<div class="placeholder ${cls}"><span>${label}</span></div>`;
  const icon = (name, label, cls="") => `<img class="icon ${cls}" src="${assetRoute(`assets/icons/${name}.svg`)}" alt="${label}"${label ? "" : ' aria-hidden="true"'}>`;
  const crumb = (items) => {
    const trail = [{label: ui().home, href: "index.html"}, ...(Array.isArray(items) ? items : [{label: items}])];
    return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${trail.map((item, index) => {
      const current = index === trail.length - 1;
      return `<li>${current ? `<span aria-current="page">${item.label}</span>` : `<a href="${item.href}">${item.label}</a>`}</li>`;
    }).join("")}</ol></nav>`;
  };
  const button = (label, href="index.html") => `<a class="button" href="${href}">${label}</a>`;
  const siteBackground = () => `<canvas class="site-network-canvas" id="site-network-canvas" aria-hidden="true"></canvas><div class="site-observation-light" aria-hidden="true"></div>`;
  const backToTop = () => `<button class="back-to-top" type="button" aria-label="${ui().backToTop}"><img class="icon" src="${assetRoute("assets/icons/chevron-up.svg")}" alt="" aria-hidden="true"><span aria-hidden="true">TOP</span></button>`;
  const taipeiTime = now => {
    const date = now instanceof Date ? now : new Date(now ?? Date.now());
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date).reduce((values, part) => ({...values, [part.type]: part.value}), {});
    const day = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6}[parts.weekday];
    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    return Number.isInteger(day) && Number.isFinite(hour) && Number.isFinite(minute)
      ? {day, minutes: hour * 60 + minute}
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
  const getStoreOpenStatus = (store, now = new Date()) => {
    const schedule = store?.businessHoursSchedule;
    const current = taipeiTime(now);
    if (!schedule || !current) return {status:"unknown", label:"unknown", nextTime:null};

    const previousPeriods = normalizedPeriods(schedule[(current.day + 6) % 7]);
    if (previousPeriods === null && schedule[(current.day + 6) % 7] != null) return {status:"unknown", label:"unknown", nextTime:null};
    const overnight = previousPeriods?.find(period => period.closeMinutes <= period.openMinutes && current.minutes < period.closeMinutes);
    if (overnight) return {status:"open", label:"open", nextTime:overnight.close};

    const rawPeriods = schedule[current.day];
    if (rawPeriods == null || (Array.isArray(rawPeriods) && rawPeriods.length === 0)) return {status:"day_off", label:"day_off", nextTime:null};
    const periods = normalizedPeriods(rawPeriods);
    if (!periods) return {status:"unknown", label:"unknown", nextTime:null};
    for (const period of periods) {
      const closesNextDay = period.closeMinutes <= period.openMinutes;
      if (current.minutes >= period.openMinutes && (closesNextDay || current.minutes < period.closeMinutes)) {
        return {status:"open", label:"open", nextTime:period.close};
      }
      if (current.minutes < period.openMinutes) return {status:"before_open", label:"before_open", nextTime:period.open};
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

window.DAF_COMPONENTS = (() => {
  const nav = [
    {id: "home", label: "首頁", url: "index.html"},
    {id: "about", label: "關於", url: "about.html", children: [
      ["關於台北數位藝術節", "about.html#festival"], ["年度策展主題", "about.html#theme"],
      ["策展人", "about.html#curators"], ["執行單位", "about.html#organizations"],
      ["合作單位", "about.html#partners"], ["贊助單位", "about.html#sponsors"]
    ]},
    {id: "map", label: "探索地圖", url: "map.html", children: [
      ["臺北典藏植物園", "map.html#garden-map"], ["街區地圖", "map.html#district-map"],
      ["合作店家", "map.html#partner-stores"]
    ]},
    {id: "works", label: "藝術家與作品", url: "works.html", children: [
      ["臺北典藏植物園", "works.html#garden"], ["街區", "works.html#district"], ["表演", "works.html#performance"]
    ]},
    {id: "program", label: "活動節目", url: "program.html", children: [
      ["節目總覽", "program.html#program-overview"], ["日程表", "program.html#schedule"],
      ["講座", "program.html#talks"], ["工作坊", "program.html#workshops"],
      ["表演", "program.html#performances"], ["導覽", "program.html#tours"]
    ]},
    {id: "visit", label: "參觀", url: "visit.html", children: [
      ["展覽時間", "visit.html#visit-hours"], ["展覽地點", "visit.html#visit-location"],
      ["交通方式", "visit.html#transportation"], ["場館地圖", "visit.html#venue-map"],
      ["無障礙資訊", "visit.html#accessibility"]
    ]}
  ];
  function header(active) {
    const key = active === "work-detail" ? "works" : active === "event-detail" ? "program" : active;
    const social = DAF_DATA.social;
    const currentHash = location.hash;
    const navigation = nav.map(item => {
      const active = key === item.id;
      const submenuId = `submenu-${item.id}`;
      const activeChild = active && item.children?.some(([, url]) => currentHash && url.endsWith(currentHash));
      const submenu = item.children ? `<ul class="nav-submenu" id="${submenuId}">${item.children.map(([label, url]) => {
        const current = active && currentHash && url.endsWith(currentHash);
        return `<li><a class="nav-submenu-link${current ? " active" : ""}" href="${url}"${current ? ' aria-current="location"' : ""}>${label}</a></li>`;
      }).join("")}</ul>` : "";
      return `<div class="nav-item${item.children ? " has-submenu" : ""}${activeChild ? " is-expanded" : ""}"><div class="nav-primary-row"><a href="${item.url}" class="nav-main-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>${item.label}</a>${item.children ? `<button class="nav-submenu-toggle" type="button" aria-expanded="${activeChild ? "true" : "false"}" aria-controls="${submenuId}" aria-label="${activeChild ? "收合" : "展開"}${item.label}第二層選單"><span aria-hidden="true">＋</span></button>` : ""}</div>${submenu}</div>`;
    }).join("");
    return `<header class="site-header"><a class="logo" href="index.html"><span>LOGO</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">MENU</button><nav class="header-nav" id="main-nav" aria-label="主要導覽"><div class="mobile-menu-header"><a class="logo mobile-menu-logo" href="index.html"><span>LOGO</span></a><button class="mobile-menu-close" type="button" aria-label="關閉主要導覽">CLOSE</button></div><div class="header-nav-links">${navigation}</div></nav><div class="header-tools"><span>EN</span><a href="${social.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Instagram（另開新分頁）">${icon("instagram", "")}</a><a href="${social.facebook.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Facebook（另開新分頁）">${icon("facebook", "")}</a><span aria-label="Search">${icon("magnifying", "")}</span></div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="container org-grid">${DAF_DATA.organizations.map(org => `<section class="org-group ${org.sponsor?"sponsor":""}"><strong>${org.type}</strong><div class="org-logos">${org.names.map((name,index)=>{const image=`<img src="${org.images[index]}" alt="${name} Logo">`;const url=org.urls?.[index];return `<div class="org-logo">${url?`<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="前往${name}官方網站（另開新分頁）">${image}</a>`:image}</div>`;}).join("")}</div></section>`).join("")}</div><p class="copyright">© 2026 臺北數位藝術節 Taipei Digital Art Festival. All Rights Reserved.</p></footer>`;
  }
  const placeholder = (label="圖片 Placeholder", cls="") => `<div class="placeholder ${cls}"><span>${label}</span></div>`;
  const icon = (name, label, cls="") => `<img class="icon ${cls}" src="assets/icons/${name}.svg" alt="${label}"${label ? "" : ' aria-hidden="true"'}>`;
  const crumb = (items) => {
    const trail = [{label: "首頁", href: "index.html"}, ...(Array.isArray(items) ? items : [{label: items}])];
    return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${trail.map((item, index) => {
      const current = index === trail.length - 1;
      return `<li>${current ? `<span aria-current="page">${item.label}</span>` : `<a href="${item.href}">${item.label}</a>`}</li>`;
    }).join("")}</ol></nav>`;
  };
  const button = (label, href="index.html") => `<a class="button" href="${href}">${label}</a>`;
  const siteBackground = () => `<canvas class="site-network-canvas" id="site-network-canvas" aria-hidden="true"></canvas><div class="site-observation-light" aria-hidden="true"></div>`;
  const backToTop = () => `<button class="back-to-top" type="button" aria-label="回到頁面頂端"><img class="icon" src="assets/icons/chevron-up.svg" alt="" aria-hidden="true"><span aria-hidden="true">TOP</span></button>`;
  return {header, footer, placeholder, icon, crumb, button, siteBackground, backToTop};
})();

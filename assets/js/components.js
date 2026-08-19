window.DAF_COMPONENTS = (() => {
  const nav = [
    ["home","首頁","index.html"],["about","關於","about.html"],["map","探索地圖","map.html"],
    ["works","藝術家與作品","works.html"],["program","活動節目","program.html"],["visit","參觀","visit.html"]
  ];
  function header(active) {
    const key = active === "work-detail" ? "works" : active === "event-detail" ? "program" : active;
    const social = DAF_DATA.social;
    return `<header class="site-header"><a class="logo" href="index.html"><span>LOGO</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">MENU</button><nav class="header-nav" id="main-nav" aria-label="主要導覽"><div class="mobile-menu-header"><a class="logo mobile-menu-logo" href="index.html"><span>LOGO</span></a><button class="mobile-menu-close" type="button" aria-label="關閉主要導覽">CLOSE</button></div><div class="header-nav-links">${nav.map(([id,label,url]) => `<a href="${url}" class="${key===id?"active":""}" ${key===id?'aria-current="page"':''}>${label}</a>`).join("")}</div></nav><div class="header-tools"><span>EN</span><a href="${social.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Instagram（另開新分頁）">${icon("instagram", "")}</a><a href="${social.facebook.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Facebook（另開新分頁）">${icon("facebook", "")}</a><span aria-label="Search">${icon("magnifying", "")}</span></div></header>`;
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

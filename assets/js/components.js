window.DAF_COMPONENTS = (() => {
  const nav = [
    ["home","首頁","index.html"],["about","關於","about.html"],["map","探索地圖","map.html"],
    ["works","展覽資訊","works.html"],["timeline","活動時程","timeline.html"],["transport","交通資訊","transport.html"]
  ];
  function header(active) {
    const key = active === "work-detail" ? "works" : active === "event-detail" ? "timeline" : active;
    const social = DAF_DATA.social;
    return `<header class="site-header"><a class="logo" href="index.html"><span>LOGO</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">MENU</button><nav class="header-nav" id="main-nav" aria-label="主要導覽">${nav.map(([id,label,url]) => `<a href="${url}" class="${key===id?"active":""}" ${key===id?'aria-current="page"':''}>${label}</a>`).join("")}</nav><div class="header-tools"><span>EN</span><a href="${social.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Instagram（另開新分頁）">${icon("instagram", "")}</a><a href="${social.facebook.url}" target="_blank" rel="noopener noreferrer" aria-label="前往臺北數位藝術節官方 Facebook（另開新分頁）">${icon("facebook", "")}</a><span aria-label="Search">${icon("magnifying", "")}</span></div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="container org-grid">${DAF_DATA.organizations.map(org => `<section class="org-group ${org.sponsor?"sponsor":""}"><strong>${org.type}</strong><div class="org-logos">${org.names.map(name=>`<div class="placeholder org-logo"><span>LOGO<br><small>${name}</small></span></div>`).join("")}</div></section>`).join("")}</div><p class="copyright">© 2026 臺北數位藝術節 Taipei Digital Art Festival. All Rights Reserved.</p></footer>`;
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
  return {header, footer, placeholder, icon, crumb, button};
})();

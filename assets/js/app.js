(() => {
  const D = DAF_DATA, C = DAF_COMPONENTS, root = document.querySelector("#app"), page = document.body.dataset.page;
  const workCatalog = [...D.works, ...D.soundArtists];
  const queryId = () => Math.max(1, Number(new URLSearchParams(location.search).get("id")) || 1);
  const newsRows = (limit) => D.news.slice(0, limit).map(n => `<a class="news-row" href="news-detail.html?id=${n.id}"><time>${n.date}</time><span>${n.title}</span><b>&gt;</b></a>`).join("");
  const workCards = works => works.map(w => `<a class="work-card" href="work-detail.html?id=${w.id}">${C.placeholder(w.images?.[0]?.alt || "作品圖片","")}<div class="work-label"><span class="work-no">${w.number}</span>${w.title}<span class="work-card-meta">${[w.creators?.map(creator => creator.name).join("／"), w.medium].filter(Boolean).join("・")}</span></div></a>`).join("");
  const workFacts = work => [
    ["創作年份", work.year], ["使用媒材", work.medium], ["作品尺寸", work.dimensions],
    ["展出地點", work.location], ["作品介紹", work.description]
  ].filter(([, value]) => value).map(([label, value]) => `<dt class="${label === "展出地點" ? "location-label" : ""}">${label === "展出地點" ? C.icon("location", "") : ""}${label}</dt><dd>${value}</dd>`).join("");
  const externalLinkAttrs = `target="_blank" rel="noopener noreferrer"`;
  const facebookPluginUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(D.social.facebook.url)}&tabs=timeline&width=328&height=430&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
  const pages = {
    home: () => `<main><section class="hero"><div class="hero-media"><img src="${D.assets.hero}" alt="2026 臺北數位藝術節主視覺"></div><div class="hero-ui"><a class="hero-scroll" href="#intro">SCROLL</a></div></section><section class="section" id="intro"><div class="container home-intro"><p>2026臺北數位藝術節以「灰色自動體」（GRAY AUTONOMOUS ENTITY）為主題，關注數位藝術如何在人工智慧的快速發展中，重新思考那些難以清楚認識、持續發展且無可迴避的新型態能動性、環境關係和藝術議題。</p><p>當人工智慧作為一種新的存在者（ENTITY），成為影響藝術家的日常經驗乃至創作時，數位藝術應如何回應這種不同於工具、媒介所構成的存在？</p><nav class="quick-links" aria-label="首頁主要入口"><a href="about.html">關於展覽 →</a><a href="map.html">探索地圖 →</a><a href="transport.html">交通資訊 →</a><a href="timeline.html">活動時程 →</a></nav></div></section><section class="section"><div class="container"><h2 class="section-title">最新消息</h2><div class="news-list">${newsRows(5)}</div><div class="back-wrap">${C.button("查看全部 →","news.html")}</div></div></section><section class="section"><div class="container"><h2 class="section-title">社群</h2><div class="social-grid"><article class="social-box"><header class="social-card-header">${C.icon("instagram", "")}<strong>${D.social.instagram.label}</strong></header><div class="social-embed social-embed-instagram" aria-label="Instagram 官方內容嵌入預留區"><div class="social-fallback"><strong>${D.social.instagram.handle}</strong><a class="button" href="${D.social.instagram.url}" ${externalLinkAttrs} aria-label="前往臺北數位藝術節官方 Instagram（另開新分頁）">前往 Instagram</a></div></div></article><article class="social-box"><header class="social-card-header">${C.icon("facebook", "")}<strong>${D.social.facebook.label}</strong></header><div class="social-embed social-embed-facebook"><iframe src="${facebookPluginUrl}" title="臺北數位藝術節 Facebook 官方粉絲專頁" width="500" height="430" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe></div><div class="social-fallback social-fallback-inline"><strong>${D.social.facebook.name}</strong><a class="button" href="${D.social.facebook.url}" ${externalLinkAttrs} aria-label="前往臺北數位藝術節官方 Facebook（另開新分頁）">前往 Facebook</a></div></article></div></div></section></main>`,
    about: () => `<main class="container">${C.crumb("關於")}<h1 class="page-title">關於數位藝術節</h1><article class="about-copy"><p>在人工智慧和資訊技術迅速發展的當代，浮現出一種尚未被完全指認的存在形式，它在資訊海洋中運作，在大的資料流和演算法間生成出未曾見的樣態，並悄然嵌合進我們所處的世界。</p><p>2026臺北數位藝術節以「灰色自動體」（Gray Autonomous Entity）為主題，關注數位藝術如何在人工智慧的快速發展中，重新思考那些難以清楚認識、持續發展且無可迴避的新型態能動性、環境關係和藝術議題。</p><p>當人工智慧作為一種新的存在者（entity），成為影響藝術家的日常經驗乃至創作時，數位藝術應如何回應這種不同於工具、媒介所構成的存在？</p><p>它產生出另人感到既熟悉又陌生的經驗：熟悉，是因為它調用了人類共同累積的資料與記憶；陌生，則來自於自動性的湧現。</p><p>當資料經由編碼被壓縮進入模型，轉換為高維向量空間，影像、語言、聲音彼此建立新的鄰近關係，系統也在龐大的運算過程中形成自身的生成能力。每一次生成，都重新組織集體經驗；然而，模型承載著資料、記憶、文化，當中卻也存有權力結構、偏見與倫理問題。</p><p>如同植物、土壤、菌絲、動物、人類、機器一般，它如今也成為構成環境的一部分，與各種有機生命和非人行動者共同形成複雜的網絡，並成為當中的一個節點，重新定義生命、技術和環境間的關係。</p><p>這也成為當代數位藝術不得不面對課題：當藝術涉及資料的取樣、模型訓練與潛空間的運作和生成演算法，它是否仍然以人為中心？藝術世界又該如何面對？另外，有關藝術中的作者性、創造力、原創性與藝術形式等長久以來的概念，也因而重新被探討。</p><p>透過生成影像、機器學習、互動裝置和人機系統，關注那些重新思考資訊、生態、生命與非人存在的藝術實踐，並試圖描繪一個由人類、人工智慧與各種生命共同構成的新生態，便是2026台北數位藝術節「灰色自動體」的聚焦所在。</p></article><div class="back-wrap">${C.button("< 返回首頁")}</div></main>`,
    works: () => `<main class="container">${C.crumb("展覽資訊")}<h1 class="section-title">參展作品</h1><div class="works-grid">${workCards(D.works)}</div><section class="section"><h2 class="section-title">聲響藝術家</h2><div class="works-grid">${workCards(D.soundArtists)}</div></section></main>`,
    "work-detail": () => { const currentIndex=Math.max(0,workCatalog.findIndex(item=>item.id===queryId())), w=workCatalog[currentIndex], prev=workCatalog[(currentIndex-1+workCatalog.length)%workCatalog.length], next=workCatalog[(currentIndex+1)%workCatalog.length]; return `<main class="container">${C.crumb([{label:"展覽資訊",href:"works.html"},{label:`${w.number} ${w.title}`}])}<article class="detail-shell"><section class="detail-left"><h1 class="detail-title">${w.number}　${w.title}</h1><dl>${workFacts(w)}</dl><div class="gallery">${(w.images || []).map(image => C.placeholder(image.alt)).join("")}</div></section><section>${C.placeholder(w.images?.[0]?.alt || "主要圖片", "detail-main")}<div class="artist-copy">${(w.creators || []).filter(creator => creator.name || creator.bio).map(creator=>`${creator.name ? `<h2>${creator.name}</h2>` : ""}${creator.bio ? `<p>${creator.bio}</p>` : ""}`).join("")}</div></section><div class="share"><span>分享至</span><a href="#" aria-label="分享到 Instagram">${C.icon("instagram", "")}</a><a href="#" aria-label="分享到 Facebook">${C.icon("facebook", "")}</a><button class="copy-link" type="button" aria-label="複製作品連結">${C.icon("link", "")}</button></div><nav class="pager"><a href="work-detail.html?id=${prev.id}">←　上一件作品<br>${prev.title}</a><a href="work-detail.html?id=${next.id}">下一件作品　→<br>${next.title}</a></nav></article></main>`; },
    timeline: () => `<main class="container">${C.crumb("展覽時程")}<h1 class="page-title">展覽時程</h1><div class="timeline">${D.events.map(e=>`<article class="event-row"><strong>${e.label}</strong><span>${e.detail}</span></article>`).join("")}</div></main>`,
    news: () => `<main class="container">${C.crumb("最新消息")}<h1 class="page-title">最新消息</h1><div class="news-list">${newsRows()}</div><div class="back-wrap">${C.button("< 返回首頁")}</div></main>`,
    "news-detail": () => { const n=D.news[(queryId()-1)%D.news.length], prev=n.id===1?D.news.length:n.id-1, next=n.id===D.news.length?1:n.id+1; return `<main class="container">${C.crumb([{label:"最新消息",href:"news.html"},{label:n.title}])}<article class="article"><h1>${n.title}</h1><p class="article-date">${n.date}</p><div class="article-body"><p>${n.body}</p><p>${n.body}</p></div><div class="news-gallery">${Array(4).fill(C.placeholder()).join("")}</div><div class="share"><span>分享至</span><a href="#" aria-label="分享到 Instagram">${C.icon("instagram", "")}</a><a href="#" aria-label="分享到 Facebook">${C.icon("facebook", "")}</a><button class="copy-link" type="button" aria-label="複製消息連結">${C.icon("link", "")}</button></div><nav class="pager"><a href="news-detail.html?id=${prev}">←　上一篇<br>${D.news[prev-1].title}</a><a href="news-detail.html?id=${next}">下一篇　→<br>${D.news[next-1].title}</a></nav></article></main>`; },
    transport: () => `<main class="container">${C.crumb("交通資訊")}<h1 class="page-title">交通資訊</h1><div class="transport-grid"><div class="placeholder transport-map"><span>Google Maps Placeholder</span></div><div><h2>捷運轉乘</h2><p>捷運淡水線圓山站轉乘公車，或於捷運文湖線大直站轉乘公車前往。</p><h2>公車</h2><p>可搭乘 285、665、市民小巴9、紅34、紅50、72、222、527、542 等路線，於植物園周邊站點下車。</p><h2>其他交通方式</h2><p>自行車及步行路線資訊待定；現場停車空間有限，建議搭乘大眾運輸。</p></div></div><div class="back-wrap">${C.button("< 返回首頁")}</div></main>`,
    map: () => `<main class="container">${C.crumb("探索地圖")}<h1 class="page-title">探索地圖</h1><div class="map-shell" id="map"><div class="map-base-layer"><img class="map-base" src="assets/images/map/botanical-garden-map.png" alt="臺北植物園展區暫定地圖"></div><div class="map-overlay-layer">${D.mapMarkers.map(marker=>{const w=D.works.find(work=>work.id===marker.workId);return `<button class="marker" style="left:${marker.x}%;top:${marker.y}%" data-id="${w.id}" aria-label="查看 ${w.title}">${C.icon("location", "")}<span>${w.number}</span></button>`}).join("")}</div><div class="map-ui-layer"><article class="marker-card" id="marker-card" hidden></article></div></div><div class="map-work-list"><strong>作品一覽</strong>${D.mapMarkers.map(marker=>{const w=D.works.find(work=>work.id===marker.workId);return `<div>${w.number}. ${w.title}</div>`}).join("")}</div><div class="back-wrap">${C.button("詳細資訊 >","works.html")}</div></main>`
  };
  document.querySelector("#site-header").innerHTML = C.header(page);
  root.innerHTML = (pages[page] || pages.home)();
  document.querySelector("#site-footer").innerHTML = C.footer();
  document.querySelector(".menu-toggle").addEventListener("click", e => { const nav=document.querySelector(".header-nav"), open=nav.classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded",open); });
  if(page === "map") {
    const map = document.querySelector("#map"), card = document.querySelector("#marker-card"), uiLayer = document.querySelector(".map-ui-layer");
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
      const mapRect = map.getBoundingClientRect(), markerRect = activeMarker.getBoundingClientRect();
      const markerX = markerRect.left + markerRect.width / 2 - mapRect.left;
      const markerBottom = markerRect.bottom - mapRect.top;
      const isLeft = markerX < mapRect.width / 2;
      card.classList.add(isLeft ? "arrow-left" : "arrow-right");
      const cardWidth = card.offsetWidth, cardHeight = card.offsetHeight, edge = 12, arrowInset = 30;
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
      const w=D.works[Number(marker.dataset.id)-1];
      activeMarker = marker;
      document.querySelectorAll(".marker[aria-expanded='true']").forEach(item => item.setAttribute("aria-expanded", "false"));
      marker.setAttribute("aria-expanded", "true");
      card.innerHTML=`<button class="marker-card-close" type="button" aria-label="關閉作品資訊卡">×</button>${C.placeholder()}<strong><span class="work-no">${w.number}</span>${w.title}</strong><p>${w.creators.map(c=>c.name).join("／")}<br>${w.medium}</p><p class="marker-card-description">${w.description}</p>${C.button("作品詳細資訊 >",`work-detail.html?id=${w.id}`)}`;
      card.hidden=false;
      uiLayer.classList.add("is-open");
      card.querySelector(".marker-card-close").addEventListener("click", closeMarkerCard);
      requestAnimationFrame(syncMapCardMode);
    }));
    uiLayer.addEventListener("click", event => { if (event.target === uiLayer) closeMarkerCard(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !card.hidden) closeMarkerCard(); });
    window.addEventListener("resize", syncMapCardMode);
  }
  document.querySelectorAll(".copy-link").forEach(button => button.addEventListener("click", async () => { try { await navigator.clipboard.writeText(location.href); button.setAttribute("aria-label", "連結已複製"); } catch (_) { /* Clipboard may require a secure context; visual control remains available. */ } }));
})();

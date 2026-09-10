(() => {
  "use strict";

  if (document.body.dataset.page !== "map") return;

  const D = window.DAF_DATA;
  const C = window.DAF_COMPONENTS;
  const isEnglish = C.getCurrentLanguage() === "en";
  const debugMode = new URLSearchParams(location.search).get("perception") === "debug";
  const states = Object.freeze({IDLE:"IDLE", CAMERA_READY:"CAMERA_READY", SEARCHING:"SEARCHING", MATCHING:"MATCHING", IDENTIFIED:"IDENTIFIED", LOST:"LOST", ERROR:"ERROR"});
  const targetMap = window.DAF_PERCEPTION_TARGETS || [];
  const lostGraceMs = 1200;

  const view = document.querySelector("[data-perception-view]");
  const mapView = document.querySelector("[data-map-view]");
  const video = view?.querySelector("[data-perception-camera]");
  const intro = view?.querySelector("[data-perception-intro]");
  const runtime = view?.querySelector("[data-perception-runtime]");
  const stateLabel = view?.querySelector("[data-perception-state]");
  const entity = view?.querySelector("[data-perception-entity]");
  const errorBox = view?.querySelector("[data-perception-error]");
  const debugPanel = view?.querySelector("[data-perception-debug]");
  if (!view || !mapView || !video) return;

  let state = states.IDLE;
  let stream = null;
  let tracker = null;
  let lostTimer = 0;
  let activeWorkId = "";
  let currentLocation = null;

  const labels = isEnglish ? {
    startError:"The camera could not start.", denied:"Camera access was denied. You can return to MAP and try again later.",
    unsupported:"This browser does not support camera access.", insecure:"Camera access requires an HTTPS secure context.",
    unavailable:"No available camera was found.", enter:"ENTER →", artist:"ARTIST", year:"YEAR", medium:"MEDIUM"
  } : {
    startError:"無法啟動相機。", denied:"相機權限已被拒絕。你可以返回地圖，稍後再試。",
    unsupported:"此瀏覽器不支援相機存取。", insecure:"相機需要透過 HTTPS 安全連線使用。",
    unavailable:"找不到可用的相機。", enter:"進入作品 →", artist:"藝術家", year:"年份", medium:"媒材"
  };

  // Tracking 層只輸出網站理解的作品事件；UI 不依賴 MindAR 或其他辨識器 API。
  class ArtworkTracker {
    constructor(adapter = null) {
      this.adapter = adapter;
      this.listeners = {potential: new Set(), identified: new Set(), lost: new Set()};
    }
    onPotentialMatch(callback) { this.listeners.potential.add(callback); return () => this.listeners.potential.delete(callback); }
    onIdentified(callback) { this.listeners.identified.add(callback); return () => this.listeners.identified.delete(callback); }
    onLost(callback) { this.listeners.lost.add(callback); return () => this.listeners.lost.delete(callback); }
    emit(type, payload = {}) { this.listeners[type]?.forEach(callback => callback(payload)); }
    async start() { if (this.adapter?.start) await this.adapter.start(this); }
    async stop() {
      if (this.adapter?.stop) await this.adapter.stop();
      Object.values(this.listeners).forEach(listeners => listeners.clear());
    }
  }

  const workFor = workId => D.works.find(work => String(work.id) === String(workId));
  const artistFor = work => (work?.artistIds || []).map(id => D.artists.find(artist => artist.id === id)).filter(Boolean).map(artist => C.localizedText(artist, "name")).join("／");
  const numberFor = work => work?.number || work?.mapNumber || String(work?.id || "").replace(/^.*-/, "").padStart(2, "0");

  const setState = (nextState, payload = {}) => {
    if (!Object.values(states).includes(nextState)) return;
    state = nextState;
    view.dataset.perceptionState = state;
    stateLabel.textContent = state === states.IDENTIFIED && payload.workId ? `ENTITY ${numberFor(workFor(payload.workId))}` : state;
    errorBox.hidden = state !== states.ERROR;
    entity.hidden = state !== states.IDENTIFIED && state !== states.LOST;
  };

  const renderEntity = (workId, side = "left") => {
    const work = workFor(workId);
    if (!work) return showError(labels.startError);
    const number = numberFor(work);
    const title = C.localizedText(work, "title");
    entity.classList.toggle("is-left", side === "right");
    entity.classList.toggle("is-right", side !== "right");
    entity.innerHTML = `<p>ENTITY ${number}</p><h2>${title}</h2><dl>
      <div><dt>${labels.artist}</dt><dd>${artistFor(work) || "—"}</dd></div>
      ${work.year ? `<div><dt>${labels.year}</dt><dd>${work.year}</dd></div>` : ""}
      ${work.medium ? `<div><dt>${labels.medium}</dt><dd>${work.medium}</dd></div>` : ""}
    </dl><a class="button" href="${C.localizedRoute(`work-detail.html?id=${work.id}`)}">${labels.enter}</a>`;
    activeWorkId = work.id;
    // 為下一階段室內路線預留；目前只存在記憶體，不顯示、不傳送。
    currentLocation = {type:"artwork", workId:work.id};
    setState(states.IDENTIFIED, {workId:work.id});
  };

  const bindTracker = activeTracker => {
    activeTracker.onPotentialMatch(({workId}) => {
      clearTimeout(lostTimer);
      if (workFor(workId)) setState(states.MATCHING);
    });
    activeTracker.onIdentified(({workId, side = "left"}) => {
      clearTimeout(lostTimer);
      renderEntity(workId, side);
    });
    activeTracker.onLost(() => {
      if (state !== states.IDENTIFIED && state !== states.MATCHING) return;
      clearTimeout(lostTimer);
      setState(states.LOST);
      // 短暫保留 Entity，避免手持晃動造成資訊卡閃爍。
      lostTimer = window.setTimeout(() => {
        activeWorkId = "";
        entity.hidden = true;
        setState(states.SEARCHING);
      }, lostGraceMs);
    });
  };

  const showError = message => {
    errorBox.innerHTML = `<p>${message}</p>`;
    setState(states.ERROR);
  };

  const cameraErrorMessage = error => {
    if (!window.isSecureContext) return labels.insecure;
    if (error?.name === "NotAllowedError" || error?.name === "SecurityError") return labels.denied;
    if (error?.name === "NotFoundError" || error?.name === "OverconstrainedError") return labels.unavailable;
    return labels.startError;
  };

  const startPerception = async () => {
    intro.hidden = true;
    runtime.hidden = false;
    if (debugMode) {
      tracker = new ArtworkTracker();
      bindTracker(tracker);
      setState(states.SEARCHING);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return showError(labels.unsupported);
    if (!window.isSecureContext) return showError(labels.insecure);
    try {
      // 權限只在使用者按下開始後請求；後鏡頭優先，且不要求麥克風。
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}, audio:false});
      video.srcObject = stream;
      await video.play();
      setState(states.CAMERA_READY);
      tracker = new ArtworkTracker();
      bindTracker(tracker);
      await tracker.start();
      setState(states.SEARCHING);
    } catch (error) {
      stopPerception({showIntro:false});
      runtime.hidden = false;
      showError(cameraErrorMessage(error));
    }
  };

  // cleanup 集中停止 tracking、listener、timer 與每一條 Camera track。
  const stopPerception = ({showIntro = true} = {}) => {
    clearTimeout(lostTimer);
    lostTimer = 0;
    tracker?.stop();
    tracker = null;
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    activeWorkId = "";
    currentLocation = null;
    entity.hidden = true;
    errorBox.hidden = true;
    runtime.hidden = showIntro;
    intro.hidden = !showIntro;
    setState(states.IDLE);
  };

  const setMode = mode => {
    const perceptionActive = mode === "perception";
    if (!perceptionActive) stopPerception();
    view.hidden = !perceptionActive;
    mapView.hidden = perceptionActive;
    document.body.classList.toggle("perception-active", perceptionActive);
    document.querySelectorAll("[data-perception-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.perceptionMode === mode)));
  };

  // Debug mode 不開相機，直接由 adapter 同規格事件驗證所有 UI state。
  const buildDebugControls = () => {
    if (!debugMode) return;
    const workIds = targetMap.map(target => target.workId).filter(workFor).slice(0, 2);
    const controls = [states.IDLE, states.SEARCHING, states.MATCHING, ...workIds.map(id => `ENTITY ${numberFor(workFor(id))}`), states.LOST, states.ERROR];
    debugPanel.hidden = false;
    debugPanel.innerHTML = controls.map(label => `<button type="button" data-debug-state="${label}">${label}</button>`).join("");
    debugPanel.addEventListener("click", event => {
      const label = event.target.closest("[data-debug-state]")?.dataset.debugState;
      if (!label) return;
      if (label.startsWith("ENTITY")) {
        const index = controls.filter(item => item.startsWith("ENTITY")).indexOf(label);
        tracker?.emit("identified", {workId:workIds[index], side:index % 2 ? "right" : "left"});
      } else if (label === states.MATCHING) tracker?.emit("potential", {workId:workIds[0]});
      else if (label === states.LOST) tracker?.emit("lost", {workId:activeWorkId});
      else if (label === states.ERROR) showError(debugMode ? "DEBUG ERROR" : labels.startError);
      else setState(label);
    });
    setMode("perception");
    startPerception();
  };

  document.querySelectorAll("[data-perception-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.perceptionMode)));
  view.querySelector("[data-perception-start]").addEventListener("click", startPerception);
  view.querySelector("[data-perception-return]").addEventListener("click", () => setMode("map"));
  document.addEventListener("visibilitychange", () => { if (document.hidden && !view.hidden) stopPerception(); });
  window.addEventListener("pagehide", () => stopPerception(), {once:true});
  buildDebugControls();

  // 提供唯讀狀態給未來模組串接，不暴露可任意改寫的內部 state。
  window.DAF_PERCEPTION = {states, getState:() => state, getCurrentLocation:() => currentLocation ? {...currentLocation} : null, ArtworkTracker};
})();

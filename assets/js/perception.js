(() => {
  "use strict";

  if (document.body.dataset.page !== "map") return;
  const D = window.DAF_DATA;
  const C = window.DAF_COMPONENTS;
  const config = window.DAF_PERCEPTION_CONFIG || {};
  if (!D || !C) return;

  const isEnglish = C.getCurrentLanguage() === "en";
  const debugMode = new URLSearchParams(location.search).get("perception") === "debug";
  const states = Object.freeze({IDLE:"IDLE", CAMERA_READY:"CAMERA_READY", SEARCHING:"SEARCHING", MATCHING:"MATCHING", IDENTIFIED:"IDENTIFIED", LOST:"LOST", ERROR:"ERROR"});
  const targetMap = window.DAF_PERCEPTION_TARGETS || [];
  const lostGraceMs = Number(config.lostGraceMs) > 0 ? Number(config.lostGraceMs) : 1200;
  const view = document.querySelector("[data-perception-view]");
  const mapView = document.querySelector("[data-map-view]");
  const trackingStage = view && view.querySelector("[data-perception-tracking-stage]");
  const intro = view && view.querySelector("[data-perception-intro]");
  const runtime = view && view.querySelector("[data-perception-runtime]");
  const stateLabel = view && view.querySelector("[data-perception-state]");
  const entity = view && view.querySelector("[data-perception-entity]");
  const errorBox = view && view.querySelector("[data-perception-error]");
  const debugPanel = view && view.querySelector("[data-perception-debug]");
  const startButton = view && view.querySelector("[data-perception-start]");
  if (!view || !mapView || !trackingStage || !intro || !runtime || !stateLabel || !entity || !errorBox || !debugPanel || !startButton) return;

  let state = states.IDLE;
  let tracker = null;
  let debugAdapter = null;
  let mindarAdapter = null;
  let lostTimer = 0;
  let activeWorkId = "";
  let currentLocation = null;
  let sessionId = 0;
  let startPromise = null;

  const labels = isEnglish ? {
    startError:"The camera could not start.", denied:"Camera access was denied. Return to MAP to continue without the camera.",
    unsupported:"This browser does not support camera access.", insecure:"Camera access requires an HTTPS secure context.",
    unavailable:"No available camera was found.", interrupted:"The camera session ended.", enter:"ENTER →",
    artist:"ARTIST", year:"YEAR", medium:"MEDIUM", start:"START PERCEPTION", starting:"STARTING…"
  } : {
    startError:"無法啟動相機。", denied:"相機權限已被拒絕。返回地圖後仍可繼續瀏覽。",
    unsupported:"此瀏覽器不支援相機存取。", insecure:"相機需要透過 HTTPS 安全連線使用。",
    unavailable:"找不到可用的相機。", interrupted:"相機工作階段已結束。", enter:"進入作品 →",
    artist:"藝術家", year:"年份", medium:"媒材", start:"開始感知", starting:"啟動中…"
  };

  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[character]);
  const workFor = workId => D.works.find(work => String(work.id) === String(workId));
  const artistFor = work => (work && work.artistIds || []).map(id => D.artists.find(artist => artist.id === id)).filter(Boolean).map(artist => C.localizedText(artist, "name")).join("／");
  const numberFor = work => {
    const mapWork = work && D.mapWorks && D.mapWorks.find(item => String(item.workId) === String(work.id));
    return mapWork && (mapWork.number || mapWork.mapNumber) || work && (work.mapNumber || work.number) || String(work && work.id || "").replace(/^.*-/, "").padStart(2, "0");
  };
  const detailUrlFor = workId => typeof config.workDetailUrl === "function" ? config.workDetailUrl(workId, isEnglish ? "en" : "zh-Hant") : C.localizedRoute(`work-detail.html?id=${encodeURIComponent(workId)}`);
  const absoluteAssetUrl = path => new URL(C.assetRoute(path), document.baseURI).href;

  class ArtworkTracker {
    constructor(adapter = null) { this.adapter = adapter; this.listeners = {potential:new Set(), identified:new Set(), lost:new Set()}; }
    onPotentialMatch(callback) { this.listeners.potential.add(callback); return () => this.listeners.potential.delete(callback); }
    onIdentified(callback) { this.listeners.identified.add(callback); return () => this.listeners.identified.delete(callback); }
    onLost(callback) { this.listeners.lost.add(callback); return () => this.listeners.lost.delete(callback); }
    emit(type, payload = {}) { if (this.listeners[type]) this.listeners[type].forEach(callback => callback(payload)); }
    async start(context = {}) { if (this.adapter && this.adapter.start) await this.adapter.start(this, context); }
    async stop() { if (this.adapter && this.adapter.stop) await this.adapter.stop(); Object.keys(this.listeners).forEach(type => this.listeners[type].clear()); }
  }

  class DebugAdapter {
    constructor() { this.tracker = null; }
    async start(activeTracker) { this.tracker = activeTracker; }
    potential(workId) { if (this.tracker) this.tracker.emit("potential", {workId}); }
    identify(workId, side = "left") { if (this.tracker) this.tracker.emit("identified", {workId, side}); }
    lose(workId) { if (this.tracker) this.tracker.emit("lost", {workId}); }
    async stop() { this.tracker = null; }
  }

  const setState = (nextState, payload = {}) => {
    if (!Object.values(states).includes(nextState)) return;
    state = nextState;
    view.dataset.perceptionState = state;
    stateLabel.textContent = state === states.IDENTIFIED && payload.workId ? `ENTITY ${numberFor(workFor(payload.workId))}` : state;
    errorBox.hidden = state !== states.ERROR;
    entity.hidden = state !== states.IDENTIFIED && state !== states.LOST;
  };
  const showError = message => { errorBox.innerHTML = `<p>${escapeHtml(message)}</p>`; setState(states.ERROR); };
  const renderEntity = (workId, side = "left") => {
    const work = workFor(workId);
    if (!work) return showError(labels.startError);
    entity.classList.toggle("is-left", side === "right");
    entity.classList.toggle("is-right", side !== "right");
    if (String(activeWorkId) === String(work.id) && entity.innerHTML) {
      currentLocation = {type:"artwork", workId:work.id};
      return setState(states.IDENTIFIED, {workId:work.id});
    }
    const medium = C.localizedText(work, "medium");
    entity.innerHTML = `<p>ENTITY ${escapeHtml(numberFor(work))}</p><h2>${escapeHtml(C.localizedText(work, "title"))}</h2><dl>
      <div><dt>${labels.artist}</dt><dd>${escapeHtml(artistFor(work) || "—")}</dd></div>
      ${work.year ? `<div><dt>${labels.year}</dt><dd>${escapeHtml(work.year)}</dd></div>` : ""}
      ${medium ? `<div><dt>${labels.medium}</dt><dd>${escapeHtml(medium)}</dd></div>` : ""}
    </dl><a class="button" href="${escapeHtml(detailUrlFor(work.id))}">${labels.enter}</a>`;
    activeWorkId = work.id;
    currentLocation = {type:"artwork", workId:work.id};
    setState(states.IDENTIFIED, {workId:work.id});
  };
  const bindTracker = activeTracker => {
    activeTracker.onPotentialMatch(({workId}) => { window.clearTimeout(lostTimer); if (workFor(workId)) setState(states.MATCHING); });
    activeTracker.onIdentified(({workId, side = "left"}) => { window.clearTimeout(lostTimer); renderEntity(workId, side); });
    activeTracker.onLost(() => {
      if (state !== states.IDENTIFIED && state !== states.MATCHING) return;
      window.clearTimeout(lostTimer);
      setState(states.LOST);
      lostTimer = window.setTimeout(() => { activeWorkId = ""; entity.hidden = true; setState(states.SEARCHING); }, lostGraceMs);
    });
  };
  const cameraErrorMessage = error => {
    if (!window.isSecureContext) return labels.insecure;
    if (error && (error.name === "NotAllowedError" || error.name === "SecurityError")) return labels.denied;
    if (error && (error.name === "NotFoundError" || error.name === "OverconstrainedError")) return labels.unavailable;
    return labels.startError;
  };
  const stopPerception = async ({showIntro = true, preserveError = false} = {}) => {
    sessionId += 1;
    window.clearTimeout(lostTimer);
    lostTimer = 0;
    const oldTracker = tracker;
    tracker = null;
    debugAdapter = null;
    if (oldTracker) await oldTracker.stop();
    activeWorkId = "";
    currentLocation = null;
    entity.hidden = true;
    if (!preserveError) errorBox.hidden = true;
    runtime.hidden = showIntro;
    intro.hidden = !showIntro;
    startButton.disabled = false;
    startButton.textContent = labels.start;
    if (!preserveError) setState(states.IDLE);
  };

  const startPerception = () => {
    if (startPromise || tracker) return startPromise || Promise.resolve();
    const requestedSession = ++sessionId;
    intro.hidden = false;
    runtime.hidden = true;
    startButton.disabled = true;
    startButton.textContent = labels.starting;
    startPromise = (async () => {
      if (debugMode) {
        intro.hidden = true;
        runtime.hidden = false;
        debugAdapter = new DebugAdapter();
        tracker = new ArtworkTracker(debugAdapter);
        bindTracker(tracker);
        await tracker.start({video:null, targets:targetMap});
        if (requestedSession === sessionId) setState(states.SEARCHING);
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return showError(labels.unsupported);
      if (!window.isSecureContext) return showError(labels.insecure);
      try {
        const Adapter = window.DAF_MINDAR_ADAPTER && window.DAF_MINDAR_ADAPTER.MindARAdapter;
        if (!Adapter) throw new Error("MindAR adapter is unavailable.");
        if (!window.DAF_PERCEPTION_TRACKING_ASSET) throw new Error("MindAR target asset is unavailable.");
        if (!mindarAdapter) {
          mindarAdapter = new Adapter({
            container:trackingStage,
            runtimeModuleUrl:absoluteAssetUrl(config.runtimeModule || "assets/vendor/mindar-1.2.5/mindar-image-three.prod.js"),
            imageTargetSrc:absoluteAssetUrl(config.trackingAsset || window.DAF_PERCEPTION_TRACKING_ASSET),
            targets:targetMap,
            recognitionStableMs:220,
            targetSwitchDelayMs:360
          });
        }
        tracker = new ArtworkTracker(mindarAdapter);
        bindTracker(tracker);
        await tracker.start({
          targets:targetMap,
          onCameraReady:() => {
            if (requestedSession !== sessionId) return;
            intro.hidden = true;
            runtime.hidden = false;
            setState(states.CAMERA_READY);
          },
          onTrackEnded:() => {
            if (!view.hidden && requestedSession === sessionId) void stopPerception({showIntro:false}).then(() => showError(labels.interrupted));
          }
        });
        if (requestedSession === sessionId) setState(states.SEARCHING);
      } catch (error) {
        if (requestedSession !== sessionId) return;
        const message = cameraErrorMessage(error);
        await stopPerception({showIntro:false});
        showError(message);
      }
    })().finally(() => {
      startPromise = null;
      if (requestedSession === sessionId) { startButton.disabled = false; startButton.textContent = labels.start; }
    });
    return startPromise;
  };

  const setMode = async mode => {
    const perceptionActive = mode === "perception";
    if (!perceptionActive) await stopPerception();
    view.hidden = !perceptionActive;
    mapView.hidden = perceptionActive;
    document.body.classList.toggle("perception-active", perceptionActive);
    document.querySelectorAll("[data-perception-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.perceptionMode === mode)));
  };
  const buildDebugControls = async () => {
    if (!debugMode) return;
    const workIds = [...new Set(targetMap.map(target => target.workId).filter(workId => workFor(workId)))];
    const controls = [states.IDLE, states.CAMERA_READY, states.SEARCHING, states.MATCHING, ...workIds.map(id => `ENTITY ${numberFor(workFor(id))}`), states.LOST, states.ERROR];
    debugPanel.hidden = false;
    debugPanel.innerHTML = controls.map(label => `<button type="button" data-debug-state="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join("");
    debugPanel.addEventListener("click", event => {
      const trigger = event.target.closest("[data-debug-state]");
      const label = trigger && trigger.dataset.debugState;
      if (!label) return;
      if (label.indexOf("ENTITY") === 0) {
        const index = controls.filter(item => item.indexOf("ENTITY") === 0).indexOf(label);
        if (debugAdapter) debugAdapter.identify(workIds[index], index % 2 ? "right" : "left");
      } else if (label === states.MATCHING && debugAdapter) debugAdapter.potential(workIds[0]);
      else if (label === states.LOST && debugAdapter) debugAdapter.lose(activeWorkId);
      else if (label === states.ERROR) showError("DEBUG ERROR");
      else setState(label);
    });
    await setMode("perception");
    await startPerception();
  };

  document.querySelectorAll("[data-perception-mode]").forEach(button => button.addEventListener("click", () => { void setMode(button.dataset.perceptionMode); }));
  startButton.addEventListener("click", () => { void startPerception(); });
  view.querySelector("[data-perception-return]").addEventListener("click", () => { void setMode("map"); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && !view.hidden) void stopPerception(); });
  window.addEventListener("pagehide", () => { void stopPerception().then(() => mindarAdapter && mindarAdapter.dispose()); }, {once:true});
  void buildDebugControls();

  window.DAF_PERCEPTION = {states, getState:() => state, getCurrentLocation:() => currentLocation ? {...currentLocation} : null, ArtworkTracker, DebugAdapter};
})();

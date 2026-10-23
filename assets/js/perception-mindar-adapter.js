(() => {
  "use strict";

  class MindARAdapter {
    constructor(options = {}) {
      this.container = options.container;
      this.runtimeModuleUrl = options.runtimeModuleUrl;
      this.imageTargetSrc = options.imageTargetSrc;
      this.targets = options.targets || [];
      this.recognitionStableMs = options.recognitionStableMs || 220;
      this.targetSwitchDelayMs = options.targetSwitchDelayMs || 360;
      this.mindar = null;
      this.anchors = [];
      this.tracker = null;
      this.stream = null;
      this.video = null;
      this.trackEndedHandler = null;
      this.metadataCancel = null;
      this.visibleTargets = new Set();
      this.activeTargetIndex = null;
      this.candidateTargetIndex = null;
      this.candidateTimer = 0;
      this.switchTimer = 0;
      this.generation = 0;
      this.starting = false;
      this.stopped = true;
      this.startCancel = null;
      this.startSettled = null;
      this.resolveStartSettled = null;
    }

    async loadRuntime() {
      if (this.mindar) return;
      if (!this.container || !this.runtimeModuleUrl || !this.imageTargetSrc) throw new Error("MindAR configuration is incomplete.");
      const module = await import(this.runtimeModuleUrl);
      this.mindar = new module.MindARThree({
        container: this.container,
        imageTargetSrc: this.imageTargetSrc,
        maxTrack: 1,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
        warmupTolerance: 5,
        missTolerance: 5
      });
      this.anchors = this.targets.map(target => {
        const anchor = this.mindar.addAnchor(target.targetIndex);
        anchor.onTargetFound = () => this.handleTargetFound(target.targetIndex);
        anchor.onTargetLost = () => this.handleTargetLost(target.targetIndex);
        return anchor;
      });
    }

    createVideo() {
      const video = document.createElement("video");
      video.className = "perception-mindar-video";
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.style.inset = "0";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      this.container.appendChild(video);
      return video;
    }

    waitForMetadata(video, generation) {
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          video.removeEventListener("loadedmetadata", loaded);
          video.removeEventListener("error", failed);
          this.metadataCancel = null;
        };
        const loaded = () => { cleanup(); generation === this.generation ? resolve() : reject(new DOMException("Camera start cancelled", "AbortError")); };
        const failed = () => { cleanup(); reject(new Error("Camera metadata could not be loaded.")); };
        this.metadataCancel = () => { cleanup(); reject(new DOMException("Camera start cancelled", "AbortError")); };
        video.addEventListener("loadedmetadata", loaded, {once:true});
        video.addEventListener("error", failed, {once:true});
      });
    }

    async start(tracker, context = {}) {
      if (this.starting || !this.stopped) return;
      this.starting = true;
      this.stopped = false;
      this.startSettled = new Promise(resolve => { this.resolveStartSettled = resolve; });
      this.tracker = tracker;
      const generation = ++this.generation;
      try {
        await this.loadRuntime();
        if (generation !== this.generation || this.stopped) return;
        this.video = this.createVideo();
        const mediaRequest = navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}, audio:false});
        mediaRequest.then(lateStream => {
          if (generation !== this.generation || this.stopped) lateStream.getTracks().forEach(track => track.stop());
        }).catch(() => {});
        this.stream = await Promise.race([
          mediaRequest,
          new Promise((resolve, reject) => {
            this.startCancel = () => reject(new DOMException("Camera start cancelled", "AbortError"));
          })
        ]);
        this.startCancel = null;
        if (generation !== this.generation || this.stopped) return;
        this.trackEndedHandler = () => {
          if (!this.stopped && context.onTrackEnded) context.onTrackEnded();
        };
        this.stream.getTracks().forEach(track => track.addEventListener("ended", this.trackEndedHandler, {once:true}));
        this.video.srcObject = this.stream;
        await this.waitForMetadata(this.video, generation);
        await this.video.play();
        if (generation !== this.generation || this.stopped) return;
        this.mindar.video = this.video;
        if (context.onCameraReady) context.onCameraReady(this.stream);
        await this.mindar._startAR();
        if (generation !== this.generation || this.stopped) return;
      } finally {
        this.starting = false;
        if (generation !== this.generation || this.stopped) this.releaseSession(true);
        this.resolveStartSettled && this.resolveStartSettled();
        this.resolveStartSettled = null;
      }
    }

    beginCandidate(targetIndex) {
      if (this.activeTargetIndex !== null || this.candidateTargetIndex !== null || !this.visibleTargets.has(targetIndex)) return;
      this.candidateTargetIndex = targetIndex;
      if (this.tracker) this.tracker.emit("potential", {workId:this.workIdFor(targetIndex), targetIndex});
      window.clearTimeout(this.candidateTimer);
      this.candidateTimer = window.setTimeout(() => {
        this.candidateTimer = 0;
        if (this.stopped || this.activeTargetIndex !== null || !this.visibleTargets.has(targetIndex)) {
          this.candidateTargetIndex = null;
          return;
        }
        this.activeTargetIndex = targetIndex;
        this.candidateTargetIndex = null;
        if (this.tracker) this.tracker.emit("identified", {workId:this.workIdFor(targetIndex), targetIndex, side:targetIndex % 2 ? "right" : "left"});
      }, this.recognitionStableMs);
    }

    handleTargetFound(targetIndex) {
      this.visibleTargets.add(targetIndex);
      if (this.activeTargetIndex === targetIndex) {
        window.clearTimeout(this.switchTimer);
        this.switchTimer = 0;
        if (this.tracker) {
          this.tracker.emit("potential", {workId:this.workIdFor(targetIndex), targetIndex});
          this.tracker.emit("identified", {workId:this.workIdFor(targetIndex), targetIndex, side:targetIndex % 2 ? "right" : "left"});
        }
        return;
      }
      this.beginCandidate(targetIndex);
    }

    handleTargetLost(targetIndex) {
      this.visibleTargets.delete(targetIndex);
      if (this.candidateTargetIndex === targetIndex) {
        window.clearTimeout(this.candidateTimer);
        this.candidateTimer = 0;
        this.candidateTargetIndex = null;
      }
      if (this.activeTargetIndex !== targetIndex) return;
      if (this.tracker) this.tracker.emit("lost", {workId:this.workIdFor(targetIndex), targetIndex});
      window.clearTimeout(this.switchTimer);
      this.switchTimer = window.setTimeout(() => {
        this.switchTimer = 0;
        if (this.visibleTargets.has(targetIndex)) return;
        this.activeTargetIndex = null;
        const nextTarget = [...this.visibleTargets].sort((a, b) => a - b)[0];
        if (nextTarget !== undefined) this.beginCandidate(nextTarget);
      }, this.targetSwitchDelayMs);
    }

    workIdFor(targetIndex) {
      const target = this.targets.find(item => item.targetIndex === targetIndex);
      return target ? target.workId : "";
    }

    releaseSession(disposeController) {
      window.clearTimeout(this.candidateTimer);
      window.clearTimeout(this.switchTimer);
      this.candidateTimer = 0;
      this.switchTimer = 0;
      this.metadataCancel && this.metadataCancel();
      this.metadataCancel = null;
      this.startCancel && this.startCancel();
      this.startCancel = null;
      if (this.stream && this.trackEndedHandler) this.stream.getTracks().forEach(track => track.removeEventListener("ended", this.trackEndedHandler));
      this.trackEndedHandler = null;
      if (this.mindar && this.mindar.controller) {
        if (disposeController && this.mindar.controller.dispose) this.mindar.controller.dispose();
        else if (this.mindar.controller.stopProcessVideo) this.mindar.controller.stopProcessVideo();
        if (disposeController) this.mindar.controller = null;
      }
      if (this.stream) this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      if (this.video) {
        this.video.pause();
        this.video.srcObject = null;
        this.video.remove();
      }
      this.video = null;
      if (this.mindar) this.mindar.video = null;
      this.anchors.forEach(anchor => { anchor.visible = false; anchor.group.visible = false; });
      this.visibleTargets.clear();
      this.activeTargetIndex = null;
      this.candidateTargetIndex = null;
    }

    async stop() {
      this.stopped = true;
      this.generation += 1;
      this.tracker = null;
      this.releaseSession(!this.starting);
      if (this.startSettled) await this.startSettled;
      this.startSettled = null;
    }

    async dispose() {
      await this.stop();
      if (!this.mindar) return;
      this.mindar.renderer.setAnimationLoop(null);
      this.mindar.renderer.dispose();
      if (this.mindar.renderer.forceContextLoss) this.mindar.renderer.forceContextLoss();
      this.mindar.renderer.domElement.remove();
      this.mindar.cssRenderer.domElement.remove();
      this.anchors = [];
      this.mindar = null;
    }
  }

  window.DAF_MINDAR_ADAPTER = {MindARAdapter};
})();

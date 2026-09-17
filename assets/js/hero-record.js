(() => {
  "use strict";

  const recordStage = document.querySelector(".hero-record-stage");
  const logoStage = document.querySelector("#hero-record-logo");
  const captureMode = new URLSearchParams(window.location.search).get("capture") === "1";
  let isPlaying = false;

  const fitRecordStage = () => {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    recordStage.style.setProperty("--hero-record-scale", String(scale));
  };

  const loadLogoFonts = async () => {
    if (!document.fonts?.load) return;
    await Promise.race([
      Promise.all([
        document.fonts.load('250 1em "Noto Serif JP"'),
        document.fonts.load('400 1em "TogetogeRock"'),
        document.fonts.load('400 1em "Turret Road"')
      ]),
      new Promise(resolve => window.setTimeout(resolve, 1200))
    ]).catch(() => {});
  };

  const play = async () => {
    if (isPlaying) return;
    isPlaying = true;
    window.DAFHeroLogoAnimation.reset(logoStage);
    await loadLogoFonts();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      logoStage.classList.add("is-mark-visible");
      isPlaying = false;
      return;
    }
    try {
      await window.DAFHeroLogoAnimation.run(logoStage);
    } catch (error) {
      console.error("Hero record animation fallback:", error);
      logoStage.classList.add("is-mark-visible");
    } finally {
      isPlaying = false;
    }
  };

  const createCaptureClock = () => {
    let time = 0;
    let timers = [];
    let frames = [];
    const flush = async () => {
      let changed = true;
      while (changed) {
        changed = false;
        const readyTimers = timers.filter(timer => timer.at <= time);
        timers = timers.filter(timer => timer.at > time);
        if (readyTimers.length) {
          changed = true;
          readyTimers.forEach(timer => timer.resolve());
          await Promise.resolve();
        }
        const readyFrames = frames;
        frames = [];
        if (readyFrames.length) {
          changed = true;
          readyFrames.forEach(callback => callback(time));
          await Promise.resolve();
        }
      }
    };
    return {
      now: () => time,
      wait: duration => new Promise(resolve => timers.push({at: time + duration, resolve})),
      requestFrame: callback => frames.push(callback),
      advance: async duration => {
        time += duration;
        await flush();
      }
    };
  };

  const syncCaptureAnimations = (() => {
    const animationStarts = new Map();
    return () => {
      const time = window.DAFHeroLogoClock.now();
      document.getAnimations().forEach(animation => {
        if (!animationStarts.has(animation)) {
          animationStarts.set(animation, time);
          animation.pause();
        }
        animation.currentTime = Math.max(0, time - animationStarts.get(animation));
      });
    };
  })();

  const beginCapture = () => {
    if (!captureMode || isPlaying) return;
    isPlaying = true;
    window.DAFHeroLogoClock = createCaptureClock();
    window.DAFHeroLogoAnimation.reset(logoStage);
    const completion = window.DAFHeroLogoAnimation.run(logoStage)
      .catch(error => {
        console.error("Hero record animation fallback:", error);
        logoStage.classList.add("is-mark-visible");
      })
      .finally(() => { isPlaying = false; });
    window.__DAFHeroRecordCapture = {
      advance: async duration => {
        await window.DAFHeroLogoClock.advance(duration);
        syncCaptureAnimations();
      },
      completion
    };
    syncCaptureAnimations();
  };

  window.addEventListener("resize", fitRecordStage);
  window.addEventListener("keydown", event => {
    if (event.key.toLowerCase() !== "r" || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    play();
  });

  fitRecordStage();
  if (captureMode) window.__DAFHeroRecordCapture = {begin: beginCapture};
  else play();
})();

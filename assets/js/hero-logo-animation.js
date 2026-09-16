(() => {
  "use strict";

  const wait = duration => window.DAFHeroLogoClock
    ? window.DAFHeroLogoClock.wait(duration)
    : new Promise(resolve => window.setTimeout(resolve, duration));
  const phases = ["is-blocks", "is-scrambling", "is-recognizing", "is-glitching", "is-flashing"];

  const scrambleTitles = (elements, options = {}) => new Promise(resolve => {
    const {duration, fromRatio, toRatio, volatility = 0, fontMixRecognition = false} = options;
    const frame = 46;
    const shuffle = values => {
      const result = [...values];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
      }
      return result;
    };
    const states = elements.map(element => {
      const characters = [...(element.dataset.finalText || element.textContent)];
      const slots = characters.map((character, index) => character === " " ? -1 : index).filter(index => index >= 0);
      const isEnglishTitle = element.matches(".hero-logo-recognition-en");
      const state = {
        element,
        characters,
        slots,
        resolutionOrder: shuffle(slots),
        resolved: new Set(),
        glyphs: [...(isEnglishTitle ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?#%+-/\\01▒▓" : "灰色自動體未識別中?#%+/\\01▒▓")]
      };
      if (isEnglishTitle) {
        state.glyphNodes = [];
        state.currentGlyphs = [];
        state.currentResolved = [];
        element.textContent = "";
        const glyphLine = document.createElement("span");
        glyphLine.className = "hero-logo-glyph-line";
        element.append(glyphLine);
        characters.forEach((character, index) => {
          if (character === " ") {
            glyphLine.append(document.createTextNode(" "));
            return;
          }
          const glyph = document.createElement("span");
          glyph.className = "hero-logo-glyph is-togetoge";
          glyphLine.append(glyph);
          state.glyphNodes[index] = glyph;
        });
      }
      return state;
    });
    const chooseEnglishFont = mixProgress => {
      const togetogeChance = 1 / 3 + (2 / 3 * mixProgress);
      const random = Math.random();
      if (random < togetogeChance) return "is-togetoge";
      return random < togetogeChance + (1 - togetogeChance) / 2 ? "is-turret" : "is-serif";
    };
    const clock = window.DAFHeroLogoClock;
    const startedAt = clock ? clock.now() : performance.now();
    const tick = now => {
      const elapsed = Math.min(now - startedAt, duration);
      const progress = elapsed / duration;
      const ratio = fromRatio + ((toRatio - fromRatio) * progress);
      states.forEach(state => {
        const target = Math.min(state.slots.length, Math.max(0, Math.round(state.slots.length * ratio)));
        while (state.resolved.size < target) state.resolved.add(state.resolutionOrder[state.resolved.size]);
        const glyphs = state.characters.map((character, index) => {
          if (character === " ") return character;
          const isResolved = state.resolved.has(index) && !(volatility && Math.random() < volatility * (1 - progress));
          if (isResolved) return character;
          const unresolvedGlyphs = state.glyphs.filter(glyph => glyph !== character);
          return unresolvedGlyphs[Math.floor(Math.random() * unresolvedGlyphs.length)];
        });
        if (state.glyphNodes) {
          glyphs.forEach((glyph, index) => {
            if (state.characters[index] === " ") return;
            const isResolved = glyph === state.characters[index] && state.resolved.has(index);
            if (state.currentGlyphs[index] !== glyph || state.currentResolved[index] !== isResolved) {
              const node = state.glyphNodes[index];
              node.textContent = glyph;
              node.className = `hero-logo-glyph ${chooseEnglishFont(fontMixRecognition ? progress : 0)}`;
              state.currentGlyphs[index] = glyph;
              state.currentResolved[index] = isResolved;
            }
          });
        } else state.element.textContent = glyphs.join("");
      });
      if (elapsed < duration) {
        if (clock) clock.wait(frame).then(() => clock.requestFrame(tick));
        else window.setTimeout(() => requestAnimationFrame(tick), frame);
      }
      else resolve(states);
    };
    if (clock) clock.requestFrame(tick);
    else requestAnimationFrame(tick);
  });

  const reset = titleStage => {
    if (!titleStage) return;
    titleStage.classList.remove(...phases, "is-mark-visible", "hero-sequence-running");
    const blocks = titleStage.querySelector(".hero-logo-blocks");
    if (blocks) blocks.textContent = "";
    titleStage.querySelectorAll(".hero-logo-scramble").forEach(element => {
      element.textContent = element.dataset.finalText || "";
    });
  };

  const run = async titleStage => {
    if (!titleStage) throw new Error("A Hero logo stage is required.");
    const blocks = titleStage.querySelector(".hero-logo-blocks");
    const recognitionTitles = [...titleStage.querySelectorAll(".hero-logo-scramble")];
    if (!blocks || recognitionTitles.length !== 2) throw new Error("Hero logo layers are incomplete.");
    titleStage.classList.add("hero-sequence-running");
    blocks.innerHTML = Array.from({length: 34}, (_, index) => {
      const column = index % 10;
      const row = Math.floor(index / 10);
      const x = 2 + column * 10 + ((row * 3 + index) % 4);
      const y = 7 + row * 24 + ((column * 5) % 9);
      const width = 3 + ((index * 7) % 8);
      const height = 4 + ((index * 5) % 11);
      const dx = ((index % 2 ? 1 : -1) * (35 + ((index * 13) % 90)));
      const dy = ((index % 3 ? 1 : -1) * (20 + ((index * 9) % 55)));
      return `<i class="hero-logo-block" style="--block-x:${x}%;--block-y:${y}%;--block-w:${width}%;--block-h:${height}%;--block-alpha:${(.22 + (index % 5) * .1).toFixed(2)};--block-delay:${(index % 9) * 12}ms;--block-dx:${dx}px;--block-dy:${dy}px"></i>`;
    }).join("");
    const setPhase = phase => {
      titleStage.classList.remove(...phases);
      if (phase) titleStage.classList.add(phase);
    };

    setPhase("is-blocks");
    await wait(290);
    setPhase("is-scrambling");
    await scrambleTitles(recognitionTitles, {duration: 500, fromRatio: 0, toRatio: .18});
    setPhase("is-recognizing");
    const recognitionStates = await scrambleTitles(recognitionTitles, {duration: 400, fromRatio: .18, toRatio: .94, volatility: .24, fontMixRecognition: true});
    recognitionStates.forEach(state => {
      if (!state.glyphNodes) {
        state.element.textContent = state.element.dataset.finalText;
        return;
      }
      state.characters.forEach((character, index) => {
        if (character === " ") return;
        const glyph = state.glyphNodes[index];
        glyph.textContent = character;
        glyph.className = "hero-logo-glyph is-togetoge";
      });
    });
    setPhase("is-glitching");
    await wait(180);
    setPhase("is-flashing");
    await wait(90);
    setPhase("");
    titleStage.classList.add("is-mark-visible");
  };

  window.DAFHeroLogoAnimation = {reset, run};
})();

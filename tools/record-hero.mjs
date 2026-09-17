import {createServer} from "node:http";
import {promisify} from "node:util";
import {execFile as execFileCallback} from "node:child_process";
import {existsSync, mkdirSync, readFileSync, rmSync} from "node:fs";
import {extname, join, normalize, resolve} from "node:path";
import {inflateSync} from "node:zlib";
import {chromium} from "playwright-core";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeStatic from "ffprobe-static";

const execFile = promisify(execFileCallback);
const root = resolve(import.meta.dirname, "..");
const output = join(root, "output");
const frames = join(output, "temp", "hero-logo-frames");
const webm = join(output, "DAF2026_Hero_Logo.webm");
const mov = join(output, "DAF2026_Hero_Logo.mov");
const fps = 60;
const animationMs = 1460;
const finalHoldMs = 1000;
const frameCount = Math.round(((animationMs + finalHoldMs) / 1000) * fps);
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];
const chromePath = chromeCandidates.find(existsSync);
const ffmpegPath = ffmpegInstaller.path;
const ffprobePath = ffprobeStatic.path;
const mime = {".css": "text/css", ".html": "text/html", ".js": "application/javascript", ".otf": "font/otf", ".png": "image/png", ".svg": "image/svg+xml"};

if (!chromePath) throw new Error("Chrome or Edge was not found. Install a local Chromium browser before recording.");
if (!ffmpegPath || !ffprobePath) throw new Error("The local FFmpeg tools are unavailable. Run npm install first.");

const serve = () => new Promise(resolveServer => {
  const server = createServer((request, response) => {
    const relative = decodeURIComponent((request.url || "/").split("?")[0]).replace(/^\/+/, "") || "hero-record.html";
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {"Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream"});
    response.end(readFileSync(file));
  });
  server.listen(0, "127.0.0.1", () => resolveServer(server));
});

const run = async (file, args) => {
  await execFile(file, args, {windowsHide: true, maxBuffer: 4 * 1024 * 1024});
};

const probe = async file => {
  const {stdout} = await execFile(ffprobePath, ["-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate,pix_fmt:stream_tags=alpha_mode:format=duration", "-of", "json", file], {windowsHide: true});
  return JSON.parse(stdout);
};

const paeth = (left, up, upLeft) => {
  const prediction = left + up - upLeft;
  const leftDistance = Math.abs(prediction - left);
  const upDistance = Math.abs(prediction - up);
  const upLeftDistance = Math.abs(prediction - upLeft);
  return leftDistance <= upDistance && leftDistance <= upLeftDistance ? left : upDistance <= upLeftDistance ? up : upLeft;
};

const alphaSummary = png => {
  const signature = "89504e470d0a1a0a";
  if (png.subarray(0, 8).toString("hex") !== signature) throw new Error("Expected a PNG frame.");
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < png.length) {
    const size = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + size);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === "IDAT") idat.push(data);
    offset += size + 12;
  }
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`Expected RGBA PNG, got bit depth ${bitDepth}, color type ${colorType}.`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let source = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[source++];
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const previous = y ? pixels.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x += 1) {
      const value = raw[source++];
      const left = x >= 4 ? row[x - 4] : 0;
      const up = previous ? previous[x] : 0;
      const upLeft = previous && x >= 4 ? previous[x - 4] : 0;
      row[x] = filter === 0 ? value : filter === 1 ? (value + left) & 255 : filter === 2 ? (value + up) & 255 : filter === 3 ? (value + Math.floor((left + up) / 2)) & 255 : (value + paeth(left, up, upLeft)) & 255;
    }
  }
  let transparent = 0;
  let visible = 0;
  let min = 255;
  let max = 0;
  for (let index = 3; index < pixels.length; index += 4) {
    const alpha = pixels[index];
    min = Math.min(min, alpha);
    max = Math.max(max, alpha);
    if (alpha === 0) transparent += 1;
    if (alpha > 0) visible += 1;
  }
  return {width, height, alphaMin: min, alphaMax: max, transparentPixels: transparent, visiblePixels: visible};
};

const extractAlphaFrame = async (source, name) => {
  const frame = join(output, "temp", `${name}-alpha-check.png`);
  await run(ffmpegPath, ["-y", "-ss", "0.5", "-i", source, "-frames:v", "1", "-pix_fmt", "rgba", frame]);
  return alphaSummary(readFileSync(frame));
};

const browserAlphaSummary = async (browser, baseUrl, source) => {
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
  await page.goto(`${baseUrl}/hero-record.html?transparent=1`, {waitUntil: "domcontentloaded"});
  const result = await page.evaluate(async videoSource => {
    const video = document.createElement("video");
    video.muted = true;
    video.src = videoSource;
    document.body.append(video);
    await new Promise((resolveLoad, rejectLoad) => {
      video.addEventListener("loadeddata", resolveLoad, {once: true});
      video.addEventListener("error", () => rejectLoad(new Error("The WebM could not be decoded by Chromium.")), {once: true});
    });
    video.currentTime = .5;
    await new Promise(resolveSeek => video.addEventListener("seeked", resolveSeek, {once: true}));
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const context = canvas.getContext("2d", {willReadFrequently: true});
    context.drawImage(video, 0, 0);
    const {data} = context.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    let visible = 0;
    let min = 255;
    let max = 0;
    for (let index = 3; index < data.length; index += 4) {
      const alpha = data[index];
      min = Math.min(min, alpha);
      max = Math.max(max, alpha);
      if (alpha === 0) transparent += 1;
      else visible += 1;
    }
    return {width: canvas.width, height: canvas.height, alphaMin: min, alphaMax: max, transparentPixels: transparent, visiblePixels: visible};
  }, "/output/DAF2026_Hero_Logo.webm");
  await page.close();
  return result;
};

mkdirSync(frames, {recursive: true});
rmSync(frames, {recursive: true, force: true});
mkdirSync(frames, {recursive: true});

const server = await serve();
const address = server.address();
const url = `http://127.0.0.1:${address.port}/hero-record.html?transparent=1&capture=1`;
let browser;

try {
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--force-color-profile=srgb", "--disable-lcd-text", "--hide-scrollbars"]
  });
  const context = await browser.newContext({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "no-preference"});
  const page = await context.newPage();
  await page.goto(url, {waitUntil: "domcontentloaded"});
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.__DAFHeroRecordCapture.begin();
    await window.__DAFHeroRecordCapture.advance(0);
  });
  for (let frame = 0; frame < frameCount; frame += 1) {
    if (frame) await page.evaluate(step => window.__DAFHeroRecordCapture.advance(step), 1000 / fps);
    await page.screenshot({path: join(frames, `frame-${String(frame).padStart(5, "0")}.png`), omitBackground: true});
  }
  await page.evaluate(() => window.__DAFHeroRecordCapture.completion);
  const sourceAlpha = alphaSummary(readFileSync(join(frames, "frame-00030.png")));
  await context.close();

  await run(ffmpegPath, ["-y", "-framerate", String(fps), "-i", join(frames, "frame-%05d.png"), "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-lossless", "1", webm]);
  await run(ffmpegPath, ["-y", "-framerate", String(fps), "-i", join(frames, "frame-%05d.png"), "-c:v", "prores_ks", "-profile:v", "4", "-pix_fmt", "yuva444p10le", mov]);

  const report = {
    sourceFrameAlpha: sourceAlpha,
    webm: {...await probe(webm), browserDecodedAlpha: await browserAlphaSummary(browser, `http://127.0.0.1:${address.port}`, webm)},
    mov: {...await probe(mov), alphaFrame: await extractAlphaFrame(mov, "mov")},
    timeline: {fps, animationMs, finalHoldMs, frameCount}
  };
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolveClose => server.close(resolveClose));
}

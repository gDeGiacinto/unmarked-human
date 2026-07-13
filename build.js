#!/usr/bin/env node
/**
 * Zero-dependency static site builder for BPM-THERAPY.
 * Reads content/site.json and renders it into dist/index.html
 * using the template in templates/index.html.
 *
 * Usage: node build.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const content = JSON.parse(fs.readFileSync(path.join(ROOT, "content/site.json"), "utf8"));

// Turns **word** into <span class="accent">word</span> — lets the CMS mark
// up which words in the headline get the accent color, without needing a
// separate rich-text editor.
function accentize(str) {
  return str.replace(/\*\*(.+?)\*\*/g, '<span class="accent">$1</span>');
}

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function embedFrame(url, note) {
  if (url && url.trim()) {
    const src = toEmbeddable(url.trim());
    return `<div class="embed-slot" style="border-style:solid;padding:0;overflow:hidden;"><iframe src="${esc(src)}" loading="lazy" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
  }
  return `<div class="embed-slot">${esc(note || "Add an embed URL in the admin")}</div>`;
}

function toEmbeddable(url) {
  // Best-effort passthrough; YouTube watch URLs get converted to embed URLs.
  const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
  if (ytMatch && url.includes("youtu")) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

function navLinks() {
  return content.nav.links
    .map((l) => `<li><a href="${esc(l.target)}">${esc(l.label)}</a></li>`)
    .join("\n");
}

function heroStats() {
  return content.hero.stats
    .map(
      (s) => `<div><div class="stat-value">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`
    )
    .join("\n");
}

function heroTags() {
  return content.hero.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("\n");
}

function marquee() {
  const items = content.hero.tags.map((t) => `<span>${esc(t)} <em>&#10022;</em></span>`).join("\n");
  return items + items; // duplicate for seamless scroll
}

function scheduleList() {
  return content.stream.schedule
    .map(
      (s) => `<div class="stream-card" data-day="${esc(s.day)}">
        <div class="day">${esc(s.day)}</div>
        <div class="time">${esc(s.time)}</div>
        <div class="label">${esc(s.title)}</div>
        <div class="live"><span class="live-dot"></span>${esc(s.status)}</div>
      </div>`
    )
    .join("\n");
}

function trackList() {
  return content.music.tracks
    .map(
      (t, i) => `<li>
        <span class="track-idx">${String(i + 1).padStart(2, "0")}</span>
        <span>
          <div class="track-title">${esc(t.title)}</div>
          <div class="track-type">${esc(t.type)}</div>
        </span>
        <span class="track-meta">${esc(t.bpm)}</span>
        <span class="track-meta">${esc(t.key)}</span>
      </li>`
    )
    .join("\n");
}

function videoGrid() {
  return content.video.videos
    .map((v) => {
      const inner = v.url && v.url.trim()
        ? `<iframe src="${esc(toEmbeddable(v.url.trim()))}" loading="lazy" allowfullscreen></iframe>`
        : `<span>${esc(v.note || "Add a YouTube URL in the admin")}</span>`;
      return `<div class="video-card">
        <div class="video-thumb">${inner}</div>
        <div class="video-label">${esc(v.label)}</div>
      </div>`;
    })
    .join("\n");
}

function aboutParagraphs() {
  return content.about.bodyParagraphs.map((p) => `<p>${esc(p)}</p>`).join("\n");
}

function gearTags() {
  return content.about.gearTags.map((t) => `<span class="tag">${esc(t)}</span>`).join("\n");
}

function inquiryOptions() {
  return content.contact.inquiryTypes.map((t) => `<option>${esc(t)}</option>`).join("\n");
}

function socialRow() {
  return content.contact.socials
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join("\n");
}

const template = fs.readFileSync(path.join(ROOT, "templates/index.html"), "utf8");

const html = template
  .replace(/{{siteTitle}}/g, esc(content.meta.siteTitle))
  .replace(/{{description}}/g, esc(content.meta.description))
  .replace(/{{brandName}}/g, esc(content.meta.brandName))
  .replace(/{{navLinks}}/g, navLinks())
  .replace(/{{navCtaLabel}}/g, esc(content.nav.ctaLabel))
  .replace(/{{navCtaTarget}}/g, esc(content.nav.ctaTarget))
  .replace(/{{heroEyebrow}}/g, esc(content.hero.eyebrow))
  .replace(/{{heroHeadline}}/g, accentize(esc(content.hero.headline)))
  .replace(/{{heroBody}}/g, esc(content.hero.body))
  .replace(/{{heroImage}}/g, esc(content.hero.heroImage))
  .replace(/{{heroStats}}/g, heroStats())
  .replace(/{{heroTags}}/g, heroTags())
  .replace(/{{marquee}}/g, marquee())
  .replace(/{{streamEyebrow}}/g, esc(content.stream.eyebrow))
  .replace(/{{streamHeading}}/g, esc(content.stream.heading))
  .replace(/{{streamBody}}/g, esc(content.stream.body))
  .replace(/{{scheduleList}}/g, scheduleList())
  .replace(/{{streamEmbed}}/g, embedFrame(content.stream.embedUrl, content.stream.embedNote))
  .replace(/{{musicEyebrow}}/g, esc(content.music.eyebrow))
  .replace(/{{musicHeading}}/g, esc(content.music.heading))
  .replace(/{{musicBody}}/g, esc(content.music.body))
  .replace(/{{featuredEmbed}}/g, embedFrame(content.music.featuredEmbedUrl, content.music.featuredEmbedNote))
  .replace(/{{latestEmbed}}/g, embedFrame(content.music.latestEmbedUrl, content.music.latestEmbedNote))
  .replace(/{{trackList}}/g, trackList())
  .replace(/{{videoEyebrow}}/g, esc(content.video.eyebrow))
  .replace(/{{videoHeading}}/g, esc(content.video.heading))
  .replace(/{{videoBody}}/g, esc(content.video.body))
  .replace(/{{videoGrid}}/g, videoGrid())
  .replace(/{{aboutEyebrow}}/g, esc(content.about.eyebrow))
  .replace(/{{aboutHeading}}/g, esc(content.about.heading))
  .replace(/{{aboutParagraphs}}/g, aboutParagraphs())
  .replace(/{{aboutImage}}/g, esc(content.about.image))
  .replace(/{{gearTags}}/g, gearTags())
  .replace(/{{contactEyebrow}}/g, esc(content.contact.eyebrow))
  .replace(/{{contactHeading}}/g, esc(content.contact.heading))
  .replace(/{{contactBody}}/g, esc(content.contact.body))
  .replace(/{{inquiryOptions}}/g, inquiryOptions())
  .replace(/{{formNote}}/g, esc(content.contact.formNote))
  .replace(/{{confirmationText}}/g, esc(content.contact.confirmationText))
  .replace(/{{directEmail}}/g, esc(content.contact.directEmail))
  .replace(/{{basedIn}}/g, esc(content.contact.basedIn))
  .replace(/{{socialRow}}/g, socialRow())
  .replace(/{{footerBrand}}/g, esc(content.footer.brandName))
  .replace(/{{footerCopyright}}/g, esc(content.footer.copyright));

fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist/index.html"), html);

// Copy static assets
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(path.join(ROOT, "assets"), path.join(ROOT, "dist/assets"));
copyDir(path.join(ROOT, "admin"), path.join(ROOT, "dist/admin"));

// Sevalla reads _headers from the publish directory (dist), not the repo root.
const headersSrc = path.join(ROOT, "_headers");
if (fs.existsSync(headersSrc)) {
  fs.copyFileSync(headersSrc, path.join(ROOT, "dist/_headers"));
}

console.log("Built dist/index.html");

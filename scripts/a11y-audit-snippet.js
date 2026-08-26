/**
 * Contrast / overflow / target-size auditor, injected into a rendered page.
 *
 * Colours are resolved through a canvas rather than parsed from the
 * computed style string: Tailwind v4 emits lab() and oklch(), and parsing
 * those as rgb() produces garbage — an earlier version of this audit
 * reported 73 phantom failures that way.
 *
 * aria-hidden subtrees are excluded, matching axe-core: the contrast
 * requirement applies to text that carries information, and a subtree
 * marked aria-hidden is declared not to.
 */
(() => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const toRGBA = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => { const a = fg[3]; return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const effBg = (el) => {
    let n = el, acc = null;
    while (n && n !== document.documentElement) {
      const c = toRGBA(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { acc = acc === null ? c : over(acc, c); if (acc[3] >= 0.999) return acc; }
      n = n.parentElement;
    }
    const h = toRGBA(getComputedStyle(document.documentElement).backgroundColor);
    const base = h[3] > 0 ? h : [255, 255, 255, 1];
    return acc === null ? base : over(acc, base);
  };

  window.__audit = () => {
    const w = window.innerWidth;
    const fails = [];
    let checked = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
      if (el.closest(".sr-only") || el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      checked++;
      const size = parseFloat(cs.fontSize);
      const need = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
      const bg = effBg(el), fg = toRGBA(cs.color);
      const got = ratio(fg[3] < 1 ? over(fg, bg) : fg, bg);
      if (got < need - 0.005) fails.push({ text: el.textContent.trim().slice(0, 30), ratio: +got.toFixed(2), need, size });
    }
    const small = w <= 414
      ? [...document.querySelectorAll("body a[href],body button")].filter((e) => {
          if (e.closest('[aria-hidden="true"]')) return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24);
        }).map((e) => (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 22))
      : null;
    const noName = [...document.querySelectorAll("body button, body a[href]")].filter((e) => {
      if (e.closest('[aria-hidden="true"]')) return false;
      if (!e.getBoundingClientRect().width) return false;
      return !(e.getAttribute("aria-label") || e.getAttribute("title") || e.textContent.trim() || e.querySelector(".sr-only"));
    }).length;
    return {
      w, textChecked: checked, contrastFails: fails.length, fails: fails.slice(0, 4),
      pageScrollsSideways: document.documentElement.scrollWidth > w + 1,
      smallTargets: small ? small.length : null, smallSample: small ? small.slice(0, 4) : null,
      buttonsWithoutName: noName,
      imagesWithoutAlt: [...document.querySelectorAll("body img")].filter((i) => i.getAttribute("alt") === null).length,
    };
  };
  return "auditor installed";
})();

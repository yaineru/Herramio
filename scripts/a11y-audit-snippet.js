/**
 * Contrast / overflow / accessible-name auditor, injected into a rendered page.
 *
 * Two measurement bugs are baked out of this, both found the hard way:
 *
 * 1. Colours are resolved through a canvas rather than parsed from the
 *    computed-style string. Tailwind v4 emits lab() and oklch(), and
 *    parsing those as rgb() produces garbage — an early version reported
 *    73 phantom failures that way.
 *
 * 2. Background resolution stops at the first OPAQUE layer. A previous
 *    version searched ancestors for a gradient and scored against it even
 *    when the element had its own solid background painted on top, which
 *    reported white-on-emerald-600 as a 1.00 ratio. An opaque background
 *    occludes everything behind it; anything further up is not visible and
 *    must not be measured.
 *
 * Gradients ARE measured when they are the visible layer, and the WORST
 * stop is used — a gradient means contrast varies across the element, and
 * the user sees every part of it. That is how the primary button's
 * emerald-600 -> emerald-500 gradient was caught failing at 2.54:1 on its
 * light end while looking fine on its dark end.
 *
 * aria-hidden subtrees are excluded, matching axe-core: the contrast rule
 * applies to text that carries information.
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

  const GRADIENT_COLOR = /(rgba?\([^)]*\)|lab\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|#[0-9a-fA-F]{3,8})/g;

  /**
   * Every background layer actually visible behind `el`, nearest first.
   * Walks up and STOPS at the first opaque layer, because nothing behind
   * an opaque layer is visible.
   */
  function visibleBackgrounds(el) {
    let node = el;
    let accumulated = null;

    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      const image = style.backgroundImage;

      if (image && image !== "none" && /gradient/.test(image)) {
        const stops = [...image.matchAll(GRADIENT_COLOR)].map((m) => toRGBA(m[1])).filter((c) => c[3] > 0.5);
        if (stops.length) {
          return stops.map((stop) => (accumulated ? over(accumulated, stop) : stop));
        }
      }

      const color = toRGBA(style.backgroundColor);
      if (color[3] > 0) {
        accumulated = accumulated === null ? color : over(accumulated, color);
        if (accumulated[3] >= 0.999) return [accumulated];
      }

      node = node.parentElement;
    }

    const root = toRGBA(getComputedStyle(document.documentElement).backgroundColor);
    const base = root[3] > 0 ? root : [255, 255, 255, 1];
    return [accumulated === null ? base : over(accumulated, base)];
  }

  window.__audit = () => {
    const w = window.innerWidth;
    const fails = [];
    let checked = 0;

    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
      if (el.closest(".sr-only") || el.closest('[aria-hidden="true"]')) continue;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;

      checked++;
      const size = parseFloat(cs.fontSize);
      const need = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
      const fg = toRGBA(cs.color);
      const backgrounds = visibleBackgrounds(el);

      let worst = Infinity;
      for (const bg of backgrounds) worst = Math.min(worst, ratio(fg[3] < 1 ? over(fg, bg) : fg, bg));

      if (worst < need - 0.005) {
        fails.push({ text: el.textContent.trim().slice(0, 30), ratio: +worst.toFixed(2), need, layers: backgrounds.length });
      }
    }

    const unnamed = [...document.querySelectorAll("body button, body a[href]")].filter((e) => {
      if (e.closest('[aria-hidden="true"]')) return false;
      if (!e.getBoundingClientRect().width) return false;
      return !(e.getAttribute("aria-label") || e.getAttribute("title") || e.textContent.trim() || e.querySelector(".sr-only"));
    }).length;

    const small = w <= 414
      ? [...document.querySelectorAll("body a[href],body button")].filter((e) => {
          if (e.closest('[aria-hidden="true"]')) return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24);
        }).length
      : null;

    return {
      page: location.pathname,
      w,
      checked,
      contrastFails: fails.length,
      fails: fails.slice(0, 5),
      scrollsSideways: document.documentElement.scrollWidth > w + 1,
      buttonsWithoutName: unnamed,
      imagesWithoutAlt: [...document.querySelectorAll("body img")].filter((i) => i.getAttribute("alt") === null).length,
      smallTargets: small,
    };
  };

  return "auditor installed";
})();

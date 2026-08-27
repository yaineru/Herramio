/**
 * Design-system coherence auditor, injected into a rendered page.
 *
 * The contrast/overflow auditor next door answers "is this usable". This
 * one answers "is this ONE design", which is a different question and the
 * one that separates a product from a pile of components.
 *
 * It reports what the page actually renders, not what the source intends:
 * every distinct corner radius, every distinct type step, touch targets
 * under the comfortable minimum, and heading levels that skip. A design
 * language is recognisable because these sets are SMALL. Twenty radii is
 * not a style, it is an absence of one.
 *
 * Counting only visible, non-trivial elements on purpose — a 0px radius on
 * a bare <span> is not a design decision and would drown the signal.
 */
(() => {
  const seen = { radii: new Map(), type: new Map(), shadows: new Map() };
  const smallTargets = [];
  const headings = [];
  let counted = 0;

  const isVisible = (el, cs) => {
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const bump = (map, key, el) => {
    const entry = map.get(key) ?? { count: 0, sample: "" };
    entry.count++;
    if (!entry.sample) {
      entry.sample = (el.tagName + "." + (el.className || "").toString().split(/\s+/).slice(0, 2).join(".")).slice(0, 60);
    }
    map.set(key, entry);
  };

  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (!isVisible(el, cs)) continue;
    counted++;
    const rect = el.getBoundingClientRect();

    // --- shape language -------------------------------------------
    const r = cs.borderRadius;
    if (r && r !== "0px" && rect.width >= 24 && rect.height >= 16) bump(seen.radii, r, el);

    // --- elevation -------------------------------------------------
    if (cs.boxShadow && cs.boxShadow !== "none") bump(seen.shadows, cs.boxShadow.slice(0, 70), el);

    // --- type scale (text-bearing leaves only) ---------------------
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasOwnText) bump(seen.type, `${cs.fontSize}/${cs.fontWeight}`, el);

    // --- touch targets ---------------------------------------------
    // 44px is the comfortable floor. Measured on the border box, and
    // inline links inside a paragraph are excluded: they are read, not
    // tapped as controls, and flagging them buries the real ones.
    const tag = el.tagName.toLowerCase();
    const isControl =
      tag === "button" ||
      (tag === "a" && el.getAttribute("href")) ||
      tag === "select" ||
      (tag === "input" && !["hidden"].includes(el.type));
    if (isControl) {
      const inlineInProse = tag === "a" && el.closest("p");
      if (!inlineInProse && (rect.height < 44 || rect.width < 24)) {
        smallTargets.push({
          tag,
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
        });
      }
    }

    if (/^H[1-6]$/.test(el.tagName)) headings.push({ level: +el.tagName[1], text: (el.textContent || "").trim().slice(0, 50) });
  }

  // --- heading order ----------------------------------------------
  const headingIssues = [];
  const h1s = headings.filter((h) => h.level === 1).length;
  if (h1s !== 1) headingIssues.push(`${h1s} elementos H1 (debería haber exactamente 1)`);
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      headingIssues.push(`salto H${headings[i - 1].level} -> H${headings[i].level} en "${headings[i].text}"`);
    }
  }

  const top = (map, n) =>
    [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, n).map(([k, v]) => `${k} (x${v.count})`);

  return {
    width: window.innerWidth,
    elements: counted,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    radii: { distinct: seen.radii.size, values: top(seen.radii, 14) },
    typeSteps: { distinct: seen.type.size, values: top(seen.type, 16) },
    shadows: { distinct: seen.shadows.size },
    smallTargets: { count: smallTargets.length, sample: smallTargets.slice(0, 8) },
    headings: { count: headings.length, issues: headingIssues },
  };
})();

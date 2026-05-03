export function sanitizeHTML(input) {
  const html = String(input ?? "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll(
    "script, style, iframe, object, embed, link, meta, base, form"
  ).forEach(el => el.remove());

  // Optional allowlist for remote images. Empty allows any HTTPS host.
  const ALLOWED_IMG_HOSTS = new Set([
    // "i.imgur.com",
    // "images.unsplash.com",
    // "raw.githubusercontent.com",
  ]);

  const isSafeUrl = (url, { allowDataImage = false, allowHttp = false } = {}) => {
    const v = String(url || "").trim();
    if (!v) return true;

    const lower = v.toLowerCase();

    if (lower.startsWith("#") || lower.startsWith("/") || lower.startsWith("./") || lower.startsWith("../")) return true;
    if (lower.startsWith("mailto:")) return true;

    if (allowDataImage && lower.startsWith("data:image/")) {
      return lower.includes(";base64,");
    }

    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("file:") ||
      lower.startsWith("blob:") ||
      lower.startsWith("data:")
    ) return false;

    if (lower.startsWith("https://") || (allowHttp && lower.startsWith("http://"))) {
      try {
        const u = new URL(v);
        if (ALLOWED_IMG_HOSTS.size === 0) return true;
        return ALLOWED_IMG_HOSTS.has(u.host);
      } catch {
        return false;
      }
    }

    return false;
  };

  doc.querySelectorAll("*").forEach(el => {
    const tag = el.tagName.toLowerCase();

    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || "").trim();

      if (name.startsWith("on") || name === "style") {
        el.removeAttribute(attr.name);
        return;
      }

      if (name === "href") {
        if (!isSafeUrl(value)) el.removeAttribute(attr.name);
        return;
      }

      if (name === "src") {
        if (tag === "img") {
          if (!isSafeUrl(value, { allowDataImage: true, allowHttp: false })) {
            el.removeAttribute(attr.name);
          }
        } else if (!isSafeUrl(value)) {
          el.removeAttribute(attr.name);
        }
        return;
      }

      if (tag !== "img" && name === "srcset") el.removeAttribute(attr.name);
    });

    if (tag === "img") {
      const allowed = new Set(["src", "alt", "title", "width", "height", "loading", "decoding"]);
      [...el.attributes].forEach(attr => {
        if (!allowed.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
      });
      if (!el.getAttribute("loading")) el.setAttribute("loading", "lazy");
      if (!el.getAttribute("decoding")) el.setAttribute("decoding", "async");
    }
  });

  return doc.body.innerHTML;
}

export function exposeSanitizeGlobal() {
  window.sanitizeHTML = sanitizeHTML;
}

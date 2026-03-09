/**
 * Simple HTML sanitizer to prevent XSS in note content.
 * Allows safe formatting tags only.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "sub", "sup", "hr", "font",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "style"]),
  td: new Set(["colspan", "rowspan", "style"]),
  th: new Set(["colspan", "rowspan", "style"]),
  span: new Set(["style"]),
  div: new Set(["style"]),
  p: new Set(["style"]),
  pre: new Set(["style"]),
  code: new Set(["class"]),
  font: new Set(["face", "size", "color"]),
  h1: new Set(["style"]),
  h2: new Set(["style"]),
  h3: new Set(["style"]),
  li: new Set(["style"]),
  ul: new Set(["style"]),
  ol: new Set(["style"]),
  blockquote: new Set(["style"]),
};

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

function sanitizeNode(node: Node): void {
  const toRemove: Node[] = [];

  // Snapshot childNodes to avoid issues with live NodeList mutation
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        // Keep children but remove the tag
        const fragment = document.createDocumentFragment();
        while (el.firstChild) fragment.appendChild(el.firstChild);
        node.insertBefore(fragment, el);
        toRemove.push(el);
        // Re-sanitize the inserted children
        sanitizeNode(node);
        return;
      }

      // Remove disallowed attributes
      const allowed = ALLOWED_ATTRS[tag] || new Set();
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        if (!allowed.has(attr.name)) {
          el.removeAttribute(attr.name);
        }
      }

      // Sanitize href to prevent dangerous URL schemes
      if (tag === "a") {
        const href = (el.getAttribute("href") || "").trim().toLowerCase();
        if (
          href.startsWith("javascript:") ||
          href.startsWith("data:") ||
          href.startsWith("vbscript:")
        ) {
          el.setAttribute("href", "#");
        }
        el.setAttribute("rel", "noopener noreferrer");
      }

      // Sanitize img src (allow data: and https: only)
      if (tag === "img") {
        const src = el.getAttribute("src") || "";
        if (
          !src.startsWith("data:image/") &&
          !src.startsWith("https://") &&
          !src.startsWith("blob:")
        ) {
          el.setAttribute("src", "");
        }
      }

      sanitizeNode(el);
    } else if (child.nodeType === Node.COMMENT_NODE) {
      toRemove.push(child);
    }
  }

  for (const rm of toRemove) {
    node.removeChild(rm);
  }
}

/**
 * Strip all HTML tags, return plain text.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Convert HTML content to simple Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");

  // Bold / italic / underline
  md = md.replace(/<(b|strong)[^>]*>(.*?)<\/(b|strong)>/gi, "**$2**");
  md = md.replace(/<(i|em)[^>]*>(.*?)<\/(i|em)>/gi, "*$2*");
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, "$1");

  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?[ou]l[^>]*>/gi, "\n");

  // Blockquote
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");

  // Code
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Paragraphs & breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>/gi, "");
  md = md.replace(/<\/p>/gi, "\n\n");

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, "\n---\n\n");

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  return md;
}

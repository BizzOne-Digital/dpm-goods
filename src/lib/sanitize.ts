import "server-only";
import sanitizeHtml from "sanitize-html";

/** Whitelist sanitizer for admin-authored rich text (blog posts, legal pages). */
export function sanitizeRichText(html?: string | null): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "blockquote", "img", "hr"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/** Converts plain text (with blank-line paragraphs) into safe HTML. */
export function textToHtml(text?: string | null): string {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeRichText(text);
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${sanitizeHtml(p, { allowedTags: [], allowedAttributes: {} }).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

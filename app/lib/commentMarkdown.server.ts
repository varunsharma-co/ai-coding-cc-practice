import { lexer, type Token, type Tokens } from "marked";

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:"]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSafeHttpUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return SAFE_LINK_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function literalBlock(raw: string): string {
  const text = raw.replace(/\n$/, "");
  if (text.length === 0) return "";
  return `<p style="white-space:pre-wrap">${escapeHtml(text)}</p>`;
}

function renderLink(token: Tokens.Link): string {
  if (!isSafeHttpUrl(token.href)) return escapeHtml(token.raw);
  const inner = renderTokens(token.tokens);
  return `<a href="${escapeHtml(token.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
}

function isListToken(token: Token): token is Tokens.List {
  return token.type === "list" && "items" in token;
}

function isLinkToken(token: Token): token is Tokens.Link {
  return token.type === "link" && "href" in token;
}

function renderList(token: Tokens.List): string {
  const tag = token.ordered ? "ol" : "ul";
  const startAttr =
    token.ordered && typeof token.start === "number" && token.start !== 1
      ? ` start="${token.start}"`
      : "";
  const items = token.items
    .map((item) => {
      const prefix = item.task ? (item.checked ? "[x] " : "[ ] ") : "";
      return `<li>${prefix}${renderTokens(item.tokens)}</li>`;
    })
    .join("");
  return `<${tag}${startAttr}>${items}</${tag}>`;
}

function renderToken(token: Token): string {
  switch (token.type) {
    case "space":
    case "def":
    case "checkbox":
      return "";
    case "paragraph":
      return `<p>${renderTokens(token.tokens)}</p>`;
    case "blockquote":
      return `<blockquote>${renderTokens(token.tokens)}</blockquote>`;
    case "list":
      return isListToken(token) ? renderList(token) : literalBlock(token.raw);
    case "list_item":
      return `<li>${renderTokens(token.tokens)}</li>`;
    case "code":
      if (token.codeBlockStyle === "indented") return literalBlock(token.raw);
      return `<pre><code>${escapeHtml(token.text)}</code></pre>`;
    case "codespan":
      return `<code>${escapeHtml(token.text)}</code>`;
    case "heading":
    case "hr":
    case "table":
    case "html":
      return literalBlock(token.raw);
    case "strong":
      return `<strong>${renderTokens(token.tokens)}</strong>`;
    case "em":
      return `<em>${renderTokens(token.tokens)}</em>`;
    case "del":
      return `<del>${renderTokens(token.tokens)}</del>`;
    case "br":
      return "<br>";
    case "link":
      return isLinkToken(token) ? renderLink(token) : literalBlock(token.raw);
    case "image":
      return escapeHtml(token.raw);
    case "escape":
      return escapeHtml(token.text);
    case "text":
      return token.tokens ? renderTokens(token.tokens) : escapeHtml(token.text);
    default:
      return token.raw ? literalBlock(token.raw) : "";
  }
}

function renderTokens(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens.map(renderToken).join("");
}

// Renders the comment subset of markdown. Disallowed syntax is escaped and
// shown as the characters the author typed.
export function renderCommentMarkdown(markdown: string): string {
  return renderTokens(lexer(markdown, { gfm: true, breaks: false }));
}

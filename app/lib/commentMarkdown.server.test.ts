import { describe, expect, it } from "vitest";
import { renderCommentMarkdown } from "./commentMarkdown.server";

describe("renderCommentMarkdown", () => {
  it("renders the allowed subset", () => {
    const html = renderCommentMarkdown(
      [
        "Hello **bold** *italic* ~~gone~~",
        "",
        "- one",
        "- two",
        "",
        "1. first",
        "",
        "> quoted",
        "",
        "Use `a < b`",
        "",
        "```js",
        "const x = 1;",
        "```",
        "",
        "[docs](https://example.com/docs)",
        "",
        "See https://example.com/plain",
      ].join("\n")
    );

    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<del>gone</del>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<code>a &lt; b</code>");
    expect(html).toContain("<pre><code>const x = 1;</code></pre>");
    expect(html).toContain(
      '<a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">docs</a>'
    );
    expect(html).toContain(
      '<a href="https://example.com/plain" target="_blank" rel="noopener noreferrer">https://example.com/plain</a>'
    );
  });

  it("renders link text with inline markdown", () => {
    const html = renderCommentMarkdown("[**hi**](http://example.com)");
    expect(html).toContain('href="http://example.com"');
    expect(html).toContain("<strong>hi</strong>");
    expect(html).toContain('target="_blank"');
  });

  it("shows disallowed syntax as text", () => {
    const html = renderCommentMarkdown(
      [
        "# Title",
        "",
        "![cat](https://example.com/cat.png)",
        "",
        "<script>alert(1)</script>",
        "",
        "[click](javascript:alert(1))",
        "",
        "[mail](mailto:a@example.com)",
      ].join("\n")
    );

    expect(html).toContain("# Title");
    expect(html).toContain("![cat](https://example.com/cat.png)");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("javascript:alert(1)");
    expect(html).toContain("mailto:a@example.com");
    expect(html).not.toMatch(/<h1|<img|<script|<a /);
  });

  it("shows an indented code block as text", () => {
    const html = renderCommentMarkdown("    const hidden = true;");
    expect(html).toContain("const hidden = true;");
    expect(html).not.toContain("<pre>");
  });
});

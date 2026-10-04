import { Fragment } from "react";

/**
 * Minimal, safe renderer for blog content (no raw HTML).
 * Supports: "# / ## / ###" headings, "- " lists, blank-line paragraphs,
 * and inline **bold**.
 */
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function BlogContent({ content }) {
  const blocks = (content || "").replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="space-y-5 text-base leading-8 text-muted-foreground">
      {blocks.map((block, i) => {
        const text = block.trim();
        if (!text) return null;

        const heading = text.match(/^(#{1,3})\s+(.*)$/s);
        if (heading) {
          const level = heading[1].length;
          const cls =
            level === 1
              ? "text-3xl mt-10"
              : level === 2
              ? "text-2xl mt-8"
              : "text-xl mt-6";
          return (
            <h2 key={i} className={`font-heading font-bold text-foreground ${cls}`}>
              {heading[2]}
            </h2>
          );
        }

        const lines = text.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-6 marker:text-primary">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

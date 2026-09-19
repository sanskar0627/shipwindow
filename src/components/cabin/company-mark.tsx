/**
 * Company marks, drawn rather than fetched: two small glyphs on a tinted
 * disc, sized and weighted to sit together on the chart.
 *
 * Senzary reads as a sensor — a node with its signal going out. M81 is the
 * catalogue number of Bode's Galaxy, so it gets a two-arm spiral. Both are
 * built from the same ingredients (a 2px core, 1.5 stroke, one hue) so the
 * column stays quiet when there are more of them.
 */

type MarkId = "senzary" | "m81";

const SPIRAL_ARM = "M2.4 -2.6 C6.6 -3.4 9.4 0.4 8.4 4.4 C7.6 7.6 4.6 9.4 1.4 9";

function Glyph({ id }: { id: MarkId }) {
  if (id === "senzary") {
    return (
      <>
        <circle cx="0" cy="0" r="2.4" fill="currentColor" />
        <path
          d="M3.4 -5.2 A6.2 6.2 0 0 1 3.4 5.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5.8 -9.2 A11 11 0 0 1 5.8 9.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M-3.4 -5.2 A6.2 6.2 0 0 0 -3.4 5.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </>
    );
  }
  return (
    <>
      <circle cx="0" cy="0" r="3" fill="currentColor" />
      <circle
        cx="0"
        cy="0"
        r="5.2"
        fill="currentColor"
        opacity="0.22"
        transform="rotate(-24) scale(1 0.62)"
      />
      <path
        d={SPIRAL_ARM}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={SPIRAL_ARM}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform="rotate(180)"
      />
    </>
  );
}

export function CompanyMark({ id, name }: { id: MarkId; name: string }) {
  return (
    <span className="mark" data-mark={id} title={name}>
      <svg viewBox="-16 -16 32 32" role="presentation" aria-hidden="true">
        <Glyph id={id} />
      </svg>
    </span>
  );
}

/**
 * A SOLAS-style foam lifejacket on a steel hook above the porthole.
 * Drawn in SVG so it stays sharp, takes the cabin light, and sways in time
 * with the ship's roll. The hook is a separate layer: after dark the foam
 * sinks into the room while the steel keeps catching the light.
 */

const LEFT_PANEL =
  "M48 21C40 21 27 23 21 29C15 35 13 45 13 57V151C13 160 18 165 27 165H54C57.5 165 59 163 59 159V76C59 64 54.5 57 51 49C48 42 46.5 32 48 21Z";
const RIGHT_PANEL =
  "M72 21C80 21 93 23 99 29C105 35 107 45 107 57V151C107 160 102 165 93 165H66C62.5 165 61 163 61 159V76C61 64 65.5 57 69 49C72 42 73.5 32 72 21Z";
const COLLAR =
  "M47 21C51 13 69 13 73 21C73.5 34 72 48 69 58L61.5 82H58.5L51 58C48 48 46.5 34 47 21Z";

const TAPES = [
  { x: 17, y: 64, w: 38, h: 6.4 },
  { x: 65, y: 64, w: 38, h: 6.4 },
  { x: 17, y: 133, w: 38, h: 6.4 },
  { x: 65, y: 133, w: 38, h: 6.4 },
];

export function LifeJacket() {
  return (
    <figure className="lifejacket" aria-hidden="true">
      <div className="lifejacket-sway">
        {/* ── the jacket ── */}
        <svg
          className="lifejacket-body"
          viewBox="0 0 120 176"
          role="presentation"
        >
          <defs>
            <linearGradient id="lj-foam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8e3415" />
              <stop offset="0.16" stopColor="#c8571f" />
              <stop offset="0.44" stopColor="#e2702f" />
              <stop offset="0.74" stopColor="#c0501f" />
              <stop offset="1" stopColor="#822d10" />
            </linearGradient>
            <linearGradient id="lj-fall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
              <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.75" stopColor="#000" stopOpacity="0.08" />
              <stop offset="1" stopColor="#000" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lj-channel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.22" />
              <stop offset="0.32" stopColor="#000" stopOpacity="0" />
              <stop offset="0.56" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="1" stopColor="#000" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="lj-tape" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d2d5d8" />
              <stop offset="0.45" stopColor="#a7acb1" />
              <stop offset="1" stopColor="#868c92" />
            </linearGradient>
            <linearGradient id="lj-web" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6e3dc" />
              <stop offset="1" stopColor="#c2bfb7" />
            </linearGradient>
            <filter id="lj-cloth" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.7"
                numOctaves="2"
                seed="3"
              />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.2 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <radialGradient id="lj-keylight" cx="0.24" cy="0.16" r="0.85">
              <stop offset="0" stopColor="#fff6ea" stopOpacity="0.5" />
              <stop offset="0.42" stopColor="#ffe8cf" stopOpacity="0.14" />
              <stop offset="1" stopColor="#ffe8cf" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lj-occlude" x1="0.1" y1="0" x2="1" y2="1">
              <stop offset="0.38" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#05070c" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="lj-rimgrad" x1="0" y1="0" x2="0.75" y2="0.75">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.5" stopColor="#000" />
            </linearGradient>
            <mask id="lj-rim">
              <rect
                x="0"
                y="0"
                width="120"
                height="176"
                fill="url(#lj-rimgrad)"
              />
            </mask>
            <clipPath id="lj-body">
              <path d={LEFT_PANEL} />
              <path d={RIGHT_PANEL} />
            </clipPath>
          </defs>

          {/* the inside of the back, seen through the neck */}
          <path d={COLLAR} fill="#5f220b" />
          <path d={COLLAR} fill="url(#lj-fall)" opacity="0.7" />

          {/* webbing loop, hooked over the steel */}
          <g className="lj-loop">
            <path
              d="M55.4 26 Q56.4 13.2 64.6 13.8 Q71.6 14.4 68.4 26"
              fill="none"
              stroke="#d4d0c7"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <path
              d="M56.3 26 Q57.2 14.4 64.6 14.9"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.4"
              strokeWidth="0.7"
            />
          </g>

          <path d={LEFT_PANEL} fill="url(#lj-foam)" />
          <path d={RIGHT_PANEL} fill="url(#lj-foam)" />

          <g clipPath="url(#lj-body)">
            {[13, 29.5, 45, 61, 76.5, 92].map((x) => (
              <rect
                key={x}
                x={x}
                y="55"
                width={x === 45 || x === 61 ? 14 : 15.5}
                height="112"
                fill="url(#lj-channel)"
              />
            ))}
            <g className="lj-stitch">
              {[29.5, 45, 76.5, 92].map((x) => (
                <g key={`s${x}`}>
                  <line
                    x1={x}
                    y1="57"
                    x2={x}
                    y2="163"
                    stroke="#5d1e08"
                    strokeWidth="0.7"
                    strokeDasharray="1.6 1.2"
                  />
                  <line
                    x1={x + 0.8}
                    y1="57"
                    x2={x + 0.8}
                    y2="163"
                    stroke="#fff"
                    strokeOpacity="0.3"
                    strokeWidth="0.5"
                  />
                </g>
              ))}
              <path
                d="M13 55 H107"
                stroke="#5d1e08"
                strokeWidth="0.7"
                strokeDasharray="1.6 1.2"
              />
            </g>

            <g className="lj-tapes">
              {TAPES.map((t) => (
                <g key={`${t.x}-${t.y}`}>
                  <rect
                    x={t.x}
                    y={t.y}
                    width={t.w}
                    height={t.h}
                    rx="0.6"
                    fill="url(#lj-tape)"
                  />
                  <line
                    x1={t.x}
                    y1={t.y + t.h + 0.3}
                    x2={t.x + t.w}
                    y2={t.y + t.h + 0.3}
                    stroke="#000"
                    strokeOpacity="0.22"
                    strokeWidth="0.7"
                  />
                </g>
              ))}
            </g>

            <g className="lj-web">
              <rect x="10" y="100" width="100" height="7" fill="url(#lj-web)" />
              <rect
                x="10"
                y="107"
                width="100"
                height="1.4"
                fill="#000"
                opacity="0.18"
              />
              <rect
                x="19"
                y="147"
                width="14"
                height="9"
                rx="0.6"
                fill="#ded9d0"
              />
              <rect x="21" y="149.2" width="10" height="0.9" fill="#77736b" />
              <rect x="21" y="151.4" width="7" height="0.9" fill="#9d998f" />
              <rect x="21" y="153.4" width="8.5" height="0.9" fill="#9d998f" />
            </g>

            {/* buckle */}
            <rect
              x="52.5"
              y="97.4"
              width="15"
              height="12.4"
              rx="2"
              fill="#191b1e"
            />
            <rect
              x="53.4"
              y="98.2"
              width="13.2"
              height="1.1"
              rx="0.55"
              fill="#fff"
              opacity="0.16"
            />
            <rect
              x="55.6"
              y="101.6"
              width="8.8"
              height="4"
              rx="1"
              fill="#2a2d31"
            />

            {/* one key from the upper left, and the flank that turns away from it */}
            <rect x="0" y="0" width="120" height="176" fill="url(#lj-fall)" />
            <rect
              className="lj-key"
              x="0"
              y="0"
              width="120"
              height="176"
              fill="url(#lj-keylight)"
            />
            <rect
              className="lj-shade"
              x="0"
              y="0"
              width="120"
              height="176"
              fill="url(#lj-occlude)"
            />
            <rect
              x="0"
              y="0"
              width="120"
              height="176"
              filter="url(#lj-cloth)"
              fill="#000"
            />
            {/* edges roll away from the light, so the silhouette never reads as a cut-out */}
            <path
              className="lj-roll"
              d={LEFT_PANEL}
              fill="none"
              stroke="#2a0c02"
              strokeWidth="7"
            />
            <path
              className="lj-roll"
              d={RIGHT_PANEL}
              fill="none"
              stroke="#2a0c02"
              strokeWidth="7"
            />
          </g>

          {/* moonlight catching the edge that faces the key */}
          <g className="lj-rimlight" mask="url(#lj-rim)">
            <path
              d={LEFT_PANEL}
              fill="none"
              stroke="#b9cdeb"
              strokeWidth="1.1"
            />
            <path
              d={RIGHT_PANEL}
              fill="none"
              stroke="#b9cdeb"
              strokeWidth="1.1"
            />
          </g>

          <g className="lj-seam">
            <path d="M60 60 V165" stroke="#4a1705" strokeWidth="1.1" />
          </g>
        </svg>

        {/* ── the hook: steel, and still steel after dark ── */}
        <svg
          className="lifejacket-hook"
          viewBox="0 0 120 176"
          role="presentation"
        >
          <defs>
            <linearGradient id="lj-steel" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#f7f8f9" />
              <stop offset="0.42" stopColor="#b9bfc5" />
              <stop offset="0.72" stopColor="#787f86" />
              <stop offset="1" stopColor="#c8ced4" />
            </linearGradient>
            <linearGradient id="lj-plate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9ecee" />
              <stop offset="0.5" stopColor="#aab0b6" />
              <stop offset="1" stopColor="#6f767d" />
            </linearGradient>
          </defs>
          {/* wall plate */}
          <ellipse cx="60" cy="4.5" rx="6.2" ry="5.6" fill="url(#lj-plate)" />
          <ellipse
            cx="60"
            cy="4.2"
            rx="6.2"
            ry="5.6"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="0.6"
          />
          <circle cx="60" cy="4.5" r="1.2" fill="#4e545a" />
          {/* the hook itself, curling forward */}
          <path
            d="M60 8.6 V12.4 Q60 17.6 65.2 17.6 Q69.6 17.6 69.6 13.4"
            fill="none"
            stroke="url(#lj-steel)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M60 9.4 V12.4 Q60 16.7 65.1 16.7"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <figcaption className="lifejacket-tag">Lifejacket · 7021</figcaption>
    </figure>
  );
}

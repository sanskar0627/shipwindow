/**
 * A SOLAS-style foam lifejacket hanging from a steel hook beside the porthole.
 * Drawn in SVG so it stays sharp, takes the cabin light, and sways in time
 * with the ship's roll (same period as the sea behind the glass).
 */

const LEFT_PANEL =
  "M48 21C40 21 27 23 21 29C15 35 13 45 13 57V151C13 160 18 165 27 165H54C57.5 165 59 163 59 159V76C59 64 54.5 57 51 49C48 42 46.5 32 48 21Z";
const RIGHT_PANEL =
  "M72 21C80 21 93 23 99 29C105 35 107 45 107 57V151C107 160 102 165 93 165H66C62.5 165 61 163 61 159V76C61 64 65.5 57 69 49C72 42 73.5 32 72 21Z";
const COLLAR =
  "M47 21C51 13 69 13 73 21C73.5 34 72 48 69 58L61.5 82H58.5L51 58C48 48 46.5 34 47 21Z";

// retro-reflective patches
const TAPES = [
  { x: 17, y: 64, w: 38, h: 7 },
  { x: 65, y: 64, w: 38, h: 7 },
  { x: 17, y: 133, w: 38, h: 7 },
  { x: 65, y: 133, w: 38, h: 7 },
];

function Tapes({ fill }: { fill: string }) {
  return (
    <>
      {TAPES.map((t) => (
        <rect
          key={`${t.x}-${t.y}`}
          x={t.x}
          y={t.y}
          width={t.w}
          height={t.h}
          rx="0.8"
          fill={fill}
        />
      ))}
    </>
  );
}

export function LifeJacket() {
  return (
    <figure className="lifejacket" aria-hidden="true">
      <div className="lifejacket-sway">
        <svg
          className="lifejacket-svg"
          viewBox="0 0 120 176"
          role="presentation"
        >
          <defs>
            <linearGradient id="lj-foam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a8401a" />
              <stop offset="0.18" stopColor="#d9602a" />
              <stop offset="0.42" stopColor="#ec7837" />
              <stop offset="0.7" stopColor="#d45a25" />
              <stop offset="1" stopColor="#933613" />
            </linearGradient>
            <linearGradient id="lj-fall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
              <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.8" stopColor="#000" stopOpacity="0.05" />
              <stop offset="1" stopColor="#000" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="lj-channel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.2" />
              <stop offset="0.3" stopColor="#000" stopOpacity="0" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.07" />
              <stop offset="1" stopColor="#000" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id="lj-tape" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e4e6e8" />
              <stop offset="0.45" stopColor="#b9bdc2" />
              <stop offset="1" stopColor="#8e949a" />
            </linearGradient>
            <linearGradient id="lj-web" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2f0eb" />
              <stop offset="1" stopColor="#cfccc4" />
            </linearGradient>
            <linearGradient id="lj-steel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f5f6" />
              <stop offset="0.5" stopColor="#a4aab0" />
              <stop offset="1" stopColor="#5f656b" />
            </linearGradient>
            <filter id="lj-cloth" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.6"
                numOctaves="2"
                seed="3"
              />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <clipPath id="lj-body">
              <path d={LEFT_PANEL} />
              <path d={RIGHT_PANEL} />
            </clipPath>
          </defs>

          {/* hook and hanging loop */}
          <path
            d="M57.5 22 L58.6 8.5 Q60 4.8 61.4 8.5 L62.5 22"
            fill="none"
            stroke="#d8d5ce"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="4.2" r="3.6" fill="url(#lj-steel)" />
          <circle cx="60" cy="4.2" r="1.1" fill="#4b5055" />
          <path
            d="M60 5.5 V9.4 Q60 12 62.2 11.4"
            fill="none"
            stroke="url(#lj-steel)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* inside of the back, seen through the neck */}
          <path d={COLLAR} fill="#6f280e" />
          <path d={COLLAR} fill="url(#lj-fall)" opacity="0.6" />

          {/* foam panels */}
          <path d={LEFT_PANEL} fill="url(#lj-foam)" />
          <path d={RIGHT_PANEL} fill="url(#lj-foam)" />

          <g clipPath="url(#lj-body)">
            {/* quilted foam channels */}
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
            {[29.5, 45, 76.5, 92].map((x) => (
              <g key={`s${x}`}>
                <line
                  x1={x}
                  y1="57"
                  x2={x}
                  y2="163"
                  stroke="#6e260c"
                  strokeOpacity="0.45"
                  strokeWidth="0.7"
                  strokeDasharray="1.6 1.2"
                />
                <line
                  x1={x + 0.8}
                  y1="57"
                  x2={x + 0.8}
                  y2="163"
                  stroke="#fff"
                  strokeOpacity="0.12"
                  strokeWidth="0.5"
                />
              </g>
            ))}
            <path
              d="M13 55 H107"
              stroke="#6e260c"
              strokeOpacity="0.4"
              strokeWidth="0.7"
              strokeDasharray="1.6 1.2"
            />

            <Tapes fill="url(#lj-tape)" />
            {TAPES.map((t) => (
              <line
                key={`tl${t.x}${t.y}`}
                x1={t.x}
                y1={t.y + t.h + 0.4}
                x2={t.x + t.w}
                y2={t.y + t.h + 0.4}
                stroke="#000"
                strokeOpacity="0.18"
                strokeWidth="0.8"
              />
            ))}

            {/* waist strap */}
            <rect x="10" y="100" width="100" height="7.5" fill="url(#lj-web)" />
            <line
              x1="10"
              y1="101.4"
              x2="110"
              y2="101.4"
              stroke="#000"
              strokeOpacity="0.1"
              strokeWidth="0.4"
              strokeDasharray="1.2 1"
            />
            <line
              x1="10"
              y1="106.2"
              x2="110"
              y2="106.2"
              stroke="#000"
              strokeOpacity="0.1"
              strokeWidth="0.4"
              strokeDasharray="1.2 1"
            />
            <rect
              x="10"
              y="107.5"
              width="100"
              height="1.4"
              fill="#000"
              opacity="0.14"
            />

            {/* manufacturer's label */}
            <rect
              x="19"
              y="147"
              width="14"
              height="9"
              rx="0.6"
              fill="#f1efe9"
            />
            <rect x="21" y="149.2" width="10" height="0.9" fill="#77736b" />
            <rect x="21" y="151.4" width="7" height="0.9" fill="#9d998f" />
            <rect x="21" y="153.4" width="8.5" height="0.9" fill="#9d998f" />

            {/* light falloff and cloth texture */}
            <rect x="0" y="0" width="120" height="176" fill="url(#lj-fall)" />
            <rect
              x="0"
              y="0"
              width="120"
              height="176"
              filter="url(#lj-cloth)"
              fill="#000"
            />
          </g>

          {/* seam between the panels + edge binding */}
          <path
            d="M60 60 V165"
            stroke="#5a1f09"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
          <path
            d={LEFT_PANEL}
            fill="none"
            stroke="#7a2b0e"
            strokeOpacity="0.55"
            strokeWidth="0.9"
          />
          <path
            d={RIGHT_PANEL}
            fill="none"
            stroke="#7a2b0e"
            strokeOpacity="0.55"
            strokeWidth="0.9"
          />

          {/* buckle */}
          <rect
            x="52.5"
            y="97.6"
            width="15"
            height="12.4"
            rx="2"
            fill="#1c1e21"
          />
          <rect
            x="53.4"
            y="98.4"
            width="13.2"
            height="1.2"
            rx="0.6"
            fill="#fff"
            opacity="0.18"
          />
          <rect
            x="55.6"
            y="101.8"
            width="8.8"
            height="4"
            rx="1"
            fill="#2c2f33"
          />
          <rect
            x="59.4"
            y="97.6"
            width="1.2"
            height="12.4"
            fill="#000"
            opacity="0.45"
          />
        </svg>

        {/* retro-reflective tape picks up the cabin light after dark */}
        <svg
          className="lifejacket-glint"
          viewBox="0 0 120 176"
          role="presentation"
        >
          <Tapes fill="#dfe6ff" />
        </svg>
      </div>
      <figcaption className="lifejacket-tag">Lifejacket · 7021</figcaption>
    </figure>
  );
}

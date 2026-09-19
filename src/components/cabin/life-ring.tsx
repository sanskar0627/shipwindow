/**
 * A lifebuoy on its bracket, port side of the porthole and a little lower.
 * Same lighting as everything else on this wall: key from the upper left,
 * occlusion to the lower right.
 */

const R = 40; // band radius
const C = 2 * Math.PI * R; // circumference, for the four painted quadrants

export function LifeRing() {
  return (
    <div className="lifering" aria-hidden="true">
      <div className="lifering-sway">
        <svg
          className="lifering-body"
          viewBox="0 0 120 130"
          role="presentation"
        >
          <defs>
            <linearGradient id="lr-foam" x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0" stopColor="#fbf8f2" />
              <stop offset="0.45" stopColor="#e6e1d7" />
              <stop offset="1" stopColor="#b9b3a7" />
            </linearGradient>
            <linearGradient id="lr-band" x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0" stopColor="#e2702f" />
              <stop offset="0.5" stopColor="#c8571f" />
              <stop offset="1" stopColor="#8e3415" />
            </linearGradient>
            <radialGradient id="lr-key" cx="0.26" cy="0.2" r="0.8">
              <stop offset="0" stopColor="#fffaf0" stopOpacity="0.45" />
              <stop offset="0.5" stopColor="#fff2de" stopOpacity="0.1" />
              <stop offset="1" stopColor="#fff2de" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lr-occlude" x1="0.15" y1="0.05" x2="1" y2="1">
              <stop offset="0.4" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#05070c" stopOpacity="0.45" />
            </linearGradient>
            <mask id="lr-ringmask">
              <circle
                cx="60"
                cy="68"
                r={R}
                fill="none"
                stroke="#fff"
                strokeWidth="19"
              />
            </mask>
          </defs>

          {/* bracket: a short steel peg the ring hangs on */}
          <g className="lr-peg">
            <rect
              x="55.5"
              y="11"
              width="9"
              height="4.5"
              rx="2.2"
              fill="#aeb4ba"
            />
            <rect
              x="57.5"
              y="14"
              width="5"
              height="9"
              rx="2.5"
              fill="#c9ced3"
            />
            <circle cx="60" cy="13.2" r="1.1" fill="#4e545a" />
          </g>

          {/* the ring itself */}
          <g mask="url(#lr-ringmask)">
            <rect x="12" y="20" width="96" height="96" fill="url(#lr-foam)" />
            <circle
              cx="60"
              cy="68"
              r={R}
              fill="none"
              stroke="url(#lr-band)"
              strokeWidth="19"
              strokeDasharray={`${C / 8} ${C / 8}`}
              strokeDashoffset={C / 16}
            />
            {/* the bands are taped on, so they sit a hair proud of the foam */}
            <circle
              cx="60"
              cy="68"
              r={R}
              fill="none"
              stroke="#000"
              strokeOpacity="0.16"
              strokeWidth="19"
              strokeDasharray={`0.8 ${C / 8 - 0.8}`}
              strokeDashoffset={C / 16}
            />
            <rect
              className="lr-cool"
              x="12"
              y="20"
              width="96"
              height="96"
              fill="#5f7ba6"
            />
            <rect
              className="lr-key"
              x="12"
              y="20"
              width="96"
              height="96"
              fill="url(#lr-key)"
            />
            <rect
              className="lr-shade"
              x="12"
              y="20"
              width="96"
              height="96"
              fill="url(#lr-occlude)"
            />
          </g>

          {/* form: the tube turns away at both edges */}
          <circle
            className="lr-roll"
            cx="60"
            cy="68"
            r={R}
            fill="none"
            stroke="#2a0c02"
            strokeWidth="19"
            mask="url(#lr-ringmask)"
          />
          <circle
            cx="60"
            cy="68"
            r={R + 9.5}
            fill="none"
            stroke="#000"
            strokeOpacity="0.2"
            strokeWidth="0.8"
          />
          <circle
            cx="60"
            cy="68"
            r={R - 9.5}
            fill="none"
            stroke="#000"
            strokeOpacity="0.26"
            strokeWidth="0.9"
          />

          {/* grab line: four short loops of rope around the tube */}
          <g className="lr-rope">
            {[38, 128, 218, 308].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const x = 60 + Math.cos(a) * R;
              const y = 68 + Math.sin(a) * R;
              return (
                <g
                  key={deg}
                  transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg})`}
                >
                  <path
                    d="M-11.5 0 Q0 -3.4 11.5 0"
                    fill="none"
                    stroke="#cfc6b3"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M-11.5 0.9 Q0 -2.5 11.5 0.9"
                    fill="none"
                    stroke="#000"
                    strokeOpacity="0.18"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

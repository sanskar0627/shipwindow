/**
 * SOLAS ring buoy on its bracket, port side of the porthole and a little lower.
 *
 * Built the way the object is built: a moulded foam torus in the regulation
 * proportion (outer Ø 750 : inner Ø 440, so the tube is a fifth of the whole),
 * four painted quadrants and four strips of retro-reflective tape across the
 * tube. No grab line — stowed rings are often shipped without one, and the
 * bare torus is the cleaner read against this wall.
 *
 * It hangs square: the bracket is on the centre line, the paint and tape are
 * symmetric about it, and the roll swings it evenly either side of vertical.
 *
 * The shading is modelled here rather than dialled in with a brightness
 * filter, because the filter is what made it read as a sticker after dark: it
 * crushed paint, tape and foam to one value at once. Instead the layers go in
 * the order light actually arrives — albedo, the round of the tube, the night
 * wash, then the one key from the upper left, its specular along the crown,
 * the occluded flank, and last the cool edges the moonlight leaves. Only the
 * layers above the wash survive into the dark, which is what keeps it an
 * object and not a silhouette.
 */

const CX = 74;
const CY = 90;
const R = 46; // centre line of the tube
const W = 24; // tube thickness
const OUTER = R + W / 2; // 58
const INNER = R - W / 2; // 34 — the eye, 0.59 of the outer, as regulation
const C = 2 * Math.PI * R;
const QUAD = C / 8; // four painted quadrants, four bare ones
const VW = 148;
const VH = 168;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const at = (deg: number, r: number): [number, number] => [
  CX + Math.cos(rad(deg)) * r,
  CY + Math.sin(rad(deg)) * r,
];
const n = (v: number) => v.toFixed(2);

const TAPES = [45, 135, 225, 315]; // retro-reflective, on the painted quadrants

export function LifeRing() {
  return (
    <div className="lifering" aria-hidden="true">
      <div className="lifering-sway">
        <svg
          className="lifering-body"
          viewBox={`0 0 ${VW} ${VH}`}
          role="presentation"
        >
          <defs>
            {/* the cross-section of the tube: dark where it turns away at
                both edges, bright along the crown — what makes it read as
                round rather than flat */}
            <radialGradient
              id="lr-form"
              gradientUnits="userSpaceOnUse"
              cx={CX}
              cy={CY}
              r={OUTER}
            >
              <stop offset={INNER / OUTER} stopColor="#000" stopOpacity="0.5" />
              <stop offset="0.64" stopColor="#000" stopOpacity="0.26" />
              <stop offset="0.71" stopColor="#000" stopOpacity="0.05" />
              <stop offset="0.79" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="0.88" stopColor="#000" stopOpacity="0.1" />
              <stop offset="0.95" stopColor="#000" stopOpacity="0.3" />
              <stop offset="1" stopColor="#000" stopOpacity="0.54" />
            </radialGradient>

            {/* one key, upper left: warm while there is daylight in the room,
                cool once there is only the moon */}
            <radialGradient id="lr-keywarm" cx="0.26" cy="0.16" r="0.82">
              <stop offset="0" stopColor="#fff7e8" stopOpacity="0.5" />
              <stop offset="0.46" stopColor="#fff0d8" stopOpacity="0.13" />
              <stop offset="1" stopColor="#fff0d8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lr-keycool" cx="0.24" cy="0.13" r="0.8">
              <stop offset="0" stopColor="#c6dbff" stopOpacity="0.46" />
              <stop offset="0.44" stopColor="#9fb9e4" stopOpacity="0.12" />
              <stop offset="1" stopColor="#9fb9e4" stopOpacity="0" />
            </radialGradient>

            {/* the flank that turns away from it */}
            <linearGradient id="lr-occlude" x1="0.18" y1="0.06" x2="1" y2="1">
              <stop offset="0.34" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#04060b" stopOpacity="0.58" />
            </linearGradient>
            {/* what the deck throws back up at it */}
            <linearGradient id="lr-bounce" x1="0" y1="1" x2="0.2" y2="0.35">
              <stop offset="0" stopColor="#7d94bb" stopOpacity="0.3" />
              <stop offset="1" stopColor="#7d94bb" stopOpacity="0" />
            </linearGradient>

            {/* moonlight only reaches the room through this much wash. It is
                pitched to land the foam and the paint on the same values as
                the lifejacket across the porthole, so the two read as one
                room rather than two drawings */}
            <linearGradient id="lr-nightwash" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#1e2029" />
              <stop offset="1" stopColor="#10121a" />
            </linearGradient>

            <linearGradient id="lr-steel" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#f2f4f6" />
              <stop offset="0.44" stopColor="#b2b8be" />
              <stop offset="0.78" stopColor="#6d747b" />
              <stop offset="1" stopColor="#aab0b6" />
            </linearGradient>

            {/* side facing the light / side facing away, for the rim passes */}
            <linearGradient
              id="lr-litgrad"
              x1="0.04"
              y1="0"
              x2="0.82"
              y2="0.96"
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.46" stopColor="#4b4b4b" />
              <stop offset="0.82" stopColor="#000" />
            </linearGradient>
            <linearGradient
              id="lr-fargrad"
              x1="0.22"
              y1="0.06"
              x2="0.96"
              y2="1"
            >
              <stop offset="0.36" stopColor="#000" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
            <mask id="lr-lit">
              <rect width={VW} height={VH} fill="url(#lr-litgrad)" />
            </mask>
            <mask id="lr-far">
              <rect width={VW} height={VH} fill="url(#lr-fargrad)" />
            </mask>

            <mask id="lr-tube">
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="#fff"
                strokeWidth={W}
              />
            </mask>
            <clipPath id="lr-eye">
              <circle cx={CX} cy={CY} r={INNER} />
            </clipPath>

            {/* the tooth of moulded vinyl over foam */}
            <filter id="lr-tooth" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.15"
                numOctaves="2"
                seed="7"
              />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <filter id="lr-soften" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.4" />
            </filter>
          </defs>

          {/* the bracket, behind the ring: only the tip shows through the eye */}
          <g className="lr-peg">
            <rect
              x={CX - 8}
              y="9"
              width="16"
              height="6"
              rx="2.6"
              fill="url(#lr-steel)"
            />
            <circle cx={CX - 4.6} cy="12" r="1.1" fill="#4b5157" />
            <circle cx={CX + 4.6} cy="12" r="1.1" fill="#4b5157" />
            {/* the peg is on the centre line, so the ring hangs square to it.
                A rect, not a stroked path: a dead-vertical path has no width
                to hang an objectBoundingBox gradient on */}
            <rect
              x={CX - 2.7}
              y="13"
              width="5.4"
              height="48"
              rx="2.7"
              fill="url(#lr-steel)"
            />
            <circle cx={CX} cy="61" r="3.4" fill="url(#lr-steel)" />
            <path
              d={`M${CX - 1.6} 15 V58`}
              stroke="#fff"
              strokeOpacity="0.4"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </g>

          {/* the ring's own shadow, falling on the bulkhead inside the eye */}
          <g className="lr-castshadow" clipPath="url(#lr-eye)">
            <circle
              cx={CX + 4}
              cy={CY + 5.5}
              r={R}
              fill="none"
              stroke="#02040a"
              strokeWidth={W}
              filter="url(#lr-soften)"
            />
          </g>

          <g mask="url(#lr-tube)">
            {/* ── albedo: foam, paint, tape ── */}
            <rect width={VW} height={VH} fill="#e7e1d3" />
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#cd5620"
              strokeWidth={W}
              strokeDasharray={`${QUAD} ${QUAD}`}
              strokeDashoffset={-(C * 22.5) / 360}
            />
            {/* a hair of relief where paint meets foam */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#000"
              strokeOpacity="0.16"
              strokeWidth={W}
              strokeDasharray={`1 ${QUAD - 1}`}
              strokeDashoffset={-(C * 22.5) / 360}
            />

            <g className="lr-tape">
              {TAPES.map((deg) => {
                const [x, y] = at(deg, R);
                return (
                  <g
                    key={deg}
                    transform={`translate(${n(x)} ${n(y)}) rotate(${deg})`}
                  >
                    <rect
                      x="-3.8"
                      y={-(W / 2 + 1)}
                      width="7.6"
                      height={W + 2}
                      fill="#b4bac1"
                    />
                    <rect
                      x="-3.8"
                      y={-(W / 2 + 1)}
                      width="0.8"
                      height={W + 2}
                      fill="#000"
                      fillOpacity="0.26"
                    />
                    <rect
                      x="3"
                      y={-(W / 2 + 1)}
                      width="0.8"
                      height={W + 2}
                      fill="#000"
                      fillOpacity="0.26"
                    />
                  </g>
                );
              })}
            </g>

            <rect
              className="lr-tooth"
              width={VW}
              height={VH}
              fill="#000"
              filter="url(#lr-tooth)"
            />

            {/* ── light ── */}
            <rect width={VW} height={VH} fill="url(#lr-form)" />
            <rect
              className="lr-night"
              width={VW}
              height={VH}
              fill="url(#lr-nightwash)"
            />
            <rect
              className="lr-bounce"
              width={VW}
              height={VH}
              fill="url(#lr-bounce)"
            />
            <rect
              className="lr-keywarm"
              width={VW}
              height={VH}
              fill="url(#lr-keywarm)"
            />
            <rect
              className="lr-keycool"
              width={VW}
              height={VH}
              fill="url(#lr-keycool)"
            />

            {/* the broad soft specular vinyl gives back along the crown */}
            <circle
              className="lr-spec"
              cx={CX}
              cy={CY}
              r={R + 1}
              fill="none"
              stroke="#dbe6fb"
              strokeWidth={W * 0.26}
              mask="url(#lr-lit)"
            />

            {/* tape is retro-reflective: after dark it is the brightest thing
                on the ring, and the last detail to go */}
            <g className="lr-tapeglow">
              {TAPES.map((deg) => {
                const [x, y] = at(deg, R);
                return (
                  <rect
                    key={deg}
                    x="-3.8"
                    y={-(W / 2 + 1)}
                    width="7.6"
                    height={W + 2}
                    fill="#c4d6f4"
                    transform={`translate(${n(x)} ${n(y)}) rotate(${deg})`}
                  />
                );
              })}
            </g>

            <rect
              className="lr-shade"
              width={VW}
              height={VH}
              fill="url(#lr-occlude)"
            />

            {/* the cool edge the moon leaves on the outer face turned toward
                it, and on the far wall of the eye, which faces it too */}
            <circle
              className="lr-rim"
              cx={CX}
              cy={CY}
              r={OUTER - 0.7}
              fill="none"
              stroke="#b6cdf0"
              strokeWidth="1.4"
              mask="url(#lr-lit)"
            />
            <circle
              className="lr-rim"
              cx={CX}
              cy={CY}
              r={INNER + 0.7}
              fill="none"
              stroke="#9ab4dd"
              strokeWidth="1.3"
              mask="url(#lr-far)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

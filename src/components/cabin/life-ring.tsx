/**
 * Lifebuoy on its bracket, port side of the porthole and a little lower.
 *
 * Built the way the object is built: a foam torus, four painted quadrants that
 * follow it, a grab line laced at four points and draped between them. Shading
 * is layered like everything else on this wall — first the form of the tube
 * itself (a radial pass, bright along the crown, dark at both edges), then the
 * one key light from the upper left.
 */

const CX = 65;
const CY = 78;
const R = 42; // centre line of the tube
const W = 20; // tube thickness
const OUTER = R + W / 2;
const C = 2 * Math.PI * R;
const BAND = C / 8; // four painted quadrants, four bare ones

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const at = (deg: number, r: number): [number, number] => [
  CX + Math.cos(rad(deg)) * r,
  CY + Math.sin(rad(deg)) * r,
];

/** the grab line drapes outward between its lacing points */
function ropeSwag(fromDeg: number, toDeg: number) {
  const [x1, y1] = at(fromDeg, R + 9);
  const [x2, y2] = at(toDeg, R + 9);
  const [cx, cy] = at((fromDeg + toDeg) / 2, OUTER + 16);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function LifeRing() {
  return (
    <div className="lifering" aria-hidden="true">
      <div className="lifering-sway">
        <svg
          className="lifering-body"
          viewBox="0 0 130 142"
          role="presentation"
        >
          <defs>
            {/* the cross-section of the tube: dark at both edges, bright along
                the crown — what makes it read as round rather than flat */}
            <radialGradient
              id="lr-tube"
              gradientUnits="userSpaceOnUse"
              cx={CX}
              cy={CY}
              r={OUTER}
            >
              <stop
                offset={(R - W / 2) / OUTER}
                stopColor="#000"
                stopOpacity="0.46"
              />
              <stop offset="0.68" stopColor="#000" stopOpacity="0.1" />
              <stop offset="0.76" stopColor="#fff" stopOpacity="0.15" />
              <stop offset="0.84" stopColor="#fff" stopOpacity="0.09" />
              <stop offset="0.93" stopColor="#000" stopOpacity="0.1" />
              <stop offset="1" stopColor="#000" stopOpacity="0.44" />
            </radialGradient>
            <radialGradient id="lr-key" cx="0.28" cy="0.2" r="0.78">
              <stop offset="0" stopColor="#fffaf0" stopOpacity="0.5" />
              <stop offset="0.5" stopColor="#fff2de" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fff2de" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lr-occlude" x1="0.15" y1="0.05" x2="1" y2="1">
              <stop offset="0.36" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#05070c" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="lr-steel" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#f2f4f6" />
              <stop offset="0.5" stopColor="#adb3b9" />
              <stop offset="1" stopColor="#6d747b" />
            </linearGradient>
            <mask id="lr-tubemask">
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="#fff"
                strokeWidth={W}
              />
            </mask>
          </defs>

          {/* bracket, behind the ring: only the tip shows through the eye */}
          <g className="lr-peg">
            <rect
              x={CX - 7}
              y="17"
              width="14"
              height="5"
              rx="2.4"
              fill="url(#lr-steel)"
            />
            <rect
              x={CX - 2.6}
              y="20"
              width="5.2"
              height="28"
              rx="2.6"
              fill="url(#lr-steel)"
            />
            <circle cx={CX} cy="19.4" r="1.1" fill="#4b5157" />
          </g>

          <g className="lr-tube">
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#efeadf"
              strokeWidth={W}
            />
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#d1601f"
              strokeWidth={W}
              strokeDasharray={`${BAND} ${BAND}`}
              strokeDashoffset={-(C * 22.5) / 360}
            />
            {/* a hair of relief where paint meets foam */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#000"
              strokeOpacity="0.13"
              strokeWidth={W}
              strokeDasharray={`0.9 ${BAND - 0.9}`}
              strokeDashoffset={-(C * 22.5) / 360}
            />
            <g className="lr-tape">
              {[45, 225].map((deg) => {
                const [x, y] = at(deg, R);
                return (
                  <rect
                    key={deg}
                    x={x - 7}
                    y={y - 2.4}
                    width="14"
                    height="4.8"
                    rx="0.7"
                    fill="#cfd4d9"
                    transform={`rotate(${deg} ${x.toFixed(2)} ${y.toFixed(2)})`}
                  />
                );
              })}
            </g>

            {/* the tube's own form, over paint and foam alike */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="url(#lr-tube)"
              strokeWidth={W}
            />

            <g mask="url(#lr-tubemask)">
              <rect
                className="lr-key"
                x="0"
                y="0"
                width="130"
                height="142"
                fill="url(#lr-key)"
              />
              <rect
                className="lr-cool"
                x="0"
                y="0"
                width="130"
                height="142"
                fill="#5f7ba6"
              />
              <rect
                className="lr-shade"
                x="0"
                y="0"
                width="130"
                height="142"
                fill="url(#lr-occlude)"
              />
            </g>
          </g>

          {/* grab line: laced at four points, draped between them */}
          <g className="lr-rope">
            {[0, 90, 180, 270].map((deg) => (
              <path
                key={`swag${deg}`}
                d={ropeSwag(deg, deg + 90)}
                fill="none"
                stroke="#ab9d80"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            ))}
            {[0, 90, 180, 270].map((deg) => {
              const [x, y] = at(deg, R);
              const reach = W / 2 + 2.8;
              return (
                <g
                  key={`lace${deg}`}
                  transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg})`}
                >
                  <path
                    d={`M-${reach} -1.7 Q0 -4.6 ${reach} -1.7`}
                    fill="none"
                    stroke="#ddd3bd"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M-${reach} 2 Q0 -0.9 ${reach} 2`}
                    fill="none"
                    stroke="#a4967c"
                    strokeWidth="1.9"
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

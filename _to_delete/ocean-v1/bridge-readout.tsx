import { seaLight } from "@/lib/sea-light";
import { useShadeStore } from "@/store/shade";

export function BridgeReadout() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);
  const L = seaLight(shade);
  const pct = Math.round(shade * 100);

  return (
    <div className="readout" data-active={dragging ? "true" : "false"}>
      <div className="readout-cell">
        <span className="readout-label">Shade</span>
        <span className="readout-value">{String(pct).padStart(2, "0")}%</span>
      </div>
      <div className="readout-cell">
        <span className="readout-label">Ship time</span>
        <span className="readout-value">{L.shipTime}</span>
      </div>
      <div className="readout-cell">
        <span className="readout-label">Cabin lux</span>
        <span className="readout-value">{L.lux}</span>
      </div>
      <div className="readout-cell">
        <span className="readout-label">Sky</span>
        <span className="readout-value">{L.phase}</span>
      </div>
      <div className="readout-meter" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

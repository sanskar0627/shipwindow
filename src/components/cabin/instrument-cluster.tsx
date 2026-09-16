import { useShadeStore } from "@/store/shade";

export function InstrumentCluster() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);

  const pct = Math.round(shade * 100);
  const sky = shade < 0.28 ? "DAY" : shade < 0.62 ? "DUSK" : "NIGHT";
  const lux = Math.round((1 - shade) * 980);

  return (
    <div className="instruments" data-active={dragging ? "true" : "false"}>
      <div className="inst-cell">
        <span className="inst-label">Shade</span>
        <span className="inst-value">{pct}%</span>
      </div>
      <div className="inst-cell">
        <span className="inst-label">Sky</span>
        <span className="inst-value">{sky}</span>
      </div>
      <div className="inst-cell">
        <span className="inst-label">Cabin lux</span>
        <span className="inst-value">{lux}</span>
      </div>
      <p className="inst-hint">
        {dragging ? "Hold — analog dimmer" : "Pull the shade to dim the cabin"}
      </p>
    </div>
  );
}

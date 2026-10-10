import { useEffect, useState } from 'react';

// The hero visual: an animated drone inside a viewfinder with live-looking telemetry.
export default function DroneHero() {
  const [alt, setAlt] = useState(118);
  const [bat, setBat] = useState(87);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => {
      setAlt((a) => Math.max(110, Math.min(126, a + (Math.random() > 0.5 ? 1 : -1))));
      setBat((b) => (Math.random() > 0.85 && b > 40 ? b - 1 : b));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="viewfinder" role="img" aria-label="Illustration of a drone hovering inside a camera viewfinder">
      <span className="vf-corner tl" />
      <span className="vf-corner tr" />
      <span className="vf-corner bl" />
      <span className="vf-corner br" />

      <div className="vf-readout top-left">
        <span className="rec"><i /> REC</span> 4K · 60fps
      </div>
      <div className="vf-readout top-right">GPS locked · 14 sats</div>
      <div className="vf-readout bottom-left">ALT {alt} m</div>
      <div className="vf-readout bottom-right">BAT {bat}%</div>

      <svg className="drone" viewBox="0 0 400 300" aria-hidden="true">
        <g className="drone-float">
          <g stroke="var(--drone-arm)" strokeWidth="7" strokeLinecap="round">
            <line x1="170" y1="140" x2="88" y2="92" />
            <line x1="230" y1="140" x2="312" y2="92" />
            <line x1="170" y1="160" x2="88" y2="208" />
            <line x1="230" y1="160" x2="312" y2="208" />
          </g>
          {[[88, 92], [312, 92], [88, 208], [312, 208]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="9" fill="var(--drone-arm)" />
              <ellipse className="rotor" cx={x} cy={y - 7} rx="42" ry="5" fill="var(--telemetry)" opacity="0.55" />
            </g>
          ))}
          <rect x="160" y="124" width="80" height="52" rx="20" fill="var(--drone-body)" />
          <rect x="172" y="132" width="56" height="10" rx="5" fill="var(--drone-arm)" opacity="0.5" />
          <circle cx="200" cy="190" r="15" fill="var(--drone-arm)" />
          <circle cx="200" cy="190" r="8" fill="var(--ink)" />
          <circle cx="203" cy="187" r="2.6" fill="var(--telemetry)" />
          <circle className="beacon" cx="200" cy="152" r="5" fill="var(--beacon)" />
        </g>
        <ellipse cx="200" cy="270" rx="60" ry="7" fill="var(--telemetry)" opacity="0.14" className="shadow" />
      </svg>
    </div>
  );
}

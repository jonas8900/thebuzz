// components/marketing/number-ticker.jsx
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export default function NumberTicker({ value = 0, duration = 0.6, locale = "de-DE" }) {
  const [display, setDisplay] = useState(0);
  const last = useRef(0); // startet bei 0, merkt sich den letzten Wert
  const controlsRef = useRef(null);

  useEffect(() => {
    const from = Number.isFinite(last.current) ? last.current : 0;
    const to = Number(value || 0);

    if (controlsRef.current) controlsRef.current.stop();

    controlsRef.current = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    last.current = to;
    return () => {
      if (controlsRef.current) controlsRef.current.stop();
    };
  }, [value, duration]);

  return <>{Number(display).toLocaleString(locale)}</>;
}

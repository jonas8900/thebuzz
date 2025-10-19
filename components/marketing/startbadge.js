// components/marketing/startbadge.jsx
import NumberTicker from "./number-ticker";

function cn(...parts) { return parts.filter(Boolean).join(" "); }
function toneByDelta(delta) {
  if (delta > 0) return "text-emerald-700 dark:text-emerald-300 bg-emerald-500/12";
  if (delta < 0) return "text-rose-700 dark:text-rose-300 bg-rose-500/12";
  return "text-slate-700 dark:text-slate-300 bg-slate-500/12";
}

export default function StatBadge({
  kpi,
  label,
  sublabel,          
  delta,             
  icon = "📊",       
  loading = false,
  className = "",
}) {
  const deltaTone = toneByDelta(Number(delta || 0));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 text-center shadow-sm",
        "border border-white/60 dark:border-white/10",
        "bg-white/70 dark:bg-white/10 backdrop-blur",
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      {/* Gradient-Ring */}
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl ring-1 ring-transparent [background:radial-gradient(120px_circle_at_50%_-40px,rgba(168,85,247,0.18),transparent_60%),radial-gradient(120px_circle_at_80%_120%,rgba(37,99,235,0.2),transparent_60%)]" />

      {/* Icon */}
      <div className="h-7 flex items-center justify-center">
        {typeof icon === "string" ? <span className="text-3xl">{icon}</span> : icon}
      </div>

      {/* KPI */}
      <div className="min-h-[2.4rem]">
        {loading ? (
          <span className="inline-block h-8 w-28 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        ) : (
          <span className="text-3xl font-extrabold tracking-tight">
            <NumberTicker value={kpi} />
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-sm opacity-80">{label}</div>

      {/* Trend / Sublabel */}
      {(sublabel || delta !== undefined) && (
        <div className="text-xs opacity-80">
          {delta !== undefined && (
            <span className={cn("mr-2 inline-flex items-center gap-1 rounded-full px-2 py-[2px]", deltaTone)}>
              <span>{delta > 0 ? "▲" : delta < 0 ? "▼" : "•"}</span>
              <span>{Number(delta).toLocaleString("de-DE")}</span>
            </span>
          )}
          {sublabel && <span>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}

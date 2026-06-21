/** Skeleton loader that matches movie card proportions */
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`flex-shrink-0 w-[180px] ${className}`}>
      <div
        className="rounded-2xl aspect-[2/3] w-full animate-pulse"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%" }}
      />
      <div className="mt-3 space-y-2">
        <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.07)", width: "75%" }} />
        <div className="h-2.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.04)", width: "50%" }} />
      </div>
    </div>
  );
}

/** Wide skeleton for Now Playing cards */
export function SkeletonWideCard({ className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 animate-pulse ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", width: "60%" }} />
          <div className="h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", width: "40%" }} />
        </div>
        <div className="h-3 rounded-full w-12" style={{ background: "rgba(225,29,72,0.2)" }} />
      </div>
      <div className="h-2 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.05)", width: "80%" }} />
      <div className="flex justify-between">
        <div className="h-6 rounded-full w-20" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-7 rounded-full w-24" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}

/** Skeleton for theatre card */
export function SkeletonTheatreCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="h-4 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.08)", width: "70%" }} />
      <div className="h-3 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.05)", width: "90%" }} />
      <div className="flex gap-2">
        <div className="h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", width: "30%" }} />
        <div className="h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", width: "25%" }} />
      </div>
    </div>
  );
}

// GitHub-style grid of commits per day over the last year (counts only). Server component.
const SHADES = ["bg-black/[6%] dark:bg-white/[6%]", "bg-[#1491ff]/25 dark:bg-[#64acff]/25", "bg-[#1491ff]/45 dark:bg-[#64acff]/45", "bg-[#1491ff]/70 dark:bg-[#64acff]/70", "bg-[#1491ff] dark:bg-[#64acff]"];

function level(n, max) {
 if (!n) return 0;
 const r = n / Math.max(1, max);
 return r > 0.75 ? 4 : r > 0.45 ? 3 : r > 0.2 ? 2 : 1;
}

export function Heatmap({ data, xrayNote }) {
 const days = data?.days || [];
 if (!days.length) return null;
 const first = new Date(days[0].d + "T00:00:00Z").getUTCDay(); // pad so weeks start on Sunday
 const cells = [...Array(first).fill(null), ...days];
 const sorted = days.map((d) => d.n).filter(Boolean).sort((a, b) => a - b);
 const max = sorted[Math.floor(sorted.length * 0.95)] || 1;
 const weeks = [];
 for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
 return (
  <div data-xray={xrayNote}>
   <div className="overflow-x-auto pb-1">
    <div className="flex w-max gap-[3px]" role="img" aria-label={`${data.total} commits in the last year`}>
     {weeks.map((w, i) => (
      <div key={i} className="flex flex-col gap-[3px]">
       {w.map((d, j) => (d ? <span key={j} title={`${d.n} commit${d.n === 1 ? "" : "s"} on ${new Date(d.d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`} className={`h-[11px] w-[11px] rounded-[2px] ${SHADES[level(d.n, max)]}`} /> : <span key={j} className="h-[11px] w-[11px]" />))}
      </div>
     ))}
    </div>
   </div>
   <p className="mt-2 text-xs text-zinc-500 dark:text-white/40">
    {data.total} commits in the last year · longest streak {data.longest_streak} days · current streak {data.current_streak} days. Private repos, counts only.
   </p>
  </div>
 );
}

// Hidden until there is enough real activity to be worth showing.
export const HEATMAP_MIN = 150;

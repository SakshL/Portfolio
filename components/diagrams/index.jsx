import Architecture from "components/diagrams/Architecture";
import TrackingDemo from "components/demos/TrackingDemo";
import LedgerDemo from "components/demos/LedgerDemo";
import MigrationDemo from "components/demos/MigrationDemo";
import McpDemo from "components/demos/McpDemo";

// Small declarative flow diagrams for case studies. Boxes: [x, y, w, label, sub?, strong?]. Arrows: [fromIndex, toIndex, label?, dashed?].
function Flow({ title, width = 860, height = 300, boxes, arrows, caption, step = null, story = false }) {
 const on = (i) => step === null || i <= step;
 const h = 50;
 const center = (b) => ({ x: b[0] + b[2] / 2, y: b[1] + h / 2 });
 const edgePoint = (b, toward) => {
  const c = center(b);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (Math.abs(dx) * h > Math.abs(dy) * b[2]) return { x: dx > 0 ? b[0] + b[2] : b[0], y: c.y };
  return { x: c.x, y: dy > 0 ? b[1] + h : b[1] };
 };
 return (
  <figure className={story ? "not-prose" : "not-prose my-8"}>
   <div className={story ? "rounded-lg border bg-white/50 p-2 dark:border-neutral-800 dark:bg-black/20" : "overflow-x-auto rounded-xl border bg-zinc-200/[25%] p-3 dark:border-neutral-800 dark:bg-[#161617]"}>
    <svg viewBox={`0 0 ${width} ${height}`} className="text-zinc-800 dark:text-white" style={story ? { width: "100%", height: "auto" } : { minWidth: Math.min(width, 640) }} role="img" aria-label={title}>
     <defs>
      <marker id={`a-${title.length}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
       <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
      </marker>
     </defs>
     {arrows.map(([f, t, label, dashed], i) => {
      const a = edgePoint(boxes[f], center(boxes[t]));
      const b = edgePoint(boxes[t], center(boxes[f]));
      return (
       <g key={i} style={{ opacity: on(Math.max(f, t)) ? 1 : 0.12, transition: "opacity .45s ease" }}>
        <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray={dashed ? "4 4" : undefined} fill="none" markerEnd={`url(#a-${title.length})`} />
        {label && (
         <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 7} textAnchor="middle" className="fill-current text-[11px] opacity-60">
          {label}
         </text>
        )}
       </g>
      );
     })}
     {boxes.map(([x, y, w, label, sub, strong], i) => (
      <g key={i} style={{ opacity: on(i) ? 1 : 0.22, transition: "opacity .45s ease" }}>
       <rect x={x} y={y} width={w} height={h} rx="9" className={strong ? "fill-zinc-900 dark:fill-white" : "fill-white dark:fill-[#1d1d1f]"} stroke={step === i ? "#1491ff" : "currentColor"} strokeWidth={step === i ? 2.5 : 1} strokeOpacity={strong || step === i ? 1 : 0.18} style={{ transition: "stroke .3s, stroke-width .3s" }} />
       <text x={x + w / 2} y={y + (sub ? 21 : 30)} textAnchor="middle" className={`text-[12.5px] font-semibold ${strong ? "fill-white dark:fill-zinc-900" : "fill-current"}`}>
        {label}
       </text>
       {sub && (
        <text x={x + w / 2} y={y + 37} textAnchor="middle" className={`text-[10.5px] ${strong ? "fill-white/70 dark:fill-zinc-900/70" : "fill-current opacity-55"}`}>
         {sub}
        </text>
       )}
      </g>
     ))}
    </svg>
   </div>
   {caption && !story && <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-white/40">{caption}</figcaption>}
  </figure>
 );
}

const diagrams = {
 architecture: () => (
  <div className="my-8">
   <Architecture compact />
  </div>
 ),
 "go-migration": (o = {}) => (
  <Flow
   {...o}
   title="Strangler migration from Laravel to Go"
   height={260}
   boxes={[
    [20, 105, 130, "Apps and web", "every request"],
    [210, 105, 150, "Nginx", "route table", true],
    [440, 20, 170, "Go service", "serves the route"],
    [440, 105, 170, "Laravel", "old code path"],
    [440, 190, 170, "Shadow check", "Go runs, result diffed"],
    [680, 105, 160, "MariaDB", "same database"],
   ]}
   arrows={[
    [0, 1],
    [1, 2, "ported"],
    [1, 3, "not yet"],
    [1, 4, "testing", true],
    [2, 5],
    [3, 5],
    [4, 5, "read only", true],
   ]}
   caption="Each route moves on its own: shadow first, then serve, with a one-line switch back."
  />
 ),
 "live-tracking": (o = {}) => (
  <Flow
   {...o}
   title="Live rider tracking"
   height={250}
   boxes={[
    [20, 100, 140, "Rider app", "GPS every few s"],
    [220, 100, 150, "Realtime (Go)", "ingest", true],
    [430, 20, 170, "Redis GEO", "riders by location"],
    [430, 180, 170, "Redis pub/sub", "order channels"],
    [660, 20, 180, "Dispatch", "who is nearest"],
    [660, 180, 180, "Customer screen", "WebSocket / SSE"],
   ]}
   arrows={[
    [0, 1, "position"],
    [1, 2, "GEOADD"],
    [1, 3, "publish"],
    [2, 4, "GEOSEARCH"],
    [3, 5, "stream"],
   ]}
   caption="'Who is near' is answered from Redis, not the database, and the app animates smoothly between points."
  />
 ),
 ledger: (o = {}) => (
  <Flow
   {...o}
   title="A ledger that checks itself"
   height={250}
   boxes={[
    [20, 100, 150, "Payment, refund, payout", "any money event"],
    [230, 100, 160, "Ledger service", "idempotency key", true],
    [450, 20, 170, "Ledger entries", "append only"],
    [450, 180, 170, "Balances", "derived"],
    [680, 100, 160, "Checker", "replays orders"],
   ]}
   arrows={[
    [0, 1],
    [1, 2, "debit + credit"],
    [2, 3, "sum"],
    [4, 2, "recompute", true],
    [4, 3, "compare", true],
   ]}
   caption="Every change is a pair of entries. A checker replays orders from scratch and flags any balance that does not match."
  />
 ),
 mcp: (o = {}) => (
  <Flow
   {...o}
   title="Acme connector for Claude"
   height={240}
   boxes={[
    [20, 95, 140, "Claude", "user asks for food"],
    [220, 95, 170, "MCP server (Go)", "tools + OAuth", true],
    [450, 20, 170, "Search", "restaurants, dishes"],
    [450, 170, 170, "Cart + order", "same rules as the app"],
    [680, 95, 160, "Acme API", "auth, prices, ledger"],
   ]}
   arrows={[
    [0, 1, "tool call"],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
   ]}
   caption="The model only gets narrow tools; prices and payments are always decided by the server."
  />
 ),
};

diagrams["biz-tenancy"] = (o = {}) => (
 <Flow
  {...o}
  title="One database per restaurant"
  height={250}
  boxes={[
   [20, 100, 150, "Sign-ups, plans, billing", "control plane"],
   [230, 100, 150, "Tenant registry", "read-only lookup", true],
   [440, 100, 150, "POS app", "one shared codebase"],
   [660, 20, 180, "Restaurant A", "own database"],
   [660, 100, 180, "Restaurant B", "own database"],
   [660, 180, 180, "Restaurant C", "own database"],
  ]}
  arrows={[
   [0, 1, "writes"],
   [1, 2, "which tenant?"],
   [2, 3],
   [2, 4],
   [2, 5],
  ]}
  caption="The app is shared; the data never is. Each request is pointed at exactly one restaurant's database."
 />
);

diagrams["laayendra-ladder"] = (o = {}) => (
 <Flow
  {...o}
  title="How Laayendra escalates"
  width={900}
  height={150}
  boxes={[
   [10, 50, 130, "Rule fires", "order needs help"],
   [160, 50, 140, "Spoken line", "in the rider app"],
   [320, 50, 120, "Repeat", "if no reaction"],
   [460, 50, 140, "In-app call", "only when stopped"],
   [620, 50, 120, "Phone call", "last nudge", true],
   [760, 50, 130, "Reassign", "before pickup"],
  ]}
  arrows={[
   [0, 1],
   [1, 2],
   [2, 3],
   [3, 4],
   [4, 5],
  ]}
  caption="Each step is gentler than the next, and nothing interrupts a rider who is riding."
 />
);

// playable demos for the case studies (not flow diagrams, so they have no scroll-story steps)
diagrams["demo-tracking"] = () => <TrackingDemo />;
diagrams["demo-ledger"] = () => <LedgerDemo />;
diagrams["demo-migration"] = () => <MigrationDemo />;
diagrams["demo-mcp"] = () => <McpDemo />;

export function Diagram({ name, ...o }) {
 const D = diagrams[name];
 return D ? D(o) : null;
}

// For the scroll story: how many boxes a flow diagram has, and their labels.
export function diagramSteps(name) {
 const el = diagrams[name]?.({});
 const boxes = el?.props?.boxes;
 return boxes ? boxes.map((b) => ({ label: b[3], sub: b[4] || "" })) : null;
}
export const diagramCaption = (name) => diagrams[name]?.({})?.props?.caption || "";

// The hero name: shown at once, then a single soft band of light sweeps across it, left to right. Pure CSS, no
// scroll effects; reduced motion shows the plain name.
export function NameBuild({ text, className = "" }) {
 return (
  <h1 className={`name-sweep ${className}`}>
   <span className="name-sweep-ink">{text}</span>
  </h1>
 );
}

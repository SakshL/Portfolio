"use client";

import { useEffect } from "react";
import { reportError } from "lib/reportError";

// Last resort when the root layout itself fails: report it and offer a reload.
export default function GlobalError({ error, reset }) {
 useEffect(() => {
  reportError("global", error);
 }, [error]);
 return (
  <html lang="en">
   <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#101110", color: "#f4f4f5" }}>
    <div style={{ textAlign: "center", padding: 24 }}>
     <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Something went wrong</h1>
     <p style={{ opacity: 0.7, margin: "0 0 16px" }}>It has been reported. Please try again.</p>
     <button onClick={() => reset()} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #3f3f46", background: "transparent", color: "inherit", cursor: "pointer" }}>
      Try again
     </button>
    </div>
   </body>
  </html>
 );
}

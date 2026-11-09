import { Fragment } from "react";

// Fills {name} placeholders in a translated sentence with elements (links, highlights), keeping word order per language.
export function Rich({ text, parts = {} }) {
 return String(text)
  .split(/(\{\w+\})/)
  .map((chunk, i) => {
   const m = chunk.match(/^\{(\w+)\}$/);
   return <Fragment key={i}>{m && parts[m[1]] !== undefined ? parts[m[1]] : chunk}</Fragment>;
  });
}

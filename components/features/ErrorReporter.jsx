"use client";

import { useEffect } from "react";
import { reportError } from "lib/reportError";

// Catches uncaught errors and promise rejections anywhere on the site and reports them.
export function ErrorReporter() {
 useEffect(() => {
  const onError = (e) => reportError("error", e.error || e.message, { source: e.filename || "" });
  const onRejection = (e) => reportError("rejection", e.reason);
  addEventListener("error", onError);
  addEventListener("unhandledrejection", onRejection);
  return () => {
   removeEventListener("error", onError);
   removeEventListener("unhandledrejection", onRejection);
  };
 }, []);
 return null;
}

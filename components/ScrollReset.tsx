"use client";
import { useEffect } from "react";

/** Forces the page to scroll to the very top on mount. */
export default function ScrollReset() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}

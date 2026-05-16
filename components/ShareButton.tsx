"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ShareButton({
  shareLabel = "Share",
  copiedLabel = "Copied!",
}: {
  shareLabel?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText("distrett.com");
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = "distrett.com";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Copy distrett.com link to clipboard"
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:border-foreground/40 hover:text-foreground transition-colors"
    >
      {copied ? (
        <>
          <Check size={11} aria-hidden />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Share2 size={11} aria-hidden />
          <span>{shareLabel}</span>
        </>
      )}
    </button>
  );
}

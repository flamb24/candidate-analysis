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
    const url = "distrett.com";
    // clipboard.writeText() throws NotAllowedError when not in a secure context —
    // the browser logs it to the console even with try/catch, so guard first.
    if (isSecureContext && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch { /* fall through to execCommand */ }
    }
    // execCommand fallback (deprecated but widely supported)
    try {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } catch { /* silent */ }
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

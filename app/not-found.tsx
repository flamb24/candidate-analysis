import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">404</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="text-muted text-base max-w-md mt-1">
          This page doesn&apos;t exist or has moved. Head back to the district guide to find your candidate.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/districts"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-foreground/40 hover:text-foreground transition-colors"
        >
          Choose your district →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

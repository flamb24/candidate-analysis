import { BookOpen, ExternalLink, Headphones, Play } from "lucide-react";
import type { Interview } from "@/lib/interviews";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function InterviewLinks({
  interviews,
  lang = "en",
}: {
  interviews: Interview[];
  lang?: Lang;
}) {
  if (interviews.length === 0) return null;
  const t = getT(lang);

  const FORMAT_CONFIG: Record<
    Interview["format"],
    { label: string; icon: React.ReactNode; cls: string }
  > = {
    video: {
      label: t.watchLabel,
      icon: <Play size={10} aria-hidden />,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    },
    podcast: {
      label: t.listenLabel,
      icon: <Headphones size={10} aria-hidden />,
      cls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
    },
    article: {
      label: t.readLabel,
      icon: <BookOpen size={10} aria-hidden />,
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    },
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        {t.interviewsSection}
      </h2>
      <div className="flex flex-col gap-2">
        {interviews.map((iv, i) => {
          const cfg = FORMAT_CONFIG[iv.format];
          return (
            <a
              key={i}
              href={iv.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm transition hover:border-foreground/40 hover:shadow-sm"
            >
              <span
                className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-2 pt-[2px] pb-[3px] text-xs font-semibold leading-none ${cfg.cls}`}
              >
                {cfg.icon}
                {cfg.label}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {iv.platform}
                </span>
                <span className="text-xs text-muted line-clamp-1">
                  {iv.description}
                </span>
              </div>
              {iv.date && (
                <span className="shrink-0 text-xs text-muted">{iv.date}</span>
              )}
              <ExternalLink
                size={13}
                className="shrink-0 text-muted/60 transition-colors group-hover:text-accent"
                aria-hidden
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}

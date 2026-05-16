"use client";

const SOURCES = [
  { name: "Times of Malta",       url: "https://timesofmalta.com",         domain: "timesofmalta.com"      },
  { name: "MaltaToday",           url: "https://www.maltatoday.com.mt",    domain: "maltatoday.com.mt"     },
  { name: "The Shift News",       url: "https://theshiftnews.com",         domain: "theshiftnews.com"      },
  { name: "The Malta Independent",url: "https://www.independent.com.mt",   domain: "independent.com.mt"    },
  { name: "Lovin Malta",          url: "https://lovinmalta.com",           domain: "lovinmalta.com"        },
  { name: "Newsbook",             url: "https://newsbook.com.mt",          domain: "newsbook.com.mt"       },
];

export default function SourcesTicker() {
  // Duplicate for seamless loop
  const items = [...SOURCES, ...SOURCES];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-4"
        style={{ animation: "ticker 22s linear infinite" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")
        }
      >
        {items.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted-bg/60 px-4 py-2 text-sm text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
              alt=""
              width={16}
              height={16}
              className="shrink-0 rounded-sm"
            />
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}

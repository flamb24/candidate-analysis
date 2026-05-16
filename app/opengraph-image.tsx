import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Distrett. — Malta General Election 2026 Candidate Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f5f0eb",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "80px",
              letterSpacing: "-3px",
              color: "#1c1917",
            }}
          >
            Distrett
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: "80px",
              letterSpacing: "-3px",
              color: "#c2410c",
            }}
          >
            .
          </span>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "54px",
              fontWeight: 500,
              color: "#1c1917",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
            }}
          >
            Know who you&apos;re really
            <br />
            voting for.
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#78716c",
              letterSpacing: "0px",
              lineHeight: 1.4,
            }}
          >
            Every candidate in your district — track record,
            <br />
            controversies, and stances on the issues that matter.
          </div>
        </div>

        {/* Bottom: metadata bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "#a8a29e",
            }}
          >
            distrett.com
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#c2410c",
            }}
          >
            Malta General Election · 30 May 2026
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

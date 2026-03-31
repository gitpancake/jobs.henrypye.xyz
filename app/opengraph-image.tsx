import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "jobs. — Track your job search";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 60%, #0c0a1a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0px" }}>
          <span
            style={{
              fontSize: 120,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            jobs
          </span>
          <span
            style={{
              fontSize: 120,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#3b82f6",
              lineHeight: 1,
            }}
          >
            .
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontSize: 32,
            fontFamily: "sans-serif",
            color: "#a1a1aa",
            marginTop: 24,
            letterSpacing: "-0.5px",
          }}
        >
          Track applications. Land interviews. Get hired.
        </span>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontFamily: "monospace",
              color: "#52525b",
            }}
          >
            jobs.henrypye.xyz
          </span>
        </div>

        {/* Stats preview pills */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 80,
            display: "flex",
            gap: 12,
          }}
        >
          {[
            { label: "Applied", color: "#3b82f6" },
            { label: "Interviewing", color: "#a855f7" },
            { label: "Accepted", color: "#22c55e" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid #27272a",
                background: "#1a1a1e",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.color,
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontFamily: "sans-serif",
                  color: "#a1a1aa",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

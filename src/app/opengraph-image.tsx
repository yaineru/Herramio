import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 152,
            height: 152,
            borderRadius: 34,
            background: "#0f172a",
          }}
        >
          <div style={{ display: "flex", position: "absolute", left: 43, top: 36, width: 21, height: 80, borderRadius: 5, background: "#fff" }} />
          <div style={{ display: "flex", position: "absolute", left: 88, top: 36, width: 21, height: 80, borderRadius: 5, background: "#fff" }} />
          <div style={{ display: "flex", position: "absolute", left: 43, top: 65, width: 66, height: 21, borderRadius: 5, background: "#fff" }} />
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 68, fontWeight: 700, color: "#0f172a" }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 32, color: "#57534e" }}>
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}

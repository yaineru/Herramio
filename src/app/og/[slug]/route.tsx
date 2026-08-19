import { ImageResponse } from "next/og";
import { getToolById } from "@/lib/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-tool social preview image, generated on request from the registry —
 * one route serves all 48 tools instead of 48 static files, so a renamed
 * or newly added tool never needs a matching image asset. Falls back to
 * the site name when the slug doesn't match a known tool.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);
  const categoryName = tool ? getCategory(tool.category).name : undefined;

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
          padding: "0 90px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: 20,
            background: "#0f172a",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", position: "absolute", left: 25, top: 21, width: 12, height: 46, borderRadius: 3, background: "#fff" }} />
          <div style={{ display: "flex", position: "absolute", left: 51, top: 21, width: 12, height: 46, borderRadius: 3, background: "#fff" }} />
          <div style={{ display: "flex", position: "absolute", left: 25, top: 38, width: 38, height: 12, borderRadius: 3, background: "#fff" }} />
        </div>

        {categoryName && (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: "#059669",
              textTransform: "uppercase",
              letterSpacing: 3,
              marginBottom: 18,
            }}
          >
            {categoryName}
          </div>
        )}

        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#0f172a", lineHeight: 1.15 }}>
          {tool ? tool.name : SITE.name}
        </div>

        <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#57534e" }}>
          {SITE.name} — herramientas online gratuitas
        </div>
      </div>
    ),
    { ...size },
  );
}

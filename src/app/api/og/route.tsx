import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get title and description from query parameters
    const title = searchParams.get("title") || "StudyBond — UI Post-UTME CBT Practice";
    const desc = searchParams.get("desc") || "Nigeria's #1 Post-UTME preparation platform. Practice with real past questions in a timed CBT simulation, track your performance, and secure your admission.";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(224, 144, 64, 0.09) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(192, 104, 48, 0.05) 0%, transparent 40%)",
            padding: "80px",
            border: "12px solid #e09040",
            fontFamily: "sans-serif",
            boxSizing: "border-box",
          }}
        >
          {/* Top row: Brand Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#e09040",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#09090b",
                fontWeight: "bold",
                fontSize: "28px",
              }}
            >
              S
            </div>
            <span
              style={{
                marginLeft: "16px",
                fontSize: "32px",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "-0.05em",
              }}
            >
              Study<span style={{ color: "#e09040" }}>Bond</span>
            </span>
          </div>

          {/* Middle: Title & description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#ffffff",
                lineHeight: "1.15",
                margin: 0,
                padding: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.5)",
                lineHeight: "1.5",
                margin: 0,
                padding: 0,
                maxWidth: "950px",
              }}
            >
              {desc}
            </p>
          </div>

          {/* Bottom row: CTA and info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "18px",
                color: "#e09040",
                fontWeight: "600",
              }}
            >
              <span>● Timed CBT Simulation</span>
              <span style={{ marginLeft: "20px" }}>● Verified Past Questions</span>
              <span style={{ marginLeft: "20px" }}>● Performance Analytics</span>
            </div>
            <span
              style={{
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              studybond.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(`OG Generation Error: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

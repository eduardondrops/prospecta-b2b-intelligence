export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    service: "prospecta-b2b-intelligence",
    runtime: "cloudflare-workers",
    data: "synthetic",
  }, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

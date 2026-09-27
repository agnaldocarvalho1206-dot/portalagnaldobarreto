export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    { status: 'ok', contract: 'portal-ab-health-v2' },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

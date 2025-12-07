import { NextResponse } from 'next/server';
import { getPendingRequestForCode, getRequestById } from '@/lib/server-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const requestId = searchParams.get('requestId');

  if (code) {
    // Prover polling for incoming requests
    const pendingRequest = getPendingRequestForCode(code);
    return NextResponse.json({ request: pendingRequest || null });
  }

  if (requestId) {
    // Verifier polling for status updates
    const req = getRequestById(requestId);
    if (!req) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    return NextResponse.json({ request: req });
  }

  return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
}

import { NextResponse } from 'next/server';
import { createRequest, updateRequest, VerificationRequest } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, requesterName } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const newRequest: VerificationRequest = {
      id: Math.random().toString(36).substring(7),
      code,
      requesterName: requesterName || 'Someone',
      status: 'pending',
      timestamp: Date.now(),
    };

    const savedRequest = createRequest(newRequest);
    return NextResponse.json(savedRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, ownerId } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updatedRequest = updateRequest(id, { status, ownerId });
    
    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

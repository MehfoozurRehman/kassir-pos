import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { fetchMutation } from 'convex/nextjs';

export async function POST(request: Request) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;

  if (!setupSecret || request.headers.get('x-admin-setup-secret') !== setupSecret) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, email, password } = await request.json();

  const adminId = await fetchMutation(api.auth.createAdmin, { name, email, password, setupSecret });

  return NextResponse.json({ adminId });
}

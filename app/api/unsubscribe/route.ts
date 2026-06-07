import { NextRequest, NextResponse } from 'next/server';
import { removeContactFromList } from '@/lib/brevo-api';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', req.url));
  }

  try {
    await removeContactFromList(decodeURIComponent(email));
    return NextResponse.redirect(new URL(`/unsubscribe?success=1&email=${encodeURIComponent(email)}`, req.url));
  } catch {
    return NextResponse.redirect(new URL('/unsubscribe?error=server', req.url));
  }
}

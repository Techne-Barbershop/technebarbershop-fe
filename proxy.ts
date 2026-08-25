import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key matching the Go backend.
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia123');

export async function proxy(request: NextRequest) {
  // 1. Ambil cookie token
  const token = request.cookies.get('token')?.value;

  // Function to redirect to login
  const redirectToLogin = () => NextResponse.redirect(new URL('/login', request.url));

  // Jika tidak ada token sama sekali, tolak
  if (!token) {
    return redirectToLogin();
  }

  try {
    // 2. Verifikasi token JWT menggunakan jose (jalan di Edge Runtime)
    const { payload } = await jwtVerify(token, secretKey);
    const role = (payload.role as string)?.toUpperCase();

    // 3. Cek Role Based Access Control
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (role !== 'ADMIN') {
        return redirectToLogin();
      }
    }

    if (request.nextUrl.pathname.startsWith('/worker')) {
      if (role !== 'CAPSTER' && role !== 'ADMIN') {
        return redirectToLogin();
      }
    }

    // Jika aman, persilakan masuk
    return NextResponse.next();
  } catch (err) {
    // Jika token tidak valid, kadaluarsa, atau rusak
    console.error("JWT Verification failed:", err);
    return redirectToLogin();
  }
}

// Konfigurasi URL mana saja yang harus dicegat
export const config = {
  matcher: [
    '/admin/:path*',
    '/worker/:path*'
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Ambil cookie yang disimpan saat login
  // (Untuk sementara kita cek cookie 'role', nanti kita ganti dengan JWT)
  const role = request.cookies.get('role')?.value;

  // 2. Cek apakah user mencoba masuk ke halaman /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/worker')) {
    if (role?.toUpperCase() !== 'CAPSTER' && role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika aman, persilakan masuk
  return NextResponse.next();
}

// Konfigurasi ini memberitahu Next.js URL mana saja yang harus dicegat satpam
export const config = {
  matcher: [
    '/admin/:path*', 
    '/worker/:path*'
  ],
};

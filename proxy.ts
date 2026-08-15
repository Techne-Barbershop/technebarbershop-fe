import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Ambil cookie yang disimpan saat login
  // (Untuk sementara kita cek cookie 'role', nanti kita ganti dengan JWT)
  const role = request.cookies.get('role')?.value;

  // 2. Cek apakah user mencoba masuk ke halaman /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Jika tidak ada role admin, tendang ke login
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Cek apakah user mencoba masuk ke halaman /worker (kapster)
  if (request.nextUrl.pathname.startsWith('/worker')) {
    if (role !== 'worker' && role !== 'admin') { 
      // Anggap admin juga boleh buka halaman worker
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

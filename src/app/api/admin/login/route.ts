import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Standard Admin Credential validation
    const validEmail = "admin@kgyk.com";
    const validPassword = "admin123";

    if (
      (email?.toLowerCase() === validEmail || email?.toLowerCase() === "admin") &&
      password === validPassword
    ) {
      return NextResponse.json({
        success: true,
        token: "kgyk_admin_token_sec_89234",
        user: {
          name: "Admin Operasional",
          email: "admin@kgyk.com",
          role: "Administrator",
        },
      });
    }

    return NextResponse.json(
      { error: "Email atau kata sandi admin salah!" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login" },
      { status: 500 }
    );
  }
}

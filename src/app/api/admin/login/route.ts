import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: Request) {
  await ensureDbInitialized();

  try {
    const body = await req.json();
    const { email, password } = body;

    let validEmail = "admin@kgyk.com";
    let validPassword = "admin123";

    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "adminEmail", "adminPassword" FROM "Setting" WHERE "id" = 1`
      );
      if (rows && rows.length > 0) {
        if (rows[0]?.adminEmail) validEmail = String(rows[0].adminEmail).trim().toLowerCase();
        if (rows[0]?.adminPassword) validPassword = String(rows[0].adminPassword);
      } else {
        const setting = (await prisma.setting.findUnique({ where: { id: 1 } })) as any;
        if (setting?.adminEmail) validEmail = setting.adminEmail.trim().toLowerCase();
        if (setting?.adminPassword) validPassword = setting.adminPassword;
      }
    } catch (dbErr) {
      console.error("Fetch admin credentials in /api/admin/login error:", dbErr);
    }

    const inputEmail = email ? String(email).trim().toLowerCase() : "";

    if (
      (inputEmail === validEmail || inputEmail === "admin") &&
      password === validPassword
    ) {
      return NextResponse.json({
        success: true,
        token: "kgyk_admin_token_sec_89234",
        user: {
          name: "Admin Operasional KGYK",
          email: validEmail,
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

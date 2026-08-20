import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    let user: any = null;
    try {
      if ((prisma as any).user) {
        user = await (prisma as any).user.findFirst({
          where: {
            email: cleanEmail,
            password: password,
          },
        });
      }
    } catch {
      // Fallback
    }

    if (!user) {
      const userList: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, fullName, email, phone FROM "User" WHERE LOWER(email) = LOWER(?) AND password = ? LIMIT 1`,
        cleanEmail,
        password
      );
      if (userList && userList.length > 0) {
        user = userList[0];
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  } catch (error: any) {
    console.error("POST /api/users/login error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal masuk ke akun." },
      { status: 500 }
    );
  }
}

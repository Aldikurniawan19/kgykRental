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

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: "insensitive" },
        password: password,
      },
    });

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

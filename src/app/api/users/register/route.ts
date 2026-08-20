import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const { fullName, email, phone, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone ? phone.trim() : "";

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar dengan akun lain." },
        { status: 400 }
      );
    }

    const createdUser = await prisma.user.create({
      data: {
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
      },
    });

    return NextResponse.json(
      {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        phone: createdUser.phone,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/users/register error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mendaftarkan akun." },
      { status: 500 }
    );
  }
}

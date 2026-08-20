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

    // Check if user exists using Prisma client or raw query fallback
    let existingUser: any = null;
    try {
      if ((prisma as any).user) {
        existingUser = await (prisma as any).user.findFirst({
          where: { email: cleanEmail },
        });
      }
    } catch {
      // Fallback
    }

    if (!existingUser) {
      const existingList: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "User" WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        cleanEmail
      );
      if (existingList && existingList.length > 0) {
        existingUser = existingList[0];
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar dengan akun lain." },
        { status: 400 }
      );
    }

    // Insert user into SQLite database
    let createdUser: any = null;
    try {
      if ((prisma as any).user) {
        createdUser = await (prisma as any).user.create({
          data: {
            fullName: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            password: password,
          },
        });
      }
    } catch {
      // Fallback
    }

    if (!createdUser) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" ("fullName", "email", "phone", "password", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        cleanName,
        cleanEmail,
        cleanPhone,
        password
      );
      const createdList: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, fullName, email, phone FROM "User" WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        cleanEmail
      );
      createdUser = createdList[0];
    }

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

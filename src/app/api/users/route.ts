import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    let users: any[] = [];
    try {
      if ((prisma as any).user) {
        users = await (prisma as any).user.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch {
      // Fallback
    }

    if (!users || users.length === 0) {
      users = await prisma.$queryRawUnsafe(
        `SELECT id, fullName, email, phone, createdAt FROM "User" ORDER BY createdAt DESC`
      );
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

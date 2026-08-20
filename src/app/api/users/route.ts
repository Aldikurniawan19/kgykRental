import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

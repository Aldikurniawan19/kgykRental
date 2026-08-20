import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  await ensureDbInitialized();

  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT "adminEmail" FROM "Setting" WHERE "id" = 1`
    );
    if (rows && rows.length > 0 && rows[0]?.adminEmail) {
      return NextResponse.json({ adminEmail: rows[0].adminEmail });
    }
  } catch (error) {
    console.error("GET /api/admin/credentials raw query error:", error);
  }

  try {
    const setting = (await prisma.setting.findUnique({
      where: { id: 1 },
    })) as any;

    if (setting?.adminEmail) {
      return NextResponse.json({ adminEmail: setting.adminEmail });
    }
  } catch (error) {
    console.error("GET /api/admin/credentials Prisma error:", error);
  }

  return NextResponse.json({ adminEmail: "admin@kgyk.com" });
}

export async function POST(request: Request) {
  await ensureDbInitialized();

  try {
    const body = await request.json();
    const { currentPassword, newAdminEmail, newAdminPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Kata sandi lama admin wajib diisi untuk verifikasi." },
        { status: 400 }
      );
    }

    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email admin baru tidak valid." },
        { status: 400 }
      );
    }

    // Get current stored password directly from database
    let existingPassword = "admin123";

    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "adminPassword" FROM "Setting" WHERE "id" = 1`
      );
      if (rows && rows.length > 0 && rows[0]?.adminPassword) {
        existingPassword = String(rows[0].adminPassword);
      } else {
        const setting = (await prisma.setting.findUnique({
          where: { id: 1 },
        })) as any;
        if (setting?.adminPassword) {
          existingPassword = setting.adminPassword;
        }
      }
    } catch {
      try {
        const setting = (await prisma.setting.findUnique({
          where: { id: 1 },
        })) as any;
        if (setting?.adminPassword) {
          existingPassword = setting.adminPassword;
        }
      } catch {}
    }

    if (currentPassword !== existingPassword) {
      return NextResponse.json(
        { error: "Kata sandi lama admin salah. Verifikasi gagal." },
        { status: 400 }
      );
    }

    const finalPassword =
      newAdminPassword && newAdminPassword.trim().length > 0
        ? newAdminPassword.trim()
        : existingPassword;

    const finalEmail = newAdminEmail.trim().toLowerCase();

    // Execute raw SQL UPSERT to ensure record exists and fields update directly in DB
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("id", "adminEmail", "adminPassword", "phone", "whatsapp", "email", "address", "updatedAt")
         VALUES (1, $1, $2, '+62 881-0233-31644', '62881023331644', 'info@kgykrental.com', 'Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281', CURRENT_TIMESTAMP)
         ON CONFLICT ("id")
         DO UPDATE SET "adminEmail" = EXCLUDED."adminEmail", "adminPassword" = EXCLUDED."adminPassword", "updatedAt" = CURRENT_TIMESTAMP;`,
        finalEmail,
        finalPassword
      );
    } catch (upsertErr) {
      console.error("Raw SQL upsert error:", upsertErr);
      await prisma.$executeRawUnsafe(
        `UPDATE "Setting" SET "adminEmail" = $1, "adminPassword" = $2 WHERE "id" = 1;`,
        finalEmail,
        finalPassword
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kredensial email dan password admin berhasil diperbarui!",
      adminEmail: finalEmail,
    });
  } catch (error: any) {
    console.error("POST /api/admin/credentials error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui akun admin: " + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

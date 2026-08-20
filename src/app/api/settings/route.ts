import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

const DEFAULT_SETTINGS = {
  phone: "+62 881-0233-31644",
  whatsapp: "62881023331644",
  email: "info@kgykrental.com",
  address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
};

export async function GET() {
  await ensureDbInitialized();

  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Setting" WHERE "id" = 1 LIMIT 1`
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const setting = rows[0];
    return NextResponse.json({
      phone: setting.phone || DEFAULT_SETTINGS.phone,
      whatsapp: setting.whatsapp || DEFAULT_SETTINGS.whatsapp,
      email: setting.email || DEFAULT_SETTINGS.email,
      address: setting.address || DEFAULT_SETTINGS.address,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: Request) {
  await ensureDbInitialized();

  try {
    const body = await request.json();
    const { phone, whatsapp, email, address } = body;

    // Clean up whatsapp number (remove plus, spaces, dashes)
    let cleanWa = whatsapp ? String(whatsapp).replace(/[^0-9]/g, "") : "";
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }

    const finalPhone = phone || DEFAULT_SETTINGS.phone;
    const finalWa = cleanWa || DEFAULT_SETTINGS.whatsapp;
    const finalEmail = email || DEFAULT_SETTINGS.email;
    const finalAddress = address || DEFAULT_SETTINGS.address;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("id", "phone", "whatsapp", "email", "address", "updatedAt")
       VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT("id") DO UPDATE SET
         "phone" = excluded."phone",
         "whatsapp" = excluded."whatsapp",
         "email" = excluded."email",
         "address" = excluded."address",
         "updatedAt" = CURRENT_TIMESTAMP`,
      finalPhone,
      finalWa,
      finalEmail,
      finalAddress
    );

    return NextResponse.json({
      id: 1,
      phone: finalPhone,
      whatsapp: finalWa,
      email: finalEmail,
      address: finalAddress,
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan kontak" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

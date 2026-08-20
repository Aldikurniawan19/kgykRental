import { prisma } from "./prisma";
import { cars as defaultCars } from "@/data/cars";

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  try {
    // 1. Create Car table if not exists (PostgreSQL / SQLite compatible)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Car" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "capacity" TEXT NOT NULL,
          "trans" TEXT NOT NULL,
          "price" INTEGER NOT NULL,
          "img" TEXT NOT NULL,
          "status" BOOLEAN NOT NULL DEFAULT true,
          "category" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch {
      // Fallback for SQLite syntax if running locally on SQLite
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Car" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "name" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "capacity" TEXT NOT NULL,
            "trans" TEXT NOT NULL,
            "price" INTEGER NOT NULL,
            "img" TEXT NOT NULL,
            "status" BOOLEAN NOT NULL DEFAULT true,
            "category" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}
    }

    // 2. Create Booking table if not exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Booking" (
          "id" SERIAL PRIMARY KEY,
          "bookingCode" TEXT NOT NULL UNIQUE,
          "userEmail" TEXT NOT NULL,
          "userName" TEXT NOT NULL,
          "userPhone" TEXT,
          "carId" INTEGER NOT NULL,
          "carName" TEXT NOT NULL,
          "startDate" TEXT NOT NULL,
          "endDate" TEXT NOT NULL,
          "duration" INTEGER NOT NULL,
          "serviceType" TEXT NOT NULL,
          "pickupLocation" TEXT NOT NULL,
          "dropoffLocation" TEXT NOT NULL,
          "notes" TEXT,
          "totalPrice" INTEGER NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
          "paymentStatus" TEXT NOT NULL DEFAULT 'Belum Bayar',
          "paymentMethod" TEXT DEFAULT 'Belum Dipilih',
          "paidAt" TIMESTAMP,
          "releasedAt" TIMESTAMP,
          "returnedAt" TIMESTAMP,
          "lateFeeHours" INTEGER NOT NULL DEFAULT 0,
          "lateFee" INTEGER NOT NULL DEFAULT 0,
          "grandTotal" INTEGER NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Booking" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "bookingCode" TEXT NOT NULL UNIQUE,
            "userEmail" TEXT NOT NULL,
            "userName" TEXT NOT NULL,
            "userPhone" TEXT,
            "carId" INTEGER NOT NULL,
            "carName" TEXT NOT NULL,
            "startDate" TEXT NOT NULL,
            "endDate" TEXT NOT NULL,
            "duration" INTEGER NOT NULL,
            "serviceType" TEXT NOT NULL,
            "pickupLocation" TEXT NOT NULL,
            "dropoffLocation" TEXT NOT NULL,
            "notes" TEXT,
            "totalPrice" INTEGER NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
            "paymentStatus" TEXT NOT NULL DEFAULT 'Belum Bayar',
            "paymentMethod" TEXT DEFAULT 'Belum Dipilih',
            "paidAt" DATETIME,
            "releasedAt" DATETIME,
            "returnedAt" DATETIME,
            "lateFeeHours" INTEGER NOT NULL DEFAULT 0,
            "lateFee" INTEGER NOT NULL DEFAULT 0,
            "grandTotal" INTEGER NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}
    }

    // Ensure paymentMethod column exists
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Booking" ADD COLUMN "paymentMethod" TEXT DEFAULT 'Belum Dipilih';
      `);
    } catch {}

    // 3. Create User table if not exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" SERIAL PRIMARY KEY,
          "fullName" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "phone" TEXT,
          "password" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "fullName" TEXT NOT NULL,
            "email" TEXT NOT NULL UNIQUE,
            "phone" TEXT,
            "password" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}
    }

    // 4. Create Setting table if not exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Setting" (
          "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
          "phone" TEXT NOT NULL DEFAULT '+62 881-0233-31644',
          "whatsapp" TEXT NOT NULL DEFAULT '62881023331644',
          "email" TEXT NOT NULL DEFAULT 'info@kgykrental.com',
          "address" TEXT NOT NULL DEFAULT 'Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281',
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch {}

    // Seed default setting row if empty
    try {
      const count = await prisma.setting.count();
      if (count === 0) {
        await prisma.setting.create({
          data: {
            id: 1,
            phone: "+62 881-0233-31644",
            whatsapp: "62881023331644",
            email: "info@kgykrental.com",
            address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
          },
        });
      }
    } catch (settingErr) {
      console.warn("Setting seeding warning:", settingErr);
    }

    // 5. Seed initial Users if User table is empty
    try {
      const count = await prisma.user.count();
      if (count === 0) {
        await prisma.user.createMany({
          data: [
            {
              fullName: "Aldi Kurniawan",
              email: "aldi@gmail.com",
              phone: "081234567890",
              password: "password123",
            },
            {
              fullName: "Budi Santoso",
              email: "budi@yahoo.com",
              phone: "085678901234",
              password: "password123",
            },
          ],
        });
      }
    } catch (userErr) {
      console.warn("User seeding warning:", userErr);
    }

    // 3. Seed Cars if table is empty
    const carCount = await prisma.car.count();
    if (carCount === 0) {
      for (const car of defaultCars) {
        await prisma.car.create({
          data: {
            id: car.id,
            name: car.name,
            type: car.type,
            capacity: car.capacity,
            trans: car.trans,
            price: car.price,
            img: car.img,
            status: car.status,
            category: car.category,
            description: car.description,
          },
        });
      }
    }

    // 4. Seed Sample Bookings if table is empty
    const bookingCount = await prisma.booking.count();
    if (bookingCount === 0) {
      await prisma.booking.createMany({
        data: [
          {
            bookingCode: "KGYK-N97AVH",
            userEmail: "aldi@gmail.com",
            userName: "Aldi Kurniawan",
            userPhone: "081234567890",
            carId: 2,
            carName: "Toyota Innova Reborn",
            startDate: "2026-08-18",
            endDate: "2026-08-20",
            duration: 3,
            serviceType: "Sewa Mobil",
            pickupLocation: "Kantor KGYK Yogyakarta",
            dropoffLocation: "Kantor KGYK Yogyakarta",
            notes: "Mohon siapkan unit yang bersih dan wangi.",
            totalPrice: 1650000,
            status: "Menunggu Verifikasi",
            paymentStatus: "Belum Bayar",
            lateFeeHours: 0,
            lateFee: 0,
            grandTotal: 1650000,
          },
          {
            bookingCode: "KGYK-DW5VCY",
            userEmail: "aldi@gmail.com",
            userName: "Aldi Kurniawan",
            userPhone: "081234567890",
            carId: 1,
            carName: "Toyota Veloz",
            startDate: "2026-08-20",
            endDate: "2026-08-21",
            duration: 2,
            serviceType: "Sewa Mobil",
            pickupLocation: "Kantor KGYK Yogyakarta",
            dropoffLocation: "Kantor KGYK Yogyakarta",
            notes: "Diantar ke YIA jika memungkinkan.",
            totalPrice: 800000,
            status: "Disetujui",
            paymentStatus: "Lunas",
            lateFeeHours: 0,
            lateFee: 0,
            grandTotal: 800000,
          },
          {
            bookingCode: "KGYK-RB889X",
            userEmail: "budi@yahoo.com",
            userName: "Budi Santoso",
            userPhone: "085678901234",
            carId: 3,
            carName: "Jeep Wrangler Rubicon",
            startDate: "2026-08-10",
            endDate: "2026-08-12",
            duration: 2,
            serviceType: "Mobil + Driver",
            pickupLocation: "Hotel Tentrem Yogyakarta",
            dropoffLocation: "Bandara YIA",
            notes: "Perjalanan wisata Gunung Merapi.",
            totalPrice: 3500000,
            status: "Selesai",
            paymentStatus: "Lunas",
            lateFeeHours: 0,
            lateFee: 0,
            grandTotal: 3500000,
          },
        ],
      });
    }

    isInitialized = true;
  } catch (error) {
    console.error("Database auto-initialization error:", error);
  }
}

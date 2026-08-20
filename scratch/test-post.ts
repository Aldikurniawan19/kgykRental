import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

async function main() {
  try {
    await ensureDbInitialized();

    const car = await prisma.car.create({
      data: {
        name: "Test Car",
        type: "MPV",
        capacity: "7 Penumpang",
        trans: "Matic",
        price: 400000,
        img: "/assets/imgMobil/toyotaVelos.png",
        status: true,
        category: "mpv",
        description: "Test description",
      },
    });

    console.log("SUCCESS:", car);
  } catch (err: any) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

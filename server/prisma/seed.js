const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting High-Performance Seeding...");

  // 1. Bersihkan Database (Child dulu baru Parent)
  console.time("🧹 Cleaning Data");
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.user.deleteMany();
  console.timeEnd("🧹 Cleaning Data");

  // Password default "123456" (Hash sekali aja biar cepet)
  const hashedPassword = await bcrypt.hash("123456", 10);

  // KONFIGURASI JUMLAH DATA
  const TOTAL_USERS = 250;
  const BATCH_SIZE = 50; // Memproses 50 user sekaligus biar ngebut

  console.log(`🌱 Generating ${TOTAL_USERS} users in batches of ${BATCH_SIZE}...`);
  console.time("⏱️ Total Seeding Time");

  // 2. Loop Utama (Batching)
  for (let i = 0; i < TOTAL_USERS; i += BATCH_SIZE) {
    const userPromises = [];

    // Buat batch user
    for (let j = 0; j < BATCH_SIZE; j++) {
      if (i + j >= TOTAL_USERS) break; // Stop kalau sudah lebih dari target

      // --- GENERATE DATA DUMMY ---
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName });

      // A. Transaksi (Jumlah Acak 20 - 80 per user biar variatif)
      const transactionsData = [];
      const txCount = faker.number.int({ min: 20, max: 80 });

      for (let k = 0; k < txCount; k++) {
        const isIncome = Math.random() > 0.6;
        transactionsData.push({
          title: faker.commerce.productName(),
          amount: parseFloat(faker.finance.amount({ min: 10000, max: 1000000, dec: 0 })),
          type: isIncome ? "INCOME" : "EXPENSE",
          category: isIncome ? faker.helpers.arrayElement(["Allowance", "Salary", "Bonus", "Others"]) : faker.helpers.arrayElement(["Food", "Transport", "Data", "Shopping", "Entertainment"]),
          priority: isIncome ? "NEED" : faker.helpers.arrayElement(["NEED", "WANT"]),
          // Spread tanggal dalam 1 tahun terakhir (biar filter tahunan jalan)
          date: faker.date.past({ years: 1 }),
        });
      }

      // B. Budgets
      const budgetsData = [];
      const categories = ["Food", "Transport", "Shopping", "Entertainment", "Bills"];
      categories.forEach((cat) => {
        budgetsData.push({
          category: cat,
          limit: parseFloat(faker.finance.amount({ min: 500000, max: 2000000, dec: 0 })),
        });
      });

      // C. Goals (Acak 1 - 4 Goals)
      const goalsData = [];
      const goalCount = faker.number.int({ min: 1, max: 4 });
      for (let l = 0; l < goalCount; l++) {
        const target = parseFloat(faker.finance.amount({ min: 1000000, max: 10000000, dec: 0 }));
        goalsData.push({
          title: faker.commerce.product(),
          targetAmount: target,
          savedAmount: parseFloat(faker.finance.amount({ min: 0, max: target, dec: 0 })),
        });
      }

      // D. Schedules (Acak 3 - 6 Jadwal)
      const schedulesData = [];
      const scheduleCount = faker.number.int({ min: 3, max: 6 });
      for (let m = 0; m < scheduleCount; m++) {
        schedulesData.push({
          subject: faker.company.buzzPhrase(),
          day: faker.helpers.arrayElement(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
          time: `${faker.number.int({ min: 7, max: 16 })}:00`,
          room: `Room ${faker.number.int({ min: 101, max: 405 })}`,
          type: faker.helpers.arrayElement(["Lecture", "Lab", "Exam"]),
          isCompleted: faker.datatype.boolean(),
        });
      }

      // Masukkan Query ke dalam Array (Belum dieksekusi)
      userPromises.push(
        prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            // Nested write (sekaligus insert anak-anaknya)
            transactions: { create: transactionsData },
            budgets: { create: budgetsData },
            goals: { create: goalsData },
            schedules: { create: schedulesData },
          },
        }),
      );
    }

    // Eksekusi Batch ini secara PARALEL
    await Promise.all(userPromises);

    // Log Progress
    const currentCount = Math.min(i + BATCH_SIZE, TOTAL_USERS);
    console.log(`✅ Created users ${currentCount}/${TOTAL_USERS}`);
  }

  console.timeEnd("⏱️ Total Seeding Time");
  console.log(`🎉 Seeding finished! ${TOTAL_USERS} Users generated with random data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

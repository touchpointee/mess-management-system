import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const MESS = {
  lat: 8.56,
  lng: 76.882,
  name: "TouchPointe Mess",
  shortName: "TPM",
  phone: "+919876543210",
  email: "admin@touchpointe.local",
  address: "Kazhakkuttam Main Road",
  city: "Thiruvananthapuram",
  breakfastPrice: 60,
  lunchPrice: 90,
  dinnerPrice: 80,
  heroImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
};

async function main() {
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {
      businessName: MESS.name,
      shortName: MESS.shortName,
      phone: MESS.phone,
      supportEmail: MESS.email,
      address: MESS.address,
      city: MESS.city,
      lat: MESS.lat,
      lng: MESS.lng,
      breakfastPrice: MESS.breakfastPrice,
      lunchPrice: MESS.lunchPrice,
      dinnerPrice: MESS.dinnerPrice,
      heroImageUrl: MESS.heroImageUrl,
    },
    create: {
      id: "default",
      businessName: MESS.name,
      shortName: MESS.shortName,
      phone: MESS.phone,
      supportEmail: MESS.email,
      address: MESS.address,
      city: MESS.city,
      lat: MESS.lat,
      lng: MESS.lng,
      breakfastPrice: MESS.breakfastPrice,
      lunchPrice: MESS.lunchPrice,
      dinnerPrice: MESS.dinnerPrice,
      heroImageUrl: MESS.heroImageUrl,
    },
  });

  await prisma.payment.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.dayBooking.deleteMany();
  await prisma.deliveryLocation.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      phone: MESS.phone,
      email: MESS.email,
      password: adminPassword,
      role: "ADMIN",
      address: `${MESS.address}, ${MESS.city}`,
      lat: MESS.lat,
      lng: MESS.lng,
    },
  });

  const customerPassword = await hash("customer1", 12);
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ramesh Kumar",
        phone: "+919876543211",
        email: "ramesh.k@example.com",
        password: customerPassword,
        role: "CUSTOMER",
        address: "Sreekaryam, Thiruvananthapuram",
        lat: 8.5442,
        lng: 76.9067,
      },
    }),
    prisma.user.create({
      data: {
        name: "Lakshmi Nair",
        phone: "+919876543212",
        email: "lakshmi.n@example.com",
        password: customerPassword,
        role: "CUSTOMER",
        address: "Pattom, Thiruvananthapuram",
        lat: 8.5241,
        lng: 76.9366,
      },
    }),
    prisma.user.create({
      data: {
        name: "Suresh Pillai",
        phone: "+919876543213",
        email: "suresh.p@example.com",
        password: customerPassword,
        role: "CUSTOMER",
        address: "Technopark, Thiruvananthapuram",
        lat: 8.5454,
        lng: 76.8754,
      },
    }),
    prisma.user.create({
      data: {
        name: "Devi Krishnan",
        phone: "+919876543214",
        email: "devi.k@example.com",
        password: customerPassword,
        role: "CUSTOMER",
        address: "Kazhakkoottam, Thiruvananthapuram",
        lat: 8.562,
        lng: 76.878,
      },
    }),
  ]);

  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        userId: customers[0].id,
        monthlyFee: 2500,
        startDate: new Date("2025-01-01"),
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        userId: customers[1].id,
        monthlyFee: 3000,
        startDate: new Date("2025-02-15"),
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        userId: customers[2].id,
        monthlyFee: 2000,
        startDate: new Date("2025-03-01"),
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        userId: customers[3].id,
        monthlyFee: 3500,
        startDate: new Date("2025-01-15"),
        isActive: true,
      },
    }),
  ]);

  for (let i = 0; i < customers.length; i++) {
    const u = customers[i];
    await prisma.deliveryLocation.createMany({
      data: [
        { userId: u.id, label: "Home", address: u.address!, lat: u.lat!, lng: u.lng!, mealType: "BREAKFAST", isDefault: true },
        { userId: u.id, label: "Home", address: u.address!, lat: u.lat!, lng: u.lng!, mealType: "LUNCH", isDefault: true },
        { userId: u.id, label: "Home", address: u.address!, lat: u.lat!, lng: u.lng!, mealType: "DINNER", isDefault: true },
      ],
    });
  }

  await prisma.leave.createMany({
    data: [
      { userId: customers[0].id, date: new Date(), mealType: "LUNCH" },
      { userId: customers[1].id, date: new Date(), mealType: "BREAKFAST" },
      { userId: customers[2].id, date: addDays(new Date(), 1), mealType: "DINNER" },
    ],
  });

  await prisma.payment.createMany({
    data: [
      { userId: customers[0].id, amount: 2500, date: new Date("2025-01-15"), note: "Jan cycle" },
      { userId: customers[0].id, amount: 2500, date: new Date("2025-02-20"), note: "Feb cycle" },
      { userId: customers[1].id, amount: 3000, date: new Date("2025-03-01"), note: "Mar" },
      { userId: customers[2].id, amount: 1000, date: new Date("2025-03-10"), note: "Partial" },
    ],
  });

  console.log("Seeded admin:", admin.email);
  console.log("Seeded customers:", customers.length);
  console.log("Seeded plans:", plans.length);
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

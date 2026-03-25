import "dotenv/config";
import mongoose from "mongoose";
import { hash } from "bcryptjs";
import { addDays, startOfDay } from "date-fns";
import {
  User,
  SystemSettings,
  Payment,
  DeliveryLocation,
  Leave,
  DayBooking,
} from "../lib/models";

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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(uri);

  await SystemSettings.findOneAndUpdate(
    { _id: "default" },
    {
      $set: {
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
      $setOnInsert: { _id: "default" },
    },
    { upsert: true }
  );

  await Payment.deleteMany({});
  await Leave.deleteMany({});
  await DayBooking.deleteMany({});
  await DeliveryLocation.deleteMany({});
  await User.deleteMany({});

  const adminPassword = await hash("admin123", 12);
  const admin = await User.create({
    name: "Admin",
    phone: MESS.phone,
    email: MESS.email,
    password: adminPassword,
    role: "ADMIN",
    address: `${MESS.address}, ${MESS.city}`,
    lat: MESS.lat,
    lng: MESS.lng,
  });

  const customerPassword = await hash("customer1", 12);
  const customers = await User.insertMany([
    {
      name: "Ramesh Kumar",
      phone: "+919876543211",
      email: "ramesh.k@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      address: "Sreekaryam, Thiruvananthapuram",
      lat: 8.5442,
      lng: 76.9067,
      startDate: new Date("2025-01-01"),
    },
    {
      name: "Lakshmi Nair",
      phone: "+919876543212",
      email: "lakshmi.n@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      address: "Pattom, Thiruvananthapuram",
      lat: 8.5241,
      lng: 76.9366,
      startDate: new Date("2025-02-15"),
    },
    {
      name: "Suresh Pillai",
      phone: "+919876543213",
      email: "suresh.p@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      address: "Technopark, Thiruvananthapuram",
      lat: 8.5454,
      lng: 76.8754,
      startDate: new Date("2025-03-01"),
    },
    {
      name: "Devi Krishnan",
      phone: "+919876543214",
      email: "devi.k@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      address: "Kazhakkoottam, Thiruvananthapuram",
      lat: 8.562,
      lng: 76.878,
      startDate: new Date("2025-01-15"),
    },
  ]);

  for (const u of customers) {
    await DeliveryLocation.insertMany([
      {
        userId: u._id,
        label: "Home",
        address: u.address!,
        lat: u.lat!,
        lng: u.lng!,
        mealType: "BREAKFAST",
        isDefault: true,
      },
      {
        userId: u._id,
        label: "Home",
        address: u.address!,
        lat: u.lat!,
        lng: u.lng!,
        mealType: "LUNCH",
        isDefault: true,
      },
      {
        userId: u._id,
        label: "Home",
        address: u.address!,
        lat: u.lat!,
        lng: u.lng!,
        mealType: "DINNER",
        isDefault: true,
      },
    ]);
  }

  const todayStart = startOfDay(new Date());
  await Leave.insertMany([
    { userId: customers[0]._id, date: todayStart, mealType: "LUNCH" },
    { userId: customers[1]._id, date: todayStart, mealType: "BREAKFAST" },
    {
      userId: customers[2]._id,
      date: startOfDay(addDays(new Date(), 1)),
      mealType: "DINNER",
    },
  ]);

  await Payment.insertMany([
    { userId: customers[0]._id, amount: 2500, date: new Date("2025-01-15"), note: "Jan cycle" },
    { userId: customers[0]._id, amount: 2500, date: new Date("2025-02-20"), note: "Feb cycle" },
    { userId: customers[1]._id, amount: 3000, date: new Date("2025-03-01"), note: "Mar" },
    { userId: customers[2]._id, amount: 1000, date: new Date("2025-03-10"), note: "Partial" },
  ]);

  console.log("Seeded admin:", admin.email);
  console.log("Seeded customers:", customers.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());

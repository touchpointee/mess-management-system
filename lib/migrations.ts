import { hash } from "bcryptjs";
import {
  User,
  Payment,
  DeliveryLocation,
  Leave,
  DayBooking,
  DeliveryOrder,
  MessHoliday,
  SystemSettings,
} from "./models";

export async function runSaaSMigration() {
  console.log("Starting SaaS Multi-tenant migration checks...");

  // 1. Check if SystemSettings has a "default" mess. If not, it means the database is empty.
  const defaultSettings = await SystemSettings.findById("default").lean();
  if (!defaultSettings) {
    console.log("No default SystemSettings found. Skipping migration.");
    // Still, make sure we seed the Super Admin if it's missing
    await seedSuperAdmin();
    return;
  }

  // 2. Add messId: "default" to all documents without it to prevent breaking production
  console.log("Migrating database records to messId: 'default'...");
  
  const results = await Promise.all([
    User.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    Payment.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    DeliveryLocation.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    Leave.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    DayBooking.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    DeliveryOrder.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
    MessHoliday.updateMany({ messId: { $exists: false } }, { $set: { messId: "default" } }),
  ]);

  console.log("Migration updates completed. Match/Modified counts:", results.map(r => `${r.matchedCount}/${r.modifiedCount}`));

  // 3. Drop the old unique index on MessHoliday if it exists
  try {
    const indexes = await MessHoliday.collection.indexes();
    const hasOldIndex = indexes.some((idx) => idx.name === "date_1_mealType_1");
    if (hasOldIndex) {
      console.log("Dropping old MessHoliday unique index (date_1_mealType_1)...");
      await MessHoliday.collection.dropIndex("date_1_mealType_1");
      console.log("Successfully dropped old index.");
    }
  } catch (err) {
    console.error("Failed to drop old index on MessHoliday (it might have already been dropped or does not exist):", err);
  }

  // 4. Seed default Super Admin
  await seedSuperAdmin();

  console.log("SaaS Multi-tenant migration check completed successfully.");
}

async function seedSuperAdmin() {
  const superAdmin = await User.findOne({ role: "SUPER_ADMIN" }).lean();
  if (!superAdmin) {
    console.log("Seeding default Super Admin user...");
    const hashedPassword = await hash("superadmin123", 12);
    await User.create({
      name: "Super Admin",
      phone: "+910000000000",
      email: "superadmin@mess.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
      messId: "default", // Super admin defaults to main mess workspace context if needed, but uses super admin portal
    });
    console.log("Default Super Admin seeded: superadmin@mess.com / superadmin123");
  }
}

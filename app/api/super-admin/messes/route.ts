import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, SystemSettings } from "@/lib/models";
import { ApprovalStatus, Role } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  // Find all messes (SystemSettings)
  const settingsList = await SystemSettings.find({}).lean();

  const messesWithDetails = await Promise.all(
    settingsList.map(async (mess) => {
      const [customersCount, partnersCount, adminUser] = await Promise.all([
        User.countDocuments({
          messId: mess._id,
          role: Role.CUSTOMER,
          approvalStatus: ApprovalStatus.APPROVED,
        }),
        User.countDocuments({
          messId: mess._id,
          role: Role.DELIVERY_PARTNER,
          isActive: { $ne: false },
        }),
        User.findOne({
          messId: mess._id,
          role: Role.ADMIN,
        })
          .select({ name: 1, phone: 1, email: 1 })
          .lean(),
      ]);

      return {
        id: mess._id,
        businessName: mess.businessName,
        shortName: mess.shortName,
        phone: mess.phone,
        supportEmail: mess.supportEmail,
        address: mess.address,
        city: mess.city,
        breakfastPrice: mess.breakfastPrice,
        lunchPrice: mess.lunchPrice,
        dinnerPrice: mess.dinnerPrice,
        customersCount,
        partnersCount,
        admin: adminUser
          ? {
              name: adminUser.name,
              phone: adminUser.phone,
              email: adminUser.email,
            }
          : null,
      };
    })
  );

  const [totalCustomers, totalAdmins] = await Promise.all([
    User.countDocuments({ role: Role.CUSTOMER }),
    User.countDocuments({ role: Role.ADMIN }),
  ]);

  return NextResponse.json({
    messes: messesWithDetails,
    stats: {
      totalMesses: settingsList.length,
      totalCustomers,
      totalAdmins,
    },
  });
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      businessName,
      shortName,
      phone,
      email,
      address,
      city,
      lat,
      lng,
      breakfastPrice,
      lunchPrice,
      dinnerPrice,
      adminName,
      adminPhone,
      adminEmail,
      adminPassword,
    } = body;

    if (
      !businessName ||
      !shortName ||
      !phone ||
      !address ||
      !city ||
      !adminName ||
      !adminPhone ||
      !adminPassword
    ) {
      return NextResponse.json(
        { message: "Required fields are missing." },
        { status: 400 }
      );
    }

    await connectDB();

    // Enforce unique phone/email for admin globally
    const existingUser = await User.findOne({
      $or: [
        { phone: adminPhone.trim() },
        ...(adminEmail ? [{ email: adminEmail.trim() }] : []),
      ],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { message: "Admin phone or email is already in use by another account." },
        { status: 400 }
      );
    }

    const newMessId = randomUUID();

    // 1. Create SystemSettings (Mess)
    await SystemSettings.create({
      _id: newMessId,
      businessName: businessName.trim(),
      shortName: shortName.trim().toUpperCase(),
      phone: phone.trim(),
      supportEmail: email?.trim() || null,
      address: address.trim(),
      city: city.trim(),
      lat: Number(lat || 0),
      lng: Number(lng || 0),
      breakfastPrice: Number(breakfastPrice || 0),
      lunchPrice: Number(lunchPrice || 0),
      dinnerPrice: Number(dinnerPrice || 0),
      heroImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    });

    // 2. Create Mess Admin
    const hashedPassword = await hash(adminPassword, 12);
    await User.create({
      name: adminName.trim(),
      phone: adminPhone.trim(),
      email: adminEmail?.trim() || null,
      password: hashedPassword,
      role: Role.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
      approvedAt: new Date(),
      messId: newMessId,
      address: `${address.trim()}, ${city.trim()}`,
      lat: Number(lat || 0),
      lng: Number(lng || 0),
    });

    return NextResponse.json({
      success: true,
      messId: newMessId,
    });
  } catch (e) {
    console.error("Error creating mess:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

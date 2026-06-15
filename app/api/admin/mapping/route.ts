import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, PreMappedPhone } from "@/lib/models";
import { Role } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const messId = (token?.messId as string) || "default";
  await connectDB();
  const list = await PreMappedPhone.find({ messId })
    .sort({ createdAt: -1 })
    .lean();

  const phones = list.map((item) => item.phone);
  const registeredUsers = await User.find({ phone: { $in: phones } })
    .select({ phone: 1, name: 1 })
    .lean();
  const registeredMap = new Map(registeredUsers.map((u) => [u.phone, u.name]));

  return NextResponse.json(
    list.map((item) => ({
      id: item._id,
      phone: item.phone,
      registeredName: registeredMap.get(item.phone) || null,
      createdAt: item.createdAt ?? null,
    }))
  );
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { phone } = body as { phone?: string };
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ message: "Phone number is required." }, { status: 400 });
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      return NextResponse.json({ message: "Phone number cannot be empty." }, { status: 400 });
    }

    await connectDB();

    // Check if the phone is already mapped to ANY mess
    const existingMapped = await PreMappedPhone.findOne({ phone: trimmedPhone }).lean();
    if (existingMapped) {
      return NextResponse.json(
        { message: "This phone number is already mapped to a mess." },
        { status: 400 }
      );
    }

    // Check if a user with this phone number is already registered
    const existingUser = await User.findOne({ phone: trimmedPhone }).lean();
    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this phone number is already registered." },
        { status: 400 }
      );
    }

    const messId = (token?.messId as string) || "default";
    const newItem = await PreMappedPhone.create({
      phone: trimmedPhone,
      messId,
    });

    return NextResponse.json({
      success: true,
      id: newItem._id,
      phone: newItem.phone,
      createdAt: newItem.createdAt,
    });
  } catch (e) {
    console.error("Error in POST mapping phone:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Mapping ID is required." }, { status: 400 });
    }

    await connectDB();
    const messId = (token?.messId as string) || "default";
    const deleted = await PreMappedPhone.findOneAndDelete({
      _id: id,
      messId,
    });

    if (!deleted) {
      return NextResponse.json({ message: "Mapped phone number not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error in DELETE mapping phone:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

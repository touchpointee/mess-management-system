import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { Role } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, password } = body;
    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "Name, phone and password are required." },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await User.findOne({
      $or: [
        { phone: phone.trim() },
        ...(email ? [{ email: email.trim() }] : []),
      ],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "Phone or email already registered." },
        { status: 400 }
      );
    }
    const hashed = await hash(password, 12);
    await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      password: hashed,
      role: Role.CUSTOMER,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Registration failed." },
      { status: 500 }
    );
  }
}

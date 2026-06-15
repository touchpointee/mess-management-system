import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, SystemSettings } from "@/lib/models";
import { ApprovalStatus } from "@/lib/constants";

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { phone, messId } = await req.json();

    if (!phone || !messId) {
      return NextResponse.json(
        { message: "Phone number and Mess Workspace are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Verify Mess exists
    const messExists = await SystemSettings.findById(messId).lean();
    if (!messExists) {
      return NextResponse.json(
        { message: "Selected Mess Workspace does not exist." },
        { status: 404 }
      );
    }

    // 2. Find User by phone
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return NextResponse.json(
        { message: "User with this phone number not found in registry." },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Administrators cannot be re-mapped to customer spaces." },
        { status: 400 }
      );
    }

    // 3. Update mapping
    user.messId = messId;
    user.approvalStatus = ApprovalStatus.APPROVED;
    user.approvedAt = new Date();
    user.approvedBy = token.sub ?? null;

    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${user.name} successfully mapped to ${messExists.businessName}.`,
    });
  } catch (e) {
    console.error("Error mapping user (super admin):", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

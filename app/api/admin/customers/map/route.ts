import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { ApprovalStatus } from "@/lib/constants";

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const messId = (token?.messId as string) || "default";

  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { message: "Phone number is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find User by phone
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return NextResponse.json(
        { message: "User with this phone number not found in registry." },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Administrators cannot be mapped to customer spaces." },
        { status: 400 }
      );
    }

    // Check if user is already mapped to a different mess
    if (user.messId && user.messId !== "unmapped" && user.messId !== messId) {
      return NextResponse.json(
        {
          message:
            "User is already mapped to another mess workspace. Please contact the super admin to transfer this user.",
        },
        { status: 400 }
      );
    }

    // Update mapping
    user.messId = messId;
    user.approvalStatus = ApprovalStatus.APPROVED;
    user.approvedAt = new Date();
    user.approvedBy = token.sub ?? null;

    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${user.name} successfully mapped to your mess.`,
    });
  } catch (e) {
    console.error("Error mapping user (mess admin):", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

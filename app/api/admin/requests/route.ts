import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { ApprovalStatus, Role } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const pendingUsers = await User.find({
    role: Role.CUSTOMER,
    approvalStatus: ApprovalStatus.PENDING,
  })
    .select({ name: 1, phone: 1, email: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    pendingUsers.map((user) => ({
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? null,
      createdAt: user.createdAt ?? null,
    }))
  );
}

export async function PATCH(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ message: "Request id is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: Role.CUSTOMER,
        approvalStatus: ApprovalStatus.PENDING,
      },
      {
        $set: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: token.sub ?? null,
        },
      },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { message: "Pending request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: user._id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

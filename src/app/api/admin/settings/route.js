import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/services/settings.service";
import { getCurrentAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // We can fetch all settings we need, for now just announcement
    const announcement = await getSetting("announcement", {
      text: "Launch offer: take 20% off your first course with code",
      code: "WELCOME20",
      enabled: true
    });

    return NextResponse.json({ announcement });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (data.announcement) {
      await setSetting("announcement", data.announcement);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { searchCourses } from "@/services/courses.service";

export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchCourses(q, 6);
  return NextResponse.json({ results });
}

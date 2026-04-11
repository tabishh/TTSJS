import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("TRACK API HIT:", email);

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const today = new Date().toDateString();

    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, "{}");
    }

    const file = fs.readFileSync(filePath, "utf-8");
    let data: any = file ? JSON.parse(file) : {};

    console.log("Before:", data);

    if (!data[email]) {
      data[email] = { count: 0, date: today };
    }

    if (data[email].date !== today) {
      data[email] = { count: 0, date: today };
    }

    if (data[email].count >= 3) {
      return NextResponse.json({
        allowed: false,
        message: "Free limit reached. ₹2 per download"
      });
    }

    data[email].count += 1;

    console.log("After:", data);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      allowed: true,
      remaining: 3 - data[email].count
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
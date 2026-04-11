import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Razorpay order...");

    const order = await razorpay.orders.create({
      amount: 200, // ₹2 = 200 paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    console.log("Order created:", order.id);

    return NextResponse.json(order);

  } catch (err) {
    console.error("Razorpay Error:", err);

    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
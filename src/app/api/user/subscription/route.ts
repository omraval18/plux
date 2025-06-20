import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const subscriptionPlan = await getUserSubscriptionPlan();
        return NextResponse.json(subscriptionPlan);
    } catch (error) {
        console.error("Error fetching user subscription plan:", error);
        return NextResponse.json({ error: "Failed to fetch subscription plan" }, { status: 500 });
        
    }
}

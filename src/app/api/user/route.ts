import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const {getUser} = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            },
        });

    return NextResponse.json(dbUser);
}

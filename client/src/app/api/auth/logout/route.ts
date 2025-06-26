import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "kerjainaja_session",
        value: "",
        maxAge: -1,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
    });

    const response = NextResponse.json({
        data: null,
        msg: "success logout",
        status: true,
    });

    return response;
}

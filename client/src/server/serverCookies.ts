"use server";

import { cookies } from "next/headers";

export async function getCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}

export async function setCookie(
    name:string, 
    value: string,
    options?: {
        path?:string,
        maxAge?:number,
        sameSite?: "strict" | "lax" | "none"
    }
) 
{
    const cookieStore = await cookies();
    
    cookieStore.set({
        name,
        value,
        path: options?.path ?? "/",
        maxAge: options?.maxAge ?? 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
        sameSite: options?.sameSite ?? "none",
    });
}
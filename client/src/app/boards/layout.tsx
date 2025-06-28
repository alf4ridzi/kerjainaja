import { Metadata } from "next";
import { ReactNode } from "react";
import React from "react";
export const metadata: Metadata = {
    title: "Boards"
}

export default function BoardsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>
}
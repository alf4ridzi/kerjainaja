import { Metadata } from "next";
import LoginForm from "./LoginForm";
import React from "react";

export const metadata: Metadata = {
    title: "Login ke kerjain aja!"
}

export default function LoginPage() {
    return (
        <LoginForm/>
    )
}
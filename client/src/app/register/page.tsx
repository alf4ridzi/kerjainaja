import { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import React from "react";
export const metadata: Metadata = {
    title: "Register ke kerjain aja!"
}

export default function RegisterPage() {
    return (
        <RegisterForm/>
    )
}
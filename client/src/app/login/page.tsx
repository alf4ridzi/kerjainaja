import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
    title: "Login ke kerjain aja!"
}

export default function LoginPage() {
    return (
        <LoginForm/>
    )
}
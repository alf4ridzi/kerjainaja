"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUser,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
};

export default function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = type === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        type === "login" ? { email, password } : { name, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Authentication failed");
      }

      // Handle successful auth (e.g., redirect or close modal)
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop pengganti Dialog.Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>

        <Dialog.Panel>
          <Dialog.Title className="text-2xl font-bold text-blue-800 mb-6">
            {type === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
          </Dialog.Title>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mr-2 text-blue-600"
                  />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mr-2 text-blue-600"
                />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {isLoading
                ? "Memproses..."
                : type === "login"
                ? "Masuk"
                : "Daftar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {type === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    /* toggle ke register */
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Daftar disini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    /* toggle ke login */
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Masuk disini
                </button>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

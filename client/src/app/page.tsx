"use client";

import {
  faTasks,
  faUsers,
  faChartSimple,
  faSignInAlt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "@/components/ui/AuthModal";

export default function Home() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: "login" | "register";
  }>({ isOpen: false, type: "login" });

  const toggleAuthModal = (type: "login" | "register") => {
    setAuthModal({
      isOpen: true,
      type,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Head>
        <title>KerjainAja | Kolaborasi Tanpa Ribet</title>
        <meta
          name="description"
          content="Platform manajemen tugas modern untuk tim produktif"
        />
      </Head>

      {/* Modern Navigation */}
      <nav className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <FontAwesomeIcon icon={faTasks} className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-blue-800">KerjainAja</span>
          </div>
          <div className="flex items-center space-x-5">
            <button
              onClick={() => toggleAuthModal("login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
            >
              <span>Masuk</span>
            </button>

            <button
              onClick={() => toggleAuthModal("register")}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition shadow-lg"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 leading-tight">
            Kelola Proyek <span className="text-blue-600">Lebih Efisien</span>
          </h1>
          <p className="text-lg text-blue-800 mb-10 max-w-2xl mx-auto">
            Solusi modern untuk mengatur tugas tim Anda dengan antarmuka
            intuitif dan kolaborasi real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => toggleAuthModal("register")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center"
            >
              Mulai Gratis
            </button>
            <button
              onClick={() => toggleAuthModal("login")}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-7 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Sudah punya akun?
            </button>
          </div>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-xl shadow-2xl overflow-hidden border border-blue-100">
            <div className="absolute top-0 left-0 right-0 h-10 bg-blue-50 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <img
              src="/screenshot-app.png"
              alt="Tampilan Modern KerjainAja"
              className="w-full h-auto mt-10"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-blue-700">
              Desain minimalis dengan fungsionalitas lengkap untuk produktivitas
              tim
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <FontAwesomeIcon
                  icon={faTasks}
                  className="text-blue-600 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Manajemen Tugas
              </h3>
              <p className="text-blue-700">
                Sistem manajemen yang memudahkan pengaturan prioritas tugas
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-blue-600 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Kolaborasi Tim
              </h3>
              <p className="text-blue-700">
                Bekerja bersama secara real-time dengan anggota tim
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <FontAwesomeIcon
                  icon={faChartSimple}
                  className="text-blue-600 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Analisis Progres
              </h3>
              <p className="text-blue-700">
                Visualisasi kemajuan proyek dengan grafik interaktif
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Siap Meningkatkan Produktivitas Tim?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Bergabung untuk meningkatkan produktivitas menggunakan KerjainAja
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => toggleAuthModal("register")}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition shadow-lg"
              >
                Daftar Sekarang
              </button>
              <Link
                href="/contact"
                className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-500 transition"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-blue-900 text-white py-10">
        <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-400 text-sm">
          © {new Date().getFullYear()} KerjainAja. By Muhammad Alfaridzi.
        </div>
      </footer>
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        type={authModal.type}
        onTypeChange={(type) => setAuthModal({ ...authModal, type })}
      />
    </div>
  );
}

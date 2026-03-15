import { Suspense } from "react";
import { LoginForm } from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-brand-navy flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-green/20 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-md text-center flex flex-col items-center">
          {/* <Link href="/" className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
          </Link> */}
          <h2 className="text-3xl font-bold text-white mb-6">Welcome back to oneVone Play</h2>
          <p className="text-brand-greenLight/80 text-lg">
            Sign in to manage your branded tournament campaigns and connect with the gaming community.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative z-10">
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
            </Link>
          </div>
          
          <Suspense fallback={<div className="w-full text-center py-10 text-brand-green">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

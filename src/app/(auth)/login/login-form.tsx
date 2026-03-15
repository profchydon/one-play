"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight">Sign In</h1>
        <p className="text-gray-500 mt-2">Enter your details to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium text-center border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-semibold text-brand-navy">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-semibold text-brand-navy">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-green py-3 text-white font-bold text-lg hover:bg-brand-greenDark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-brand-green/20 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      <p className="text-center text-sm font-medium text-gray-600">
        Need an account? Contact an administrator.
      </p>
    </div>
  );
}

"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Cpu, Zap, Lock } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-stretch">
      {/* Left: visual + features - 45% width */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden p-12 login-left flex-col justify-between dark:bg-slate-900 bg-gradient-to-br from-slate-50 to-slate-100">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full ring-ring animate-ring" />
              <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white font-bold text-lg">
                VT
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white dark:text-white text-slate-900">Vision Track</h1>
              <p className="text-base text-slate-300 dark:text-slate-300 text-slate-600 mt-1">Insight. Track. Solve.</p>
            </div>
          </div>

          <div className="space-y-4">
            <FeatureCard title="AI Detection" icon={<Cpu className="text-blue-400 dark:text-blue-400 text-blue-600" />} />
            <FeatureCard title="Live Tracking" icon={<Zap className="text-cyan-400 dark:text-cyan-400 text-cyan-600" />} />
            <FeatureCard title="Secure & Compliant" icon={<Shield className="text-indigo-300 dark:text-indigo-300 text-indigo-600" />} />
          </div>
        </div>

        <div className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
          <p className="font-semibold mb-2">⚖️ Important</p>
          <p>AI-assisted analysis for decision support only. Always contact local authorities for missing person cases.</p>
        </div>
      </div>

      {/* Right: form card - 55% width */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-slate-950">
        <div className="glass-card relative rounded-3xl p-10 shadow-2xl dark:shadow-2xl shadow-slate-200/50 w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2">
                <div className="p-2 rounded-full bg-white/6 dark:bg-white/6 bg-slate-900/10">
                  <Shield className="text-white dark:text-white text-slate-800 w-4 h-4" />
                </div>
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200 dark:text-slate-200 text-slate-700 bg-white/6 dark:bg-white/6 bg-slate-900/5 border border-white/8 dark:border-white/8 border-slate-200">
                  <Lock className="mr-1" size={12} /> SECURE ACCESS
                </span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white dark:text-white text-slate-900 mb-2">{flow === "signIn" ? "Welcome back" : "Create your premium account"}</h3>
            <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">{flow === "signIn" ? "Sign in to continue to the case management dashboard." : "Join Vision Track Premium — enhanced analysis, priority support, and team collaboration."}</p>
            {flow === 'signUp' && (
              <div className="mt-3 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold text-xs">Premium Trial</div>
            )}
          </div>

          <form
            className="relative flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                  toastTitle = "Invalid password. Please try again.";
                } else {
                  toastTitle =
                    flow === "signIn"
                      ? "Could not sign in, did you mean to sign up?"
                      : "Could not sign up, did you mean to sign in?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
              });
            }}
          >
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">Email address</span>
              <input
                className="w-full rounded-lg bg-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.04)] bg-white border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200 px-4 py-3 text-slate-100 dark:text-slate-100 text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition"
                type="email"
                name="email"
                placeholder="name@company.com"
                required
              />
            </label>

            {flow === 'signUp' && (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">Full name</span>
                <input
                  className="w-full rounded-lg bg-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.04)] bg-white border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200 px-4 py-3 text-slate-100 dark:text-slate-100 text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition"
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  required
                />
              </label>
            )}

            <label className="space-y-2 relative">
              <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">Password</span>
              <input
                className="w-full rounded-lg bg-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.04)] bg-white border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200 px-4 py-3 text-slate-100 dark:text-slate-100 text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={flow === 'signIn' ? 'Enter your password' : 'Create a strong password'}
                required
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-9 text-xs text-slate-300 dark:text-slate-300 text-slate-600">{showPassword ? 'Hide' : 'Show'}</button>
            </label>

            {flow === 'signUp' && (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">Confirm password</span>
                  <input
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.04)] bg-white border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200 px-4 py-3 text-slate-100 dark:text-slate-100 text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition"
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    required
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">Choose a plan</span>
                  <div className="flex gap-3">
                    <label className="flex-1 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] dark:bg-[rgba(255,255,255,0.02)] bg-slate-100 border border-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.04)] border-slate-300 text-sm text-slate-900 dark:text-slate-200">
                      <input type="radio" name="plan" value="personal" defaultChecked className="mr-2" /> Personal — Free
                    </label>
                    <label className="flex-1 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm">
                      <input type="radio" name="plan" value="premium" className="mr-2" /> Premium — 14d trial
                    </label>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm mt-2">
                  <input type="checkbox" name="agree" required className="mt-1" />
                  <span className="text-slate-300 dark:text-slate-300 text-slate-700">I agree to the Terms of Service and Privacy Policy</span>
                </label>
              </>
            )}

            <div className="flex items-center justify-between gap-4">
              <button className={`px-6 py-3 rounded-lg text-white font-semibold transition flex items-center gap-2 ${flow==='signUp' ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`} type="submit" disabled={submitting}>
                {submitting ? (flow === "signIn" ? "Signing in..." : "Creating...") : (flow === "signIn" ? "Sign in" : "Start free trial")}
              </button>
              <button type="button" className="px-4 py-3 rounded-lg border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-300 text-slate-200 dark:text-slate-200 text-slate-700" onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}>{flow === "signIn" ? "Sign up instead" : "Sign in instead"}</button>
            </div>
          </form>

          <div className="my-6 flex items-center justify-center">
            <hr className="my-4 grow border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200" />
            <span className="mx-4 text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-slate-300 text-slate-600">OR CONTINUE AS GUEST</span>
            <hr className="my-4 grow border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-200" />
          </div>

          <button
            className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.06)] border-slate-300 bg-[rgba(255,255,255,0.02)] dark:bg-[rgba(255,255,255,0.02)] bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-200 dark:text-slate-200 text-slate-700 transition-colors hover:bg-[rgba(255,255,255,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] hover:bg-slate-200 disabled:opacity-60"
            onClick={() => void signIn("anonymous")}
            disabled={submitting}
          >
            Continue as Guest
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/2 dark:bg-white/2 bg-slate-200 border-l-4 border-[#3B82F6]/60 dark:border-[#3B82F6]/60 border-[#3B82F6]">
      <div className="p-2 bg-white/6 dark:bg-white/6 bg-slate-300 rounded">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white dark:text-white text-slate-900">{title}</div>
        <div className="text-xs text-slate-300 dark:text-slate-300 text-slate-600">Fast, accurate, and private</div>
      </div>
    </div>
  );
}

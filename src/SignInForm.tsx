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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left: hero section */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-white dark:bg-slate-950">
        <div>
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">AI-Powered Missing Person Detection</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">Advanced computer vision and geospatial analysis to assist in locating missing individuals</p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded mb-12">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Ethical AI Notice:</strong> This system provides decision-support only. All results require human verification and should not be used as sole evidence.
            </p>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">Built for safer, faster, and more accountable search workflows.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Secure & Compliant</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Built with privacy and ethics in mind</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Real-time Analysis</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fast, accurate, and reliable results</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Advanced AI</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Computer vision and pattern recognition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form card */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                SECURE ACCESS
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {flow === "signIn" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {flow === "signIn" 
                ? "Sign in to continue to the case management dashboard."
                : "Join Missing Person AI to start tracking and analysis."
              }
            </p>
          </div>

          <form
            className="space-y-4"
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                type="email"
                name="email"
                placeholder="name@company.com"
                required
              />
            </div>

            {flow === "signUp" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full name
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={flow === "signIn" ? "Enter your password" : "Create a strong password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {flow === "signUp" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirm password
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Choose a plan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition">
                      <input type="radio" name="plan" value="personal" defaultChecked className="mr-2" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Personal — Free</span>
                    </label>
                    <label className="p-3 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
                      <input type="radio" name="plan" value="premium" className="mr-2" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Premium — 14d trial</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-start gap-2">
                  <input type="checkbox" name="agree" required className="mt-1" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? (flow === "signIn" ? "Signing in..." : "Creating...") : (flow === "signIn" ? "Sign in" : "Start free trial")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1 border-slate-200 dark:border-slate-700" />
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-500">OR</span>
            <hr className="flex-1 border-slate-200 dark:border-slate-700" />
          </div>

          <button
            onClick={() => void signIn("anonymous")}
            disabled={submitting}
            className="w-full py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm disabled:opacity-60"
          >
            Continue anonymously
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {flow === "signIn" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setFlow("signUp")}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Sign up instead
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setFlow("signIn")}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-slate-700">
      <div className="p-2 bg-white dark:bg-slate-800 rounded">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        <div className="text-xs text-slate-600 dark:text-slate-400">Fast, accurate, and private</div>
      </div>
    </div>
  );
}

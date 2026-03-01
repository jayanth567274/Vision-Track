"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-container border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-100 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-100 blur-2xl" />

      <div className="relative mb-6 text-center">
        <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Secure Access
        </p>
        <h3 className="mt-4 text-2xl font-bold text-slate-900">
          {flow === "signIn" ? "Welcome back" : "Create your account"}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {flow === "signIn"
            ? "Sign in to continue to the case management dashboard."
            : "Set up your account to begin managing investigations."}
        </p>
      </div>

      <form
        className="relative flex flex-col gap-form-field"
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
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            className="auth-input-field"
            type="email"
            name="email"
            placeholder="name@company.com"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="auth-input-field"
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />
        </label>
        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting
            ? flow === "signIn"
              ? "Signing in..."
              : "Creating account..."
            : flow === "signIn"
              ? "Sign in"
              : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>

      <div className="my-5 flex items-center justify-center">
        <hr className="my-4 grow border-slate-200" />
        <span className="mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          or continue as guest
        </span>
        <hr className="my-4 grow border-slate-200" />
      </div>

      <button
        className="w-full rounded-container border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => void signIn("anonymous")}
        disabled={submitting}
      >
        Continue anonymously
      </button>
    </div>
  );
}

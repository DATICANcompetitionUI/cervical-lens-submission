"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@cervical-lens/ui";
import { signUp, storeToken } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "pathologist",
    institution: "",
    license_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signUp({
        email: form.email,
        password: form.password,
        name: form.full_name,
        role: form.role,
        institution: form.institution || undefined,
        licenseNumber: form.license_number || undefined,
      });
      storeToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container text-on-primary-container mb-4 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">CervicalLens</h1>
          <p className="text-sm text-on-surface-variant mt-2 font-sans">
            Create your diagnostic portal account
          </p>
        </div>

        <Card variant="default" className="hover:shadow-md transition-shadow duration-300">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-secondary/10 border border-warm-accent-orange/30 text-secondary text-sm font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="full_name"
              name="full_name"
              type="text"
              label="Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder="Dr. Jane Doe"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@hospital.org"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-on-surface mb-1 font-sans"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-sand bg-canvas-white text-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              >
                <option value="pathologist">Pathologist</option>
                <option value="technician">Clinic Technician</option>
              </select>
            </div>

            <Input
              id="institution"
              name="institution"
              type="text"
              label="Institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="Hospital or university name"
            />

            <Input
              id="license_number"
              name="license_number"
              type="text"
              label="License Number"
              value={form.license_number}
              onChange={handleChange}
              placeholder="Medical license number"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant font-sans">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

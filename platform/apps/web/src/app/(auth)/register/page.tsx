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
            <svg className="w-6 h-6 text-on-primary-container" viewBox="0 0 100 100" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M50 5C50 5 85 15.5 85 47.5C85 71.5 50 95 50 95C50 95 15 71.5 15 47.5C15 15.5 50 5 50 5ZM50 25C32.5 25 22.5 45 22.5 45C22.5 45 32.5 65 50 65C67.5 65 77.5 45 77.5 45C77.5 45 67.5 25 50 25ZM50 32.5C59.7 32.5 67.5 45 67.5 45C67.5 45 59.7 57.5 50 57.5C40.3 57.5 32.5 45 32.5 45C32.5 45 40.3 32.5 50 32.5ZM50 35C44.5 35 40 39.5 40 45C40 50.5 44.5 55 50 55C55.5 55 60 50.5 60 45C60 39.5 55.5 35 50 35ZM50 41C52.2 41 54 42.8 54 45C54 47.2 52.2 49 50 49C47.8 49 46 47.2 46 45C46 42.8 47.8 41 50 41Z" />
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

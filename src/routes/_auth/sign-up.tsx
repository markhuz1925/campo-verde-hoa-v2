// src/routes/_auth/sign-up.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { z } from "zod"; // For validation (if you want)

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Route = createFileRoute("/_auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      signUpSchema.parse({ email, password });

      const { user, error: authError } = await signUp(email, password);

      if (authError) {
        setError(authError.message);
      } else if (user) {
        // Successful sign-up, navigate to app. Supabase might require email verification.
        // If email verification is on, user might not be immediately authenticated.
        alert(
          "Sign-up successful! Please check your email to verify your account."
        );
        navigate({ to: "/sign-in" }); // Redirect to sign-in after signup for verification
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your details below to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="underline">
            Sign in
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

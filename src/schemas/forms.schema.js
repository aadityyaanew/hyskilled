import { z } from "zod";

/**
 * Shared validation schemas. Used by react-hook-form on the client and
 * (later) by backend / admin API handlers so rules never drift.
 */

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

export const passwordField = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const phoneField = z
  .string()
  .trim()
  .regex(phoneRegex, "Enter a valid 10-digit mobile number");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((v) => v === true, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({ email: emailField });

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: emailField,
  phone: phoneField,
  paymentMethod: z.enum(["upi", "card", "netbanking", "wallet"], {
    message: "Choose a payment method",
  }),
  agree: z.boolean().refine((v) => v === true, "Please accept the terms to continue"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: emailField,
  phone: phoneField,
  topic: z.string().min(1, "Choose a topic"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)"),
});

export const newsletterSchema = z.object({ email: emailField });

export const seatBookingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneField,
  email: emailField,
  course: z.string().min(1, "Please select a course"),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().min(1, "Please select your state"),
});

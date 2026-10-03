"use client";

import { Controller } from "react-hook-form";
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { paymentMethods } from "@/config/payments";
import { cn } from "@/lib/utils";

const icons = { Smartphone, CreditCard, Landmark, Wallet };

export function PaymentMethodSelector({ control, error }) {
  return (
    <Controller
      control={control}
      name="paymentMethod"
      render={({ field }) => (
        <div>
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid gap-3 sm:grid-cols-2"
            aria-label="Payment method"
            aria-invalid={Boolean(error)}
          >
            {paymentMethods.map((m) => {
              const Icon = icons[m.icon] ?? CreditCard;
              const selected = field.value === m.id;
              return (
                <label
                  key={m.id}
                  htmlFor={`pm-${m.id}`}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition-all hover:border-brand-300",
                    selected ? "border-primary bg-brand-50/60 shadow-sm ring-2 ring-primary/20" : "bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
                      selected ? "bg-primary text-white" : "bg-muted text-ink-soft"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink">
                      {m.label}
                      {m.popular && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{m.description}</span>
                  </span>
                  <RadioGroupItem value={m.id} id={`pm-${m.id}`} />
                </label>
              );
            })}
          </RadioGroup>
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    />
  );
}

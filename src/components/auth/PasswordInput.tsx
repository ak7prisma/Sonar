"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  toggleAriaLabel?: {
    show?: string;
    hide?: string;
  };
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleAriaLabel, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const showLabel = toggleAriaLabel?.show ?? "Tampilkan kata sandi";
    const hideLabel = toggleAriaLabel?.hide ?? "Sembunyikan kata sandi";

    return (
      <div className="relative flex items-center">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-11", className)}
          disabled={disabled}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          aria-label={showPassword ? hideLabel : showLabel}
          aria-pressed={showPassword}
          className="absolute right-1 text-muted-foreground hover:text-foreground"
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

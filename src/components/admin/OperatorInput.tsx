import type { InputHTMLAttributes } from "react";

export function OperatorInput({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <input {...props} className="input mt-1 w-full" />
    </label>
  );
}

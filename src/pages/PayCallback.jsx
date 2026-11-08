import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Btn } from "../components/game/ui";

export default function PayCallback() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-ink px-4 text-center">
      <div className="kente h-2 w-32" />
      <CheckCircle2 className="h-12 w-12 text-kgreen" />
      <h1 className="font-display text-3xl uppercase text-zinc-100">Payment Processed</h1>
      <p className="max-w-xs text-xs text-zinc-400">
        Your offline account has been credited with the selected products.
      </p>
      <Link to="/">
        <Btn className="mt-4 px-6 py-3">Return to Empire</Btn>
      </Link>
    </div>
  );
}

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function LogPage() {
  const router = useRouter();
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ method, notes }),
    });
    setLoading(false);
    setMethod("");
    setNotes("");
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Log Consumption Session</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Method</label>
          <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Joint" />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </div>
        <Button onClick={submit} disabled={loading || !method} className="w-full">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

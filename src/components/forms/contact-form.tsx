"use client";

import { useState } from "react";
import { useStage } from "@/components/coldstart/stage";
import { FormError } from "./form-error";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const { setDraft, setSent } = useStage();

  // Mirror the draft into the homepage phone's compose screen (no-op on other pages).
  const update = (field: "name" | "email" | "message", value: string) => {
    const next = { name, email, message, [field]: value };
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "message") setMessage(value);
    setDraft(next);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !message.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please add valid name, email and message.");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: unknown }
          | null;
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to send message. Please try again.";
        setError(message);
        return;
      }

      setSuccess("Message sent. I'll reply to your email soon.");
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setName("");
      setEmail("");
      setMessage("");
      setDraft({ name: "", email: "", message: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField label="Name">
        <Input
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Your name"
        />
      </FormField>
      <FormField label="Email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="your@email.com"
        />
      </FormField>
      <FormField label="Message">
        <Textarea
          rows={5}
          name="message"
          required
          value={message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell me about the role/project"
        />
      </FormField>
      <FormError message={error} />
      <p className="text-sm text-(--accent)" role="status">
        {success}
      </p>
      <SubmitButton pending={pending} />
    </form>
  );
}

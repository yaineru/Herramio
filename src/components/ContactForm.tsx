"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

// Placeholder pointing at the real domain — verify this inbox is actually
// monitored before relying on it for real user contact (see PRODUCT-ROADMAP.md).
const CONTACT_EMAIL = "hola@herramio.com";

/**
 * No backend: builds a mailto: link from the form and lets the visitor's
 * own email client send it. Avoids storing contact submissions anywhere.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contacto desde el sitio — ${name || "Visitante"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="contact-name">Nombre</Label>
        <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="contact-email">Correo electrónico</Label>
        <Input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="contact-message">Mensaje</Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit">Enviar mensaje</Button>
      <p className="text-xs text-slate-400">
        Se abrirá tu aplicación de correo predeterminada para enviar el mensaje a {CONTACT_EMAIL}.
      </p>
    </form>
  );
}

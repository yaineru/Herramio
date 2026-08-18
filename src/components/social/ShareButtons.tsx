"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { AnalyticsEvents } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

interface ShareButtonsProps {
  tool: string;
  url: string;
  title: string;
}

export function ShareButtons({ tool, url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      AnalyticsEvents.copyLink(tool);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore, the visible URL is enough
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {channels.map((channel) => (
        <a
          key={channel.key}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => AnalyticsEvents.shareClicked(tool, channel.key)}
          className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          {channel.label}
        </a>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copiado" : "Copiar enlace"}
      </Button>
    </div>
  );
}

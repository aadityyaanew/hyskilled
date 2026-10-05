"use client";

import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsappIcon } from "@/components/shared/brand-icons";

export function MobileContactBar() {
  // Strip non-numeric chars for the tel: link
  const phoneVal = siteConfig.contact.phone.replace(/[^0-9+]/g, '');
  // WhatsApp link (wa.me doesn't want the + sign)
  const whatsappUrl = `https://wa.me/${phoneVal.replace('+', '')}`;
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] block bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:hidden rounded-t-2xl pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex gap-3">
        <a 
          href={`tel:${phoneVal}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-white py-3 text-[15px] font-bold text-foreground transition-colors hover:bg-muted active:bg-muted"
        >
          <Phone className="size-[18px]" />
          Call Us
        </a>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E12A36] py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#C9222E] active:bg-[#B31D28]"
        >
          <WhatsappIcon className="size-5 text-[#25D366]" />
          Live Chat
        </a>
      </div>
    </div>
  );
}

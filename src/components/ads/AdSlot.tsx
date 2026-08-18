import { ADS_ENABLED } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type AdSlotPlacement = "header" | "below-generator" | "in-content" | "footer";

interface AdSlotProps {
  placement: AdSlotPlacement;
  className?: string;
}

const PLACEMENT_SIZES: Record<AdSlotPlacement, string> = {
  header: "min-h-[90px]",
  "below-generator": "min-h-[100px]",
  "in-content": "min-h-[250px]",
  footer: "min-h-[90px]",
};

/**
 * Reserves ad space with a fixed min-height (even when disabled) to avoid
 * layout shift once real AdSense units are wired in. Never renders on
 * pages that opt out (e.g. tool forms mid-interaction, test/staging).
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  if (!ADS_ENABLED) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-300",
          PLACEMENT_SIZES[placement],
          className,
        )}
        data-ad-placement={placement}
        aria-hidden="true"
      >
        Espacio publicitario
      </div>
    );
  }

  // When ADS_ENABLED=true and NEXT_PUBLIC_ADSENSE_CLIENT is configured, this
  // renders the real AdSense unit. See MONETIZATION.md for setup steps.
  return (
    <div className={cn("w-full", PLACEMENT_SIZES[placement], className)} data-ad-placement={placement}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.toUpperCase().replace(/-/g, "_")}`]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

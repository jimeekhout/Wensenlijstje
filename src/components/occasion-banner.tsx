import { OccasionIcon } from "@/components/occasion-icon";
import { occasionLabel } from "@/lib/occasions";

export function OccasionBanner({
  occasion,
  custom,
  title,
  detail,
}: {
  occasion: string;
  custom?: string | null;
  title?: string;
  detail?: string | null;
}) {
  const label = occasionLabel(occasion, custom);
  return (
    <div className={`occasion-banner occasion-${occasion}`} data-testid="occasion-banner">
      <div className="occasion-icon">
        <OccasionIcon name={occasion} />
      </div>
      <div className="min-w-0">
        <p className="occasion-kicker">{label}</p>
        {title ? <h1 className="mt-1 text-[1.7rem] break-words">{title}</h1> : null}
        {detail ? <p className="mt-1 text-sm opacity-80">{detail}</p> : null}
      </div>
    </div>
  );
}

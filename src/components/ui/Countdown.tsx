import { useCountdown } from "@/hooks/useCountdown";

export function Countdown({ hours }: { hours: number }) {
  const { h, m, s } = useCountdown(hours);
  return (
    <div className="flex items-center gap-1">
      {[
        { v: h, l: "h" },
        { v: m, l: "m" },
        { v: s, l: "s" },
      ].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}
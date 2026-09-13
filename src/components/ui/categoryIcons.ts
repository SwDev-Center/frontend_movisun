import type { LucideIcon } from "lucide-react";
import { Watch, Headphones, Bluetooth, Battery, Zap, Cable, Speaker, Radio } from "lucide-react";
import type { IconKey } from "@/lib/types";

export const CATEGORY_ICONS: Record<IconKey, LucideIcon> = {
  watch: Watch,
  headphones: Headphones,
  bluetooth: Bluetooth,
  battery: Battery,
  zap: Zap,
  cable: Cable,
  speaker: Speaker,
  radio: Radio,
};
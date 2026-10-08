import {
  Zap,
  BarChart3,
  BrainCircuit,
  PenTool,
  Code2,
  Smartphone,
  Cloud,
  ShieldCheck,
  Layers,
  Megaphone,
} from "lucide-react";

const icons = {
  Zap,
  BarChart3,
  BrainCircuit,
  PenTool,
  Code2,
  Smartphone,
  Cloud,
  ShieldCheck,
  Megaphone,
  Layers,
};

/** Resolves a category's icon name (stored as data) to a Lucide component. */
export function CategoryIcon({ name, ...props }) {
  const Icon = icons[name] ?? Layers;
  return <Icon {...props} />;
}

import {
  Activity,
  ArrowRight,
  BedDouble,
  Bell,
  BellRing,
  Bot,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  CheckCheck,
  CheckCircle2,
  Code2,
  CreditCard,
  Crown,
  Eye,
  FileCheck2,
  Gauge,
  Handshake,
  Hash,
  HelpCircle,
  Home,
  Hotel,
  Laptop,
  LayoutGrid,
  LineChart,
  Lock,
  Megaphone,
  Palmtree,
  Plus,
  Receipt,
  RefreshCcw,
  Rocket,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Target,
  UserCheck,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wand2,
  Wifi,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

/** Curated registry — only the icons referenced by typed data.
 *  Keeps the bundle tree-shakeable instead of importing all of lucide. */
const REGISTRY: Record<string, React.ComponentType<LucideProps>> = {
  Activity, ArrowRight, BedDouble, Bell, BellRing, Bot, Building2, Calendar,
  CalendarCheck, CalendarDays, CalendarRange, CalendarX2, CheckCheck, CheckCircle2,
  Code2, CreditCard, Crown, Eye, FileCheck2, Gauge, Handshake, Hash, Home, Hotel,
  Laptop, LayoutGrid, LineChart, Lock, Megaphone, Palmtree, Plus, Receipt,
  RefreshCcw, Rocket, Search, Settings, Share2, ShieldCheck, SlidersHorizontal,
  Star, Store, Target, UserCheck, Users, UtensilsCrossed, VolumeX, Wand2, Wifi,
};

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const Cmp = REGISTRY[name] ?? HelpCircle;
  return <Cmp {...props} />;
}

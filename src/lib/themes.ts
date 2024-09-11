export type Theme = {
  name: string;
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  messageUser: string;
  messageAssistant: string;
};

export const themes: Record<string, Theme> = {
  shadowdark: {
    name: "Shadowdark",
    background: "bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900",
    text: "text-gray-100",
    primary: "text-purple-300",
    secondary: "text-blue-300",
    accent: "text-red-400",
    messageUser: "bg-blue-900",
    messageAssistant: "bg-purple-900"
  },
  dnd5e: {
    name: "D&D 5e",
    background: "bg-gradient-to-b from-red-900 via-orange-800 to-red-900",
    text: "text-amber-50",
    primary: "text-amber-300",
    secondary: "text-red-300",
    accent: "text-yellow-400",
    messageUser: "bg-red-800",
    messageAssistant: "bg-orange-800"
  },
  ezd6: {
    name: "EZD6",
    background: "bg-gradient-to-b from-emerald-900 via-teal-800 to-emerald-900",
    text: "text-teal-50",
    primary: "text-emerald-300",
    secondary: "text-teal-300",
    accent: "text-yellow-400",
    messageUser: "bg-teal-800",
    messageAssistant: "bg-emerald-800"
  }
};

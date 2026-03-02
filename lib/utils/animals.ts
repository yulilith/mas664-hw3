export const ANIMAL_COLORS: Record<string, string> = {
  fox: "#f97316",
  owl: "#a78bfa",
  bear: "#d97706",
  dolphin: "#06b6d4",
  wolf: "#6b7280",
  eagle: "#eab308",
};

export const ANIMAL_EMOJIS: Record<string, string> = {
  fox: "\u{1F98A}",
  owl: "\u{1F989}",
  bear: "\u{1F43B}",
  dolphin: "\u{1F42C}",
  wolf: "\u{1F43A}",
  eagle: "\u{1F985}",
};

export function getAnimalColor(animal: string | null): string {
  return ANIMAL_COLORS[animal || ""] || "#6b7280";
}

export function getAnimalEmoji(animal: string | null): string {
  return ANIMAL_EMOJIS[animal || ""] || "🐾";
}

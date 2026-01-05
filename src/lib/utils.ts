import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractRevision(filename: string): string | null {
  const match = filename.match(/Rev\.?(\d+|\w+)/i);
  return match ? match[1] : null;
}

export function categorizeDocument(filename: string): { category: string; subcategory: string } {
  const categories: Record<string, { pattern: RegExp; subcategories: Record<string, RegExp> }> = {
    Architecture: {
      pattern: /^A-/,
      subcategories: {
        "Floor Plans": /FLOOR[-\s]?PLAN|LEVEL/i,
        "Elevations": /ELEVATION/i,
        "Sections": /SECTION/i,
        "Details": /DETAIL/i,
        "Ceiling Plans": /CEILING/i,
        "Roof": /ROOF/i,
        "Stairs": /STAIR/i,
        "Millwork": /MILLWORK/i,
        "Washrooms": /WASHROOM|WC/i,
        "Museum": /MUSEUM/i,
        "Theatre": /THEATRE|THEATER/i,
      },
    },
    Civil: {
      pattern: /^C-/,
      subcategories: {
        "Site Plans": /SITE|EXISTING/i,
        "Grading": /LEVELING|GRADING/i,
        "Details": /DETAIL/i,
      },
    },
    Electrical: {
      pattern: /^E[A-Z]-/,
      subcategories: {
        "Lighting": /LIGHTING/i,
        "Services": /SERVICE/i,
        "Fire Alarm": /FIRE[-\s]?ALARM/i,
        "Distribution": /DISTRIBUTION/i,
        "Scenography": /SCENOGRAPHY/i,
      },
    },
    Mechanical: {
      pattern: /^M[A-Z]-/,
      subcategories: {
        "Plumbing": /PLUMBING/i,
        "HVAC": /VENTILATION|HVAC/i,
        "Fire Protection": /FIRE[-\s]?PROTECTION/i,
        "Piping": /PIPING/i,
        "Controls": /CONTROL/i,
      },
    },
    Structure: {
      pattern: /^S\d/,
      subcategories: {
        "Foundation": /FOUNDATION/i,
        "Floor Plans": /PLAN/i,
        "Reinforcement": /REINFORCEMENT/i,
        "Details": /DETAIL/i,
      },
    },
    Landscape: {
      pattern: /^L\d/,
      subcategories: {
        "Planting": /PLANT/i,
        "Materials": /MATERIAL/i,
        "Sections": /SECTION/i,
        "Details": /DETAIL/i,
      },
    },
  };

  for (const [cat, config] of Object.entries(categories)) {
    if (config.pattern.test(filename)) {
      for (const [subcat, subPattern] of Object.entries(config.subcategories)) {
        if (subPattern.test(filename)) {
          return { category: cat, subcategory: subcat };
        }
      }
      return { category: cat, subcategory: "General" };
    }
  }

  return { category: "Other", subcategory: "General" };
}

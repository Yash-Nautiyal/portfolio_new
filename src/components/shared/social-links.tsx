import { config } from "@/data/config";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {Object.entries(config.social).map(([key, value]) => (
        <a
          key={key}
          href={value.link}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-(--ink-2) transition-colors hover:text-(--ink)"
        >
          {key === "gmail" ? "Email" : key.charAt(0).toUpperCase() + key.slice(1)}
        </a>
      ))}
    </div>
  );
}

import type { SkillPillData } from "@/data/skill-showcase";

/** Android-style app shortcut popup: sub-skills as rows, or a one-line description. */
export function ShortcutPopup({ pill, id, align }: { pill: SkillPillData; id?: string; align: "left" | "right" }) {
  return (
    <div id={id} role="group" aria-label={`${pill.name} details`} className={`shortcut-popup ${align}`}>
      {pill.subChips?.length ? (
        <ul>
          {pill.subChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      ) : (
        <p>{pill.tooltip}</p>
      )}
    </div>
  );
}

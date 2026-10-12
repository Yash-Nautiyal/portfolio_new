"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { SkillGroupData, SkillPillData } from "@/data/skill-showcase";
import { useStage } from "@/components/coldstart/stage";
import { ShortcutPopup } from "@/components/coldstart/shortcut-popup";

function AppIcon({
  pill,
  open,
  onOpen,
  onClose,
}: {
  pill: SkillPillData;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const popupId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [align, setAlign] = useState<"left" | "right">("left");
  const hasDetails = Boolean(pill.subChips?.length || pill.tooltip);

  const openHere = () => {
    // Open the popup toward whichever side of the row has room.
    const row = wrap.current?.closest(".app-grid")?.getBoundingClientRect();
    const me = wrap.current?.getBoundingClientRect();
    if (row && me) setAlign(me.left - row.left > row.width / 2 ? "right" : "left");
    onOpen();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, onClose]);

  return (
    <div ref={wrap} className={`app ${pill.dim ? "dim" : ""} ${open ? "open" : ""}`}>
      <button
        ref={button}
        type="button"
        className="app-button"
        aria-expanded={hasDetails ? open : undefined}
        aria-controls={hasDetails && open ? popupId : undefined}
        onClick={() => (open ? onClose() : openHere())}
        onContextMenu={(e) => {
          // Long-press on touch and right-click both open shortcuts, as on Android.
          e.preventDefault();
          openHere();
        }}
      >
        <span className="app-tile">
          <Image
            src={pill.icon}
            alt=""
            width={32}
            height={32}
            className={pill.iconInvert ? "app-invert" : undefined}
          />
        </span>
        <span className="app-name">{pill.name}</span>
      </button>
      {open && hasDetails ? <ShortcutPopup pill={pill} id={popupId} align={align} /> : null}
    </div>
  );
}

/** Desktop: skills as a typographic index. Hover lights the icon on the phone; click pins the details. */
function SkillIndex({ groups }: { groups: SkillGroupData[] }) {
  const { skill, setSkill, setPeek } = useStage();

  useEffect(() => {
    if (!skill) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSkill(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [skill, setSkill]);

  return (
    <div className="skill-index" onPointerLeave={() => setPeek(null)}>
      {groups.map((group) => {
        const pinned = group.pills.find((p) => p.id === skill);
        return (
          <div key={group.id} className="skill-row">
            <h3 className="skill-row-label">{group.label}</h3>
            <div>
              <ul className={`skill-words ${group.pills.some((p) => p.dim) ? "dim" : ""}`}>
                {group.pills.map((pill) => (
                  <li key={pill.id}>
                    <button
                      type="button"
                      className="skill-word"
                      aria-expanded={skill === pill.id}
                      aria-controls={`skill-detail-${group.id}`}
                      onPointerEnter={() => setPeek(pill.id)}
                      onFocus={() => setPeek(pill.id)}
                      onBlur={() => setPeek(null)}
                      onClick={() => setSkill(skill === pill.id ? null : pill.id)}
                    >
                      {pill.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div id={`skill-detail-${group.id}`} className="skill-detail" aria-live="polite">
                {pinned ? (
                  <p>
                    <span className="font-medium text-(--ink)">{pinned.name}.</span>{" "}
                    {pinned.subChips?.length ? pinned.subChips.join(", ") + "." : pinned.tooltip}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SkillsPills({ groups }: { groups: SkillGroupData[] }) {
  const { skill, setSkill } = useStage();

  return (
    <>
      <div className="hidden md:block">
        <SkillIndex groups={groups} />
      </div>
      <div className="home-panel">
        {groups.map((group) => (
          <div key={group.id} className="app-group">
            <h3 className="app-group-label">{group.label}</h3>
            <div className="app-grid">
              {group.pills.map((pill) => (
                <AppIcon
                  key={pill.id}
                  pill={pill}
                  open={skill === pill.id}
                  onOpen={() => setSkill(pill.id)}
                  onClose={() => setSkill(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

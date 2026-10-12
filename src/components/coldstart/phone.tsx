"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { ArrowUp, BatteryFull, Mail, MapPin, MessageCircle, Phone as PhoneIcon, Signal, Video, Wifi } from "lucide-react";
import { EXPERIENCE, SKILLS } from "@/data/experience";
import projects from "@/data/projects";
import { skillGroups } from "@/data/skill-showcase";
import { config } from "@/data/config";
import { ShortcutPopup } from "./shortcut-popup";
import { DustWallpaper } from "./dust-wallpaper";
import { phoneShot } from "@/lib/phone-shot";




function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
}
const readClock = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const readDate = () =>
  new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

function useClock() {
  const time = useSyncExternalStore(subscribeClock, readClock, () => "");
  const date = useSyncExternalStore(subscribeClock, readDate, () => "");
  return { time, date };
}

function StatusBar({ time }: { time: string }) {
  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="flex items-center gap-1">
        <Signal size={13} />
        <Wifi size={13} />
        <BatteryFull size={15} />
      </span>
    </div>
  );
}

// Generic, everyday notifications: the lock screen should feel like a phone, not a CV.
const LOCK_NOTES = [
  { app: "Messages", text: "2 new messages", when: "now" },
  { app: "Calendar", text: "Coffee break in 15 min", when: "5m" },
  { app: "System", text: "Update installed. All good.", when: "1h" },
];

function LockScreen({ time, date }: { time: string; date: string }) {
  return (
    <div className="lock-screen flex h-full flex-col px-4 pt-12 pb-6">
      <p className="text-center text-sm text-(--screen-ink-2)">{date}</p>
      <p className="lock-clock mt-1 text-center font-(family-name:--font-display) text-[4.5rem] leading-none font-bold tracking-tight">
        {time}
      </p>
      <div className="mt-auto space-y-2">
        {LOCK_NOTES.map((n) => (
          <div key={n.app} className="rounded-3xl bg-(--screen-card) p-3.5">
            <p className="flex justify-between text-[11px] text-(--screen-ink-2)">
              <span>{n.app}</span>
              <span>{n.when}</span>
            </p>
            <p className="mt-0.5 text-sm font-medium">{n.text}</p>
          </div>
        ))}
        <p className="pt-3 text-center text-xs text-(--screen-ink-2)">Scroll to unlock</p>
      </div>
    </div>
  );
}

function HomeScreen({ skill }: { skill: string | null }) {
  const pills = skillGroups.flatMap((g) => g.pills);
  return (
    <div className="grid grid-cols-4 gap-x-1 gap-y-2 px-3 pt-11">
      {pills.map((pill, i) => {
        const open = pill.id === skill;
        const row = Math.floor(i / 4);
        return (
          <div key={pill.id} className={`app-icon relative ${open ? "z-10" : ""}`}>
            <span className={`app-icon-tile ${open ? "app-icon-open" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG icons, decorative */}
              <img src={pill.icon} alt="" />
            </span>
            <span className="max-w-full truncate">{pill.name}</span>
            {open ? (
              <div className={row > 2 ? "absolute bottom-full mb-1" : "absolute top-full mt-1"} style={i % 4 < 2 ? { left: 0 } : { right: 0 }}>
                <ShortcutPopup pill={pill} align={i % 4 < 2 ? "left" : "right"} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export type Draft = { name: string; email: string; message: string };

/** Dock icon geometry, shared with stage.tsx so an app can open from its own icon. */
export const DOCK = { size: 48, bottom: 24, screenW: 280, screenH: 620 };
export const dockCenterX = (i: number, n: number) => (DOCK.screenW * (i + 1)) / (n + 1);

function Dock() {
  return (
    <div className="dock">
      {projects.map((p, i) => (
        <span
          key={p.id}
          className="dock-icon"
          data-app={p.id}
          style={{ background: p.tint, left: dockCenterX(i, projects.length) - DOCK.size / 2 }}
        >
          {p.title.slice(0, 1)}
        </span>
      ))}
    </div>
  );
}

/** One full-screen layer per project: its screenshots stacked, scrolled by stage.tsx. */
function AppLayers() {
  return (
    <>
      {projects.map((p) => (
        <div key={p.id} className="app-layer" data-app={p.id} style={{ background: p.tint }}>
          <div className="app-strip">
            {p.shots.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element -- decorative copy of the column's images
              <img key={src} src={phoneShot(src)} alt="" fetchPriority="low" decoding="async" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Notification shade for Experience. One group per job, like Android groups by app: the job in view
 * expands (stage.tsx toggles .collapsed), the rest collapse to a header with a count.
 */
function ShadeLayer({ time, date }: { time: string; date: string }) {
  return (
    <div className="shade-layer">
      <div className="px-4 pt-10">
        <p className="font-(family-name:--font-display) text-[34px] leading-none font-bold">{time}</p>
        <p className="mt-1 text-[11px] text-(--screen-ink-2)">{date}</p>
      </div>
      <div className="shade-tiles">
        {EXPERIENCE[0].skills.slice(0, 4).map((s) => (
          <span key={s}>{SKILLS[s].label}</span>
        ))}
      </div>
      <div className="shade-list">
        {EXPERIENCE.map((job) => (
          <div key={job.id} className="shade-group collapsed" data-job={job.id}>
            <p className="shade-group-head">
              <span className="shade-app">{job.company.slice(0, 1)}</span>
              {job.company}
              <span className="shade-count">{job.description.length}</span>
            </p>
            <div className="shade-notes">
              {job.description.map((text) => (
                <div key={text} className="shade-note">
                  <p className="text-[10px] text-(--screen-ink-2)">{job.title}</p>
                  <p className="mt-0.5 line-clamp-3 text-[11.5px] leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gmail-style compose screen that mirrors the contact form as it's typed. */
function ComposeLayer({ draft }: { draft: Draft }) {
  return (
    <div className="compose-layer">
      <dl className="compose-fields pt-10">
        <div>
          <dt>From</dt>
          <dd>{draft.email || "you@example.com"}</dd>
        </div>
        <div>
          <dt>To</dt>
          <dd>{config.author}</dd>
        </div>
        <div>
          <dt className="sr-only">Subject</dt>
          <dd className="font-medium">Portfolio inquiry{draft.name ? ` from ${draft.name}` : ""}</dd>
        </div>
      </dl>
      <p className="compose-body">
        {draft.message || <span className="text-(--screen-ink-2)">Your message shows up here as you type.</span>}
        <span className="caret" />
      </p>
    </div>
  );
}

export function Phone({
  skill = null,
  draft = { name: "", email: "", message: "" },
  sent = false,
}: {
  skill?: string | null;
  draft?: Draft;
  sent?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { time, date } = useClock();

  // Decode every app screen once the page is idle, so none is half-drawn when it opens mid-scroll.
  useEffect(() => {
    const decodeAll = () =>
      root.current?.closest(".rig")?.querySelectorAll<HTMLImageElement>(".app-strip img, .ipad-screen img").forEach((img) => {
        img.decode().catch(() => {});
      });
    const id = "requestIdleCallback" in window ? requestIdleCallback(decodeAll, { timeout: 3000 }) : setTimeout(decodeAll, 1500);
    return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id as number) : clearTimeout(id));
  }, []);

  // Layers stack like the OS: home underneath, lock screen on top. Scroll (stage.tsx) slides the lock away.
  return (
    <div ref={root} className="device" aria-hidden inert>
      <div className="device-screen">
        <span className="device-camera" />
        <div className="os h-full">
          <div className="wallpaper absolute inset-0">
            <DustWallpaper />
            <HomeScreen skill={skill} />
            <Dock />
          </div>
          <AppLayers />
          <ShadeLayer time={time} date={date} />
          <ComposeLayer draft={draft} />
          <div className="lock-layer wallpaper absolute inset-0">
            <DustWallpaper time={time} />
            <LockScreen time={time} date={date} />
          </div>
          <div className="relative z-10">
            <StatusBar time={time} />
          </div>
          {sent ? (
            <div className="sent-banner">
              <p className="text-[11px] text-(--screen-ink-2)">Gmail</p>
              <p className="text-sm font-medium">Message sent to {config.author}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Mobile hero: the viewport itself is the lock screen until you scroll it away. */
export function MobileLock() {
  const { time, date } = useClock();
  return (
    <div className="hero-lock-mobile wallpaper" aria-hidden>
      <DustWallpaper time={time} />
      {/* No status row here: the site's top bar is the status bar on phones */}
      <LockScreen time={time} date={date} />
    </div>
  );
}

/** iPhone beside the Android phone at Contact: an iOS Mail compose sheet mirroring the same draft. */
export function IPhone({ draft }: { draft: Draft }) {
  const { time } = useClock();
  return (
    <div className="iphone" aria-hidden inert>
      <div className="iphone-screen">
        <div className="ios-status">
          <span>{time}</span>
          <span className="iphone-island" />
          <span className="flex items-center gap-[3px]">
            <Signal size={11} strokeWidth={2.5} />
            <Wifi size={11} strokeWidth={2.5} />
            <BatteryFull size={14} />
          </span>
        </div>
        <div className="ios-sheet">
          <div className="ios-sheet-bar">
            <span className="text-[#007aff]">Cancel</span>
            <span className="font-semibold">New Message</span>
            <span className="grid size-6 place-items-center rounded-full bg-[#007aff] text-white">
              <ArrowUp size={14} strokeWidth={2.75} />
            </span>
          </div>
          <dl className="ios-fields">
            <div>
              <dt>To:</dt>
              <dd>
                <span className="ios-chip">{config.author}</span>
              </dd>
            </div>
            <div>
              <dt>Cc/Bcc, From:</dt>
              <dd>{draft.email || "you@example.com"}</dd>
            </div>
            <div>
              <dt>Subject:</dt>
              <dd>Portfolio inquiry{draft.name ? ` from ${draft.name}` : ""}</dd>
            </div>
          </dl>
          <p className="ios-body">
            {draft.message || <span className="text-[#8e8e93]">Sent from my iPhone</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

/** iPad behind the phones at Contact: iPadOS Contacts open on Yash's card (no phone number shown). */
export function IPad() {
  const { about, social, author, email } = config;
  const rows = [
    { icon: Mail, label: "email", value: email },
    { icon: FaLinkedin, label: "LinkedIn", value: social.linkedin.link.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "") },
    { icon: FaGithub, label: "GitHub", value: social.github.link.replace(/^https:\/\//, "") },
    { icon: MapPin, label: "based in", value: about.location },
  ];
  return (
    <div className="ipad" aria-hidden inert>
      <div className="ipad-screen">
        <aside className="ipad-list">
          <p className="ipad-title">Contacts</p>
          <p className="ipad-search">Search</p>
          {["A", "B", "Y", "Z"].map((l) =>
            l === "Y" ? (
              <div key={l}>
                <p className="ipad-letter">{l}</p>
                <p className="ipad-row on">{author}</p>
              </div>
            ) : (
              <div key={l}>
                <p className="ipad-letter">{l}</p>
                <p className="ipad-row ghost" />
              </div>
            ),
          )}
        </aside>
        <section className="ipad-card">
          <span className="ipad-avatar">YN</span>
          <p className="ipad-name">{author}</p>
          <p className="ipad-role">{about.role}</p>
          <div className="ipad-actions">
            {[MessageCircle, PhoneIcon, Video, Mail].map((Icon, i) => (
              <span key={i}>
                <Icon size={13} />
              </span>
            ))}
          </div>
          <dl className="ipad-fields">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <dt>
                  <Icon size={9} /> {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

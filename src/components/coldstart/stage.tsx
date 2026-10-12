"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import projects from "@/data/projects";
import { DOCK, IPad, IPhone, Phone, dockCenterX, type Draft } from "./phone";
import { glideTo } from "./smooth-scroll";
import { Preloader } from "./preloader";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Lets the text column drive the phone, e.g. opening a skill highlights its icon on the device.
type StageValue = {
  skill: string | null; // pinned: details open
  setSkill: (id: string | null) => void;
  setPeek: (id: string | null) => void; // hovered: only lights up on the phone
  setDraft: (d: Draft) => void; // contact form mirrors into the phone's compose screen
  setSent: (sent: boolean) => void;
};
const StageContext = createContext<StageValue>({
  skill: null,
  setSkill: () => {},
  setPeek: () => {},
  setDraft: () => {},
  setSent: () => {},
});
export const useStage = () => useContext(StageContext);

const PHONE_W = 300;
const PHONE_H = 640;
const CONTAINER = 1152; // max-w-6xl
const GUTTER = 16;

// Phone scale: 80% on tablets / narrow laptops, and smaller still on short screens so it always fits.
const rigScale = () =>
  Math.max(0.55, Math.min(innerWidth < 1024 ? 0.8 : 1, (innerHeight - 100) / PHONE_H));

// The phone docks in the right column, vertically centred. Its visual right edge lines up with the container.
const dockRight = () => Math.max(GUTTER, (innerWidth - CONTAINER) / 2 + GUTTER);
const dockCenter = () => ({ x: innerWidth - dockRight() - (PHONE_W * rigScale()) / 2, y: innerHeight / 2 });

// Size and place the rig box for the current viewport (the box stays 300x640; .rig-scale scales it).
function placeRig(rig: HTMLElement | null) {
  if (!rig) return;
  const z = rigScale();
  rig.style.right = `${dockRight() - (PHONE_W * (1 - z)) / 2}px`;
  rig.querySelector<HTMLElement>(".rig-scale")!.style.transform = `scale(${z})`;
}

export function Stage({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const [skill, setSkill] = useState<string | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      const rig = scope.current!.querySelector<HTMLElement>(".rig");
      const onResize = () => placeRig(rig);
      placeRig(rig);
      window.addEventListener("resize", onResize);

      const mm = gsap.matchMedia();

      // Nav/anchor jumps pass straight through the hero without triggering the auto-complete below.
      let jumping = false;
      const onAnchor = (e: MouseEvent) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
        if (!a) return;
        const href = a.getAttribute("href");
        // "Home" and the logo go to the true top. The hero is pinned, so measuring #home would land
        // at the end of the pin (the docked, unlocked state) instead of the opening frame.
        if (href === "#home" || href === "/") {
          e.preventDefault();
          e.stopPropagation();
          jumping = true;
          glideTo(0, () => (jumping = false));
          return;
        }
        if (href?.includes("#")) {
          jumping = true;
          setTimeout(() => (jumping = false), 2500);
        }
      };
      document.addEventListener("click", onAnchor, true);

      // The hero always plays to the end: the first nudge down glides to its end, a nudge up rewinds to the top.
      const completeHero = () => {
        let gliding = false;
        return (self: ScrollTrigger) => {
          if (gliding || jumping) return;
          const p = self.progress;
          if (self.direction === 1 && p > 0.01 && p < 0.96) {
            gliding = true;
            glideTo(self.end + 1, () => (gliding = false));
          } else if (self.direction === -1 && p < 0.99 && p > 0.04) {
            gliding = true;
            glideTo(0, () => (gliding = false));
          }
        };
      };

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const hero = scope.current!.querySelector<HTMLElement>("#home")!;
        const yash = hero.querySelector<HTMLElement>(".hero-yash")!;
        const nautiyal = hero.querySelector<HTMLElement>(".hero-nautiyal")!;
        const PHONE_SCALE = 1.3;

        // Opening frame: the name runs edge to edge on one line, the phone rises from below.
        // Values are measured from the resting layout, so they're functions re-read on resize.
        const nameScale = () => (innerWidth * 0.92) / (yash.offsetWidth * 1.22 + nautiyal.offsetWidth);
        const lineX = (el: HTMLElement) => el.offsetLeft + hero.getBoundingClientRect().left;
        const lineY = (el: HTMLElement) => el.offsetTop;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top+=64", // pin below the sticky 64px header
            end: "+=160%",
            scrub: 0.4,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: completeHero(),
          },
        });

        // Name: shrink as one line first, then "Nautiyal" drops to its own line. Linear on both
        // lines keeps the gap constant, so the words never collide mid-scroll.
        const gapW = () => yash.offsetWidth * 1.22;
        const startX = () => innerWidth * 0.04 - lineX(yash);
        const startY = () => innerHeight * 0.14 - lineY(yash);

        tl.from(
          ".rig-film",
          {
            // Offsets are inside .rig-scale, so screen distances are divided by its scale.
            x: () => (innerWidth / 2 - dockCenter().x) / rigScale(),
            y: () => (innerHeight * 0.56 + (PHONE_H * PHONE_SCALE * rigScale()) / 2 - dockCenter().y) / rigScale(),
            scale: PHONE_SCALE,
            duration: 1,
          },
          0,
        )
          .fromTo(yash, { x: startX, y: startY, scale: nameScale }, { x: 0, y: 0, scale: 1, duration: 0.55 }, 0)
          .fromTo(
            nautiyal,
            {
              x: () => innerWidth * 0.04 + gapW() * nameScale() - lineX(nautiyal),
              y: () => innerHeight * 0.14 - lineY(nautiyal),
              scale: nameScale,
            },
            {
              x: () => lineX(yash) + gapW() - lineX(nautiyal),
              y: () => lineY(yash) - lineY(nautiyal),
              scale: 1,
              duration: 0.55,
            },
            0,
          )
          .to(nautiyal, { x: 0, y: 0, duration: 0.2, ease: "power2.inOut" }, 0.55)
          .to(".hero-hint", { autoAlpha: 0, duration: 0.15 }, 0)
          .from(".hero-fade", { opacity: 0, y: 28, stagger: 0.05, duration: 0.2 }, 0.78)
          .to(".lock-layer", { yPercent: -100, duration: 0.25, ease: "power2.in" }, 0.72)
          // Launcher animation: icons scale in as the lock screen leaves.
          .from(".device .app-icon", { scale: 0.6, autoAlpha: 0, stagger: 0.008, duration: 0.15, ease: "back.out(2)" }, 0.85);

        // Pointer tilt, so the device feels like an object, not a picture.
        const rx = gsap.quickTo(".rig-tilt", "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(".rig-tilt", "rotationY", { duration: 0.6, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          ry((e.clientX / innerWidth - 0.5) * 14);
          rx((e.clientY / innerHeight - 0.5) * -10);
        };
        window.addEventListener("pointermove", onMove);

        // Projects: each chapter opens its app from the dock icon, scrolls the real screens, then closes.
        const { size, bottom, screenW, screenH } = DOCK;
        const iconClip = (i: number) => {
          const c = dockCenterX(i, projects.length);
          const top = screenH - bottom - size;
          return `inset(${top}px ${screenW - c - size / 2}px ${bottom}px ${c - size / 2}px round 16px)`;
        };
        // Open/close moments play to completion on their own once a scroll point is crossed (and reverse
        // on the way back), so stopping mid-scroll never freezes a half-open app, shade or sheet.
        const FULL = "inset(0px 0px 0px 0px round 36px)";
        projects.forEach((p, i) => {
          const chapter = scope.current!.querySelector<HTMLElement>(`.project-chapter[data-app="${p.id}"]`);
          const layer = `.app-layer[data-app="${p.id}"]`;
          const icon = `.dock-icon[data-app="${p.id}"]`;
          const counter = chapter?.querySelector<HTMLElement>(".shot-count");
          if (!chapter) return;
          const n = p.shots.length;

          const open = gsap
            .timeline({ paused: true })
            .set(layer, { autoAlpha: 1, immediateRender: false })
            .fromTo(icon, { scale: 1 }, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.out" }, 0)
            .fromTo(layer, { clipPath: iconClip(i) }, { clipPath: FULL, duration: 0.55, ease: "power3.inOut" }, 0.05);

          // The screens still follow the scroll: each one holds, then swipes to the next.
          const strip = gsap.timeline({ defaults: { ease: "none" }, paused: true });
          for (let k = 1; k < n; k++) {
            strip.to(`${layer} .app-strip`, { yPercent: (-100 * k) / n, duration: 0.35, ease: "power2.inOut" }, k - 0.35);
          }
          strip.set({}, {}, n); // total length n, so screen k shows from k/n — same maths as the counter

          ScrollTrigger.create({
            trigger: chapter,
            start: "top 65%",
            end: "bottom 35%",
            onToggle: (self) => (self.isActive ? open.play() : open.reverse()),
            onUpdate: (self) => {
              const t = gsap.utils.clamp(0, 1, (self.progress - 0.15) / 0.7);
              gsap.to(strip, { progress: t, duration: 0.4, ease: "power2.out", overwrite: true });
              if (counter) counter.textContent = `Screen ${gsap.utils.clamp(1, n, Math.floor(t * n) + 1)} of ${n}`;
            },
          });
        });

        // Experience: the shade drops once for the whole section and lifts after the last job.
        const shade = gsap
          .timeline({ paused: true })
          .set(".shade-layer", { autoAlpha: 1, immediateRender: false })
          .fromTo(".shade-layer", { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: "power3.out" });
        const expWrap = scope.current!.querySelector<HTMLElement>(".exp-chapters");
        if (expWrap) {
          ScrollTrigger.create({
            trigger: expWrap,
            start: "top 60%",
            end: "bottom 45%",
            onToggle: (self) => (self.isActive ? shade.play() : shade.reverse()),
          });
        }

        // Each job: its group expands (others collapse, as Android groups notifications by app); its
        // notifications land one by one (.in, CSS transition) and the matching bullet lights up.
        scope.current!.querySelectorAll<HTMLElement>(".exp-chapter").forEach((chapter) => {
          const id = chapter.dataset.exp;
          const items = [...chapter.querySelectorAll<HTMLElement>(".exp-list li")];
          const notes = [...scope.current!.querySelectorAll<HTMLElement>(`.shade-group[data-job="${id}"] .shade-note`)];
          const span = 0.7 / items.length;
          const light = (k: number) => {
            items.forEach((li, i) => li.classList.toggle("is-live", i <= k));
            notes.forEach((nt, i) => nt.classList.toggle("in", i <= k));
          };
          ScrollTrigger.create({
            trigger: chapter,
            start: "top 60%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (!self.isActive) return light(-1);
              scope.current!.querySelectorAll<HTMLElement>(".shade-group").forEach((g) =>
                g.classList.toggle("collapsed", g.dataset.job !== id),
              );
            },
            onUpdate: (self) => self.isActive && light(Math.floor((self.progress - 0.1) / span)),
          });
        });

        // Contact: the compose sheet slides up and the device family rises, iPad behind, iPhone in front.
        const contact = gsap
          .timeline({ paused: true, defaults: { duration: 0.8, ease: "power3.out" } })
          .fromTo(".compose-layer", { yPercent: 100, autoAlpha: 1 }, { yPercent: 0, duration: 0.6 }, 0)
          // Order comes from the DOM (iPad before, iPhone after the phone); CSS hides both below 1280px
          .fromTo(".ipad", { autoAlpha: 0, y: 520, rotationZ: -6 }, { autoAlpha: 1, y: 0, rotationZ: 0 }, 0.05)
          .fromTo(".iphone", { autoAlpha: 0, y: 640, rotationZ: 8, scale: 0.62 }, { autoAlpha: 1, y: 0, rotationZ: 0, scale: 0.62 }, 0.15)
          // The Android phone steps forward-right and shrinks so the landscape iPad reads as a tablet behind it
          .to(".rig .device", { scale: 0.6, x: 50, y: 110 }, 0);
        ScrollTrigger.create({
          trigger: "#contact",
          start: "top 70%",
          onEnter: () => contact.play(),
          onLeaveBack: () => contact.reverse(),
        });

        // Scroll speed leans the phone back and lets it trail a little, then it settles.
        const leanX = gsap.quickTo(".rig-lean", "rotationX", { duration: 0.8, ease: "power3" });
        const leanY = gsap.quickTo(".rig-lean", "y", { duration: 0.8, ease: "power3" });
        const settle = gsap.delayedCall(0.12, () => {
          leanX(0);
          leanY(0);
        });
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-2500, 2500, self.getVelocity());
            leanX(v * -0.003);
            leanY(v * 0.012);
            settle.restart(true);
          },
        });

        gsap.set([".hero-inner", ".rig"], { visibility: "visible" });
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        // The viewport opens as the lock screen; scrolling swipes it up to reveal the page.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: "#home",
              start: "top top+=64", // below the sticky header, same as desktop
              end: "+=90%",
              scrub: 0.5,
              pin: true,
              onUpdate: completeHero(),
            },
          })
          .to(".hero-lock-mobile", { yPercent: -100, ease: "power1.in", duration: 0.6 }, 0)
          // The page appears only once the lock screen is (almost) gone
          .set(".hero-inner", { visibility: "visible" }, 0.45)
          .from([".hero-yash", ".hero-nautiyal", ".hero-fade"], { opacity: 0, y: 40, stagger: 0.06, duration: 0.35 }, 0.5);
      });

      // Background: projects tint the paper (and the signal contours) with their app colour.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = document.documentElement;
        const active = new Set<string>();
        projects.forEach((p) => {
          ScrollTrigger.create({
            trigger: `.project-chapter[data-app="${p.id}"]`,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              if (self.isActive) active.add(p.id);
              else active.delete(p.id);
              gsap.to(root, {
                "--tint": self.isActive ? p.tint : getComputedStyle(root).getPropertyValue("--tint"),
                "--tint-amt": active.size ? "9%" : "0%",
                duration: 0.9,
                ease: "power2.out",
                overwrite: "auto",
              });
            },
          });
        });
        return () => {
          root.style.removeProperty("--tint");
          root.style.removeProperty("--tint-amt");
        };
      });

      // Section intros and rows rise into place as they scroll in, tied to scroll position.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rise = (targets: string, y: number, start: string, end: string) =>
          gsap.utils.toArray<HTMLElement>(targets, scope.current).forEach((el) =>
            gsap.from(el, {
              y,
              opacity: 0, // not autoAlpha: visibility:hidden would hide headings from screen readers
              ease: "power2.out",
              scrollTrigger: { trigger: el, start, end, scrub: 0.4 },
            }),
          );
        rise(".section-title", 70, "top 95%", "top 65%");
        rise(".section-sub", 40, "top 95%", "top 70%");
        rise(".skill-row, .app-group", 50, "top 98%", "top 72%");
      });

      // Reduced motion: no film. Phone sits docked and unlocked.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".lock-layer", { yPercent: -100 });
      });

      return () => {
        document.removeEventListener("click", onAnchor, true);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope },
  );

  return (
    <StageContext.Provider value={{ skill, setSkill, setPeek, setDraft, setSent }}>
      <div ref={scope}>
        <Preloader />
        <div className="md:pr-[calc(240px+3rem)] lg:pr-[calc(300px+4rem)] xl:pr-[calc(300px+6rem)]">{children}</div>
        <div className="rig rig-family" aria-hidden>
          <div className="rig-scale">
            <div className="rig-film">
              <div className="rig-lean">
                <div className="rig-tilt">
                  <IPad />
                  <Phone skill={peek ?? skill} draft={draft} sent={sent} />
                  <IPhone draft={draft} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StageContext.Provider>
  );
}

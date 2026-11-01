import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------- Theme ----------
const C = {
  bg: "#0b1020",
  bg2: "#141b33",
  text: "#f4f6ff",
  muted: "#8a93b8",
  accent: "#4cc9f0",
  packet: "#ffb703",
  good: "#3ddc97",
  bad: "#ff5d73",
  router: "#7b61ff",
};
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', Menlo, monospace";

const FPS = 30;
const SCENES = {
  hook: { from: 0, dur: 90 },
  arrive: { from: 90, dur: 150 },
  read: { from: 240, dur: 150 },
  lookup: { from: 390, dur: 210 },
  forward: { from: 600, dur: 180 },
  recap: { from: 780, dur: 150 },
};
const TOTAL = 930;

// ---------- Helpers ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useFadeInOut = (dur: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
};

const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 14, mass: 0.6 } });
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (f * 0.6) % 80;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, ${C.bg2} 0%, ${C.bg} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `0 ${shift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const StepTitle: React.FC<{ step: string; title: string }> = ({
  step,
  title,
}) => {
  const p = usePop(0);
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 90,
        right: 90,
        transform: `translateY(${(1 - p) * -40}px)`,
        opacity: p,
      }}
    >
      <div
        style={{
          color: C.accent,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {step}
      </div>
      <div
        style={{
          color: C.text,
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.05,
          marginTop: 12,
        }}
      >
        {title}
      </div>
    </div>
  );
};

const Caption: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 20,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 170,
        left: 90,
        right: 90,
        textAlign: "center",
        color: C.text,
        fontSize: 52,
        fontWeight: 600,
        lineHeight: 1.3,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Hl: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.packet,
}) => <span style={{ color }}>{children}</span>;

// The packet "envelope"
const PacketCard: React.FC<{
  ttl?: number;
  highlightDst?: number; // 0..1
  scale?: number;
}> = ({ ttl = 64, highlightDst = 0, scale = 1 }) => {
  const row = (k: string, v: string, hl = 0) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 18px",
        borderRadius: 12,
        background: `rgba(255,183,3,${0.25 * hl})`,
        boxShadow: hl > 0 ? `0 0 ${40 * hl}px rgba(255,183,3,${0.7 * hl})` : "none",
        transform: `scale(${1 + 0.06 * hl})`,
      }}
    >
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: C.text, fontWeight: 700 }}>{v}</span>
    </div>
  );
  return (
    <div
      style={{
        width: 560,
        background: "#1d2647",
        border: `4px solid ${C.packet}`,
        borderRadius: 28,
        padding: 22,
        fontFamily: MONO,
        fontSize: 36,
        transform: `scale(${scale})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          color: C.packet,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 3,
          marginBottom: 10,
          paddingLeft: 18,
        }}
      >
        📦 IP PACKET
      </div>
      {row("SRC", "192.168.1.10")}
      {row("DST", "8.8.8.8", highlightDst)}
      {row("TTL", String(ttl))}
      <div
        style={{
          marginTop: 10,
          height: 46,
          borderRadius: 10,
          background:
            "repeating-linear-gradient(90deg, #2c3766 0 22px, #25305a 22px 44px)",
          color: C.muted,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        data…
      </div>
    </div>
  );
};

const RouterBox: React.FC<{ glow?: number; width?: number }> = ({
  glow = 0,
  width = 640,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: 220,
        borderRadius: 36,
        background: `linear-gradient(180deg, ${C.router}, #4b38c9)`,
        boxShadow: `0 0 ${30 + 60 * glow}px rgba(123,97,255,${0.4 + 0.5 * glow})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 2 }}>
        ROUTER
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background:
                Math.floor(f / 6 + i) % 3 === 0 ? C.good : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ---------- Scenes ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const o = useFadeInOut(SCENES.hook.dur);
  const p1 = usePop(0);
  const p2 = usePop(18);
  const bob = Math.sin(f / 8) * 14;
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontSize: 200,
          transform: `translateY(${bob}px) scale(${p1})`,
        }}
      >
        📦
      </div>
      <div
        style={{
          color: C.text,
          fontSize: 104,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.08,
          padding: "0 90px",
          marginTop: 40,
          opacity: p1,
        }}
      >
        How does a packet find its way?
      </div>
      <div
        style={{
          color: C.accent,
          fontSize: 52,
          fontWeight: 600,
          marginTop: 40,
          opacity: p2,
          transform: `translateY(${(1 - p2) * 30}px)`,
        }}
      >
        Inside a router, in 4 steps 👇
      </div>
    </AbsoluteFill>
  );
};

const Arrive: React.FC = () => {
  const f = useCurrentFrame();
  const o = useFadeInOut(SCENES.arrive.dur);
  // packet falls from top into router
  const y = interpolate(f, [15, 90], [-200, 470], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const shrink = interpolate(f, [80, 100], [1, 0.0], clamp);
  const glow = interpolate(f, [90, 105, 130], [0, 1, 0.3], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <StepTitle step="Step 1" title="Packet arrives" />
      {/* incoming link */}
      <div
        style={{
          position: "absolute",
          left: 535,
          top: 520,
          width: 10,
          height: 560,
          background: `linear-gradient(${C.accent}00, ${C.accent})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1040,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <RouterBox glow={glow} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 960,
          paddingLeft: 230,
          textAlign: "center",
          color: C.accent,
          fontFamily: MONO,
          fontSize: 34,
        }}
      >
        ↓ port eth0
      </div>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PacketCard scale={shrink} />
      </div>
      <Caption delay={100}>
        A packet from <Hl>your laptop</Hl> hits the router's input port
      </Caption>
    </AbsoluteFill>
  );
};

const Read: React.FC = () => {
  const f = useCurrentFrame();
  const o = useFadeInOut(SCENES.read.dur);
  const p = usePop(0);
  const hl = interpolate(f, [30, 50], [0, 1], clamp);
  const lensX = interpolate(f, [10, 40], [-300, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <StepTitle step="Step 2" title="Read the header" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${0.6 + 0.7 * p})` }}>
          <PacketCard highlightDst={hl} />
          <div
            style={{
              position: "absolute",
              right: -120,
              top: 110,
              fontSize: 140,
              transform: `translateX(${-lensX}px) rotate(-10deg)`,
              opacity: interpolate(f, [10, 25], [0, 1], clamp),
            }}
          >
            🔍
          </div>
        </div>
      </AbsoluteFill>
      <Caption delay={55}>
        It only cares about one thing:
        <br />
        the <Hl>destination IP</Hl> → <Hl>8.8.8.8</Hl>
      </Caption>
    </AbsoluteFill>
  );
};

const ROUTES = [
  { net: "192.168.1.0/24", port: "eth0", note: "home LAN" },
  { net: "10.0.0.0/8", port: "eth1", note: "office VPN" },
  { net: "0.0.0.0/0", port: "eth2", note: "default → ISP" },
];

const Lookup: React.FC = () => {
  const f = useCurrentFrame();
  const o = useFadeInOut(SCENES.lookup.dur);
  const tableP = usePop(5);
  const rowStart = 35;
  const rowStep = 35;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <StepTitle step="Step 3" title="Check the routing table" />
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 48,
          color: C.text,
        }}
      >
        Where does <Hl>8.8.8.8</Hl> go?
      </div>
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 90,
          right: 90,
          background: "#141c38",
          borderRadius: 28,
          padding: 24,
          border: `3px solid ${C.router}`,
          opacity: tableP,
          transform: `scale(${0.9 + 0.1 * tableP})`,
          fontFamily: MONO,
        }}
      >
        <div
          style={{
            display: "flex",
            color: C.muted,
            fontSize: 34,
            padding: "8px 20px 18px",
            borderBottom: "2px solid #2a3462",
          }}
        >
          <div style={{ flex: 1.6 }}>NETWORK</div>
          <div style={{ flex: 1 }}>PORT</div>
          <div style={{ width: 70 }} />
        </div>
        {ROUTES.map((r, i) => {
          const t0 = rowStart + i * rowStep;
          const active = interpolate(f, [t0, t0 + 8], [0, 1], clamp);
          const isMatch = i === ROUTES.length - 1;
          const mark = interpolate(f, [t0 + 14, t0 + 22], [0, 1], clamp);
          const winner = isMatch
            ? interpolate(f, [t0 + 25, t0 + 40], [0, 1], clamp)
            : 0;
          const dim = !isMatch ? interpolate(f, [t0 + 25, t0 + 35], [0, 0.55], clamp) : 0;
          return (
            <div
              key={r.net}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "26px 20px",
                marginTop: 10,
                borderRadius: 16,
                fontSize: 40,
                color: C.text,
                opacity: 1 - dim,
                background: isMatch
                  ? `rgba(61,220,151,${0.08 * active + 0.2 * winner})`
                  : `rgba(255,255,255,${0.06 * active})`,
                border: `3px solid rgba(61,220,151,${winner})`,
                transform: `scale(${1 + 0.04 * winner})`,
              }}
            >
              <div style={{ flex: 1.6 }}>
                <div style={{ fontWeight: 700 }}>{r.net}</div>
                <div style={{ fontSize: 28, color: C.muted, fontFamily: FONT }}>
                  {r.note}
                </div>
              </div>
              <div style={{ flex: 1, fontWeight: 700 }}>{r.port}</div>
              <div
                style={{
                  width: 70,
                  fontSize: 52,
                  textAlign: "center",
                  color: isMatch ? C.good : C.bad,
                  transform: `scale(${mark})`,
                }}
              >
                {isMatch ? "✓" : "✗"}
              </div>
            </div>
          );
        })}
      </div>
      <Caption delay={rowStart + 3 * rowStep + 10}>
        No specific route matches, so it uses the
        <br />
        <Hl color={C.good}>default route → eth2</Hl>
        <div style={{ fontSize: 38, color: C.muted, marginTop: 16, fontWeight: 500 }}>
          (rule: the most specific match always wins)
        </div>
      </Caption>
    </AbsoluteFill>
  );
};

const Forward: React.FC = () => {
  const f = useCurrentFrame();
  const o = useFadeInOut(SCENES.forward.dur);
  const ttl = f < 40 ? 64 : 63;
  const ttlFlash = interpolate(f, [38, 45, 70], [0, 1, 0], clamp);
  const y = interpolate(f, [75, 140], [760, 1380], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const packetScale = interpolate(f, [70, 85], [0.8, 0.55], clamp);
  const cloudP = usePop(130);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <StepTitle step="Step 4" title="Forward it out" />
      {/* router */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <RouterBox width={720} glow={0.3} />
      </div>
      {/* exit links */}
      {[
        { x: 260, label: "eth1", on: false },
        { x: 540, label: "eth2", on: true },
        { x: 820, label: "eth0", on: false },
      ].map((l) => (
        <React.Fragment key={l.label}>
          <div
            style={{
              position: "absolute",
              left: l.x - 5,
              top: 740,
              width: 10,
              height: 760,
              background: l.on ? C.good : "#2a3462",
              boxShadow: l.on ? `0 0 30px ${C.good}` : "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: l.x - 80,
              width: 160,
              top: 760,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 32,
              color: l.on ? C.good : C.muted,
              background: C.bg,
              padding: "4px 0",
            }}
          >
            {l.label}
          </div>
        </React.Fragment>
      ))}
      {/* packet */}
      <div
        style={{
          position: "absolute",
          top: y,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transformOrigin: "top center",
        }}
      >
        <div style={{ transform: `scale(${packetScale})`, transformOrigin: "top center" }}>
          <PacketCard ttl={ttl} />
        </div>
      </div>
      {/* TTL badge */}
      <div
        style={{
          position: "absolute",
          top: 1210,
          right: 70,
          fontFamily: MONO,
          fontSize: 40,
          color: C.packet,
          opacity: ttlFlash,
          transform: `scale(${1 + 0.2 * ttlFlash})`,
        }}
      >
        TTL −1
      </div>
      {/* internet cloud */}
      <div
        style={{
          position: "absolute",
          top: 1450,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 120,
          transform: `scale(${cloudP})`,
        }}
      >
        ☁️
        <div style={{ fontSize: 44, color: C.text, fontWeight: 700 }}>
          Next hop: your ISP
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1720,
          left: 90,
          right: 90,
          textAlign: "center",
          color: C.muted,
          fontSize: 40,
          opacity: interpolate(f, [40, 55], [0, 1], clamp),
        }}
      >
        TTL drops by 1 and new MAC addresses are written for the next link
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC = () => {
  const o = useFadeInOut(SCENES.recap.dur);
  const steps = [
    { icon: "📥", t: "Receive" },
    { icon: "🔍", t: "Read the destination" },
    { icon: "📋", t: "Look up the route" },
    { icon: "📤", t: "Forward" },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 90,
          right: 90,
          color: C.text,
          fontSize: 92,
          fontWeight: 800,
        }}
      >
        Recap
      </div>
      <div style={{ position: "absolute", top: 420, left: 90, right: 90 }}>
        {steps.map((s, i) => (
          <RecapRow key={s.t} index={i} icon={s.icon} text={s.t} />
        ))}
      </div>
      <Caption delay={70}>
        Every router repeats this, <Hl>hop by hop</Hl>,
        <br />
        until the packet reaches <Hl>8.8.8.8</Hl> 🎯
      </Caption>
    </AbsoluteFill>
  );
};

const RecapRow: React.FC<{ index: number; icon: string; text: string }> = ({
  index,
  icon,
  text,
}) => {
  const p = usePop(8 + index * 12);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: "#141c38",
        borderRadius: 24,
        padding: "30px 36px",
        marginBottom: 26,
        opacity: p,
        transform: `translateX(${(1 - p) * -120}px)`,
        border: "2px solid #2a3462",
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          background: C.accent,
          color: C.bg,
          fontSize: 44,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index + 1}
      </div>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div style={{ color: C.text, fontSize: 52, fontWeight: 700 }}>{text}</div>
    </div>
  );
};

// ---------- Main ----------
export const MyComponent: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.dur}>
        <Hook />
      </Sequence>
      <Sequence from={SCENES.arrive.from} durationInFrames={SCENES.arrive.dur}>
        <Arrive />
      </Sequence>
      <Sequence from={SCENES.read.from} durationInFrames={SCENES.read.dur}>
        <Read />
      </Sequence>
      <Sequence from={SCENES.lookup.from} durationInFrames={SCENES.lookup.dur}>
        <Lookup />
      </Sequence>
      <Sequence from={SCENES.forward.from} durationInFrames={SCENES.forward.dur}>
        <Forward />
      </Sequence>
      <Sequence from={SCENES.recap.from} durationInFrames={SCENES.recap.dur}>
        <Recap />
      </Sequence>
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="PacketRouting"
      component={MyComponent}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

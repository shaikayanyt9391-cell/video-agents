import React from "react";
import {
  AbsoluteFill, Audio, Series, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import storyboard from "../storyboard.json";

const sb = storyboard as any;

const Scene: React.FC<{ title: string; subtitle: string; index: number }> = ({ title, subtitle, index }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const tall = height > width;
  const c = sb.colors;

  const base = Math.min(width, height);
  const len = title.length;
  const k = len > 90 ? 0.5 : len > 60 ? 0.62 : len > 35 ? 0.78 : 1; // long text = smaller font
  const titleSize = base * (tall ? 0.11 : 0.1) * k;
  const subSize = base * (tall ? 0.05 : 0.045);
  const safeY = tall ? height * 0.1 : height * 0.05;

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const fadeOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subIn = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const angle = 135 + index * 25 + frame * 0.4;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${c.bg}, ${c.bg2})`,
        justifyContent: "center",
        alignItems: "center",
        padding: `${safeY}px ${width * 0.08}px`,
        opacity: fadeOut,
        fontFamily: "Arial, Helvetica, sans-serif",
        textAlign: "center",
      }}
    >
      {sb.label ? (
        <div style={{ position: "absolute", top: safeY, color: c.accent, fontSize: base * 0.035, fontWeight: 700, letterSpacing: 2 }}>
          {sb.label}
        </div>
      ) : null}
      <div
        style={{
          width: width * 0.12, height: 8, background: c.accent, borderRadius: 4,
          marginBottom: base * 0.04, transform: `scaleX(${enter})`,
        }}
      />
      <div
        style={{
          color: c.text, fontSize: titleSize, fontWeight: 800, lineHeight: 1.15,
          transform: `translateY(${(1 - enter) * 60}px) scale(${0.9 + enter * 0.1})`,
          opacity: enter,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div style={{ color: c.accent, fontSize: subSize, marginTop: base * 0.03, opacity: subIn, transform: `translateY(${(1 - subIn) * 30}px)` }}>
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const fps = sb.fps;
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const tall = height > width;
  const progress = Math.min(1, frame / durationInFrames);

  return (
    <AbsoluteFill>
      {sb.audio ? <Audio src={staticFile(sb.audio)} /> : null}
      <Series>
        {sb.scenes.map((s: any, i: number) => (
          <Series.Sequence key={i} durationInFrames={Math.max(1, Math.round(s.seconds * fps))}>
            <Scene title={s.title} subtitle={s.subtitle ?? ""} index={i} />
          </Series.Sequence>
        ))}
      </Series>
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          bottom: tall ? height * 0.06 : height * 0.03,
          height: 6,
          width: width * 0.84 * progress,
          background: sb.colors.accent,
          borderRadius: 3,
        }}
      />
    </AbsoluteFill>
  );
};

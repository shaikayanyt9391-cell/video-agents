import React from "react";
import {
  AbsoluteFill, Series, interpolate, spring,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import storyboard from "../storyboard.json";

const Scene: React.FC<{ title: string; subtitle: string; index: number }> = ({ title, subtitle, index }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const tall = height > width;
  const c = storyboard.colors;

  // sizes come from the canvas, so one code works for PC and mobile
  const base = Math.min(width, height);
  const titleSize = base * (tall ? 0.11 : 0.1);
  const subSize = base * (tall ? 0.05 : 0.045);
  const safeY = tall ? height * 0.1 : height * 0.05; // mobile safe zone for app UI

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
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
      <div
        style={{
          width: width * 0.12,
          height: 8,
          background: c.accent,
          borderRadius: 4,
          marginBottom: base * 0.04,
          transform: `scaleX(${enter})`,
        }}
      />
      <div
        style={{
          color: c.text,
          fontSize: titleSize,
          fontWeight: 800,
          lineHeight: 1.1,
          transform: `translateY(${(1 - enter) * 60}px) scale(${0.9 + enter * 0.1})`,
          opacity: enter,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: c.accent,
          fontSize: subSize,
          marginTop: base * 0.03,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 30}px)`,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const fps = storyboard.fps;
  return (
    <Series>
      {storyboard.scenes.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={Math.round(s.seconds * fps)}>
          <Scene title={s.title} subtitle={s.subtitle} index={i} />
        </Series.Sequence>
      ))}
    </Series>
  );
};

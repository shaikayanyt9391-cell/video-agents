import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import storyboard from "../storyboard.json";
import config from "../config.json";

const fps = storyboard.fps ?? config.fps;
const total = storyboard.scenes.reduce((s, sc) => s + Math.round(sc.seconds * fps), 0);

export const Root: React.FC = () => (
  <>
    <Composition
      id="Pc"
      component={Video}
      durationInFrames={total}
      fps={fps}
      width={config.formats.pc.width}
      height={config.formats.pc.height}
    />
    <Composition
      id="Mobile"
      component={Video}
      durationInFrames={total}
      fps={fps}
      width={config.formats.mobile.width}
      height={config.formats.mobile.height}
    />
  </>
);

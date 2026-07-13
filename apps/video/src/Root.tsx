import { Composition } from "remotion";
import { Presentation, TOTAL_DURATION, FPS } from "./Presentation";

export const Root = () => {
  return (
    <Composition
      id="GmSolarPresentation"
      component={Presentation}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};

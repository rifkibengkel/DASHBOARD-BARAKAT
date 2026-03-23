import React from "react";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("react-viewer"), { ssr: false });

interface ViewerProps {
  url: { src: string }[];
  openViewer: boolean;
  container: HTMLElement | null;
}

const ImageViewer = (props: ViewerProps) => {
  return (
    <Viewer
      zIndex={2000}
      visible={props.openViewer}
      disableKeyboardSupport={true}
      images={props.url}
      container={props.container ?? undefined}
    />
  );
};

export default React.memo(ImageViewer);

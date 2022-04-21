import { TilesInfo } from "../../../model/embeddings";
import { LatLng } from "leaflet";
import React, { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import FileMarkerPopup from "./FileMarkerPopup";

type FileMarkerProps = {
  info: Required<TilesInfo>;
  blur?: boolean;
  className?: string;
};

export default function FileMarker(props: FileMarkerProps): JSX.Element | null {
  const { info, blur = true, className } = props;
  const [position, setPosition] = useState<LatLng | null>(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => setPosition(null), [info.algorithm]);

  return position === null ? null : (
    <FileMarkerPopup
      position={position}
      info={info}
      blur={blur}
      className={className}
    />
  );
}

import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { TilesInfo } from "../../../model/embeddings";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import tilesURL from "../../../application/api/embeddings/tilesURL";
import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import FileMarker from "./FileMarker";

const useStyles = makeStyles<Theme>({
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
});

type EmbeddingsMapTilesProps = {
  info: Required<TilesInfo>;
  blur?: boolean;
  className?: string;
};

export default function EmbeddingsMapTiles(
  props: EmbeddingsMapTilesProps
): JSX.Element {
  const { className, info, blur = true } = props;
  const classes = useStyles();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current != null) {
      (ref.current as L.TileLayer).setUrl(tilesURL(info.algorithm));
    }
  }, [info.algorithm]);

  return (
    <MapContainer
      zoom={0}
      center={[-150, 150]}
      scrollWheelZoom
      zoomControl={true}
      className={clsx(classes.map, className)}
      minZoom={0}
      maxZoom={info.maxZoom}
      crs={L.CRS.Simple}
    >
      <TileLayer
        ref={ref}
        url={tilesURL(info.algorithm)}
        attribution="Beneficent Technology"
      />
      <FileMarker info={info} blur={blur} />
    </MapContainer>
  );
}

import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import {
  EmbeddingCoords,
  TilesBBox,
  TilesInfo,
} from "../../../model/embeddings";
import useNeighbors from "../../../application/api/embeddings/useNeighbors";
import { Popup } from "react-leaflet";
import { LatLng } from "leaflet";
import MediaPreview from "../../../components/basic/MediaPreview";
import clsx from "clsx";
import FileSummary from "../../../components/files/FileSummary";
import { useShowFile } from "../../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  fileMarkerPopup: {},
  preview: {
    width: 300,
    height: 150,
    marginTop: theme.spacing(2),
  },
}));

type FileMarkerPopupProps = {
  position: LatLng;
  info: Required<TilesInfo>;
  blur?: boolean;
  className?: string;
};

function toCoords(pos: LatLng, bbox: TilesBBox): EmbeddingCoords {
  return {
    x: (pos.lng / 256) * (bbox.x.max - bbox.x.min) + bbox.x.min,
    y: ((pos.lat + 256) / 256) * (bbox.y.max - bbox.y.min) + bbox.y.min,
  };
}

function toLatLng(pos: EmbeddingCoords, bbox: TilesBBox): LatLng {
  const lat = ((pos.y - bbox.y.min) / (bbox.y.max - bbox.y.min) - 1) * 256;
  const lng = (256 * (pos.x - bbox.x.min)) / (bbox.x.max - bbox.x.min);
  return new LatLng(lat, lng);
}

export default function FileMarkerPopup(
  props: FileMarkerPopupProps
): JSX.Element | null {
  const { position, info, blur = true, className } = props;
  const classes = useStyles();
  const coords = toCoords(position, info.bbox);
  const neighbors = useNeighbors({
    algorithm: info.algorithm,
    maxCount: 20,
    maxDistance: info.pointSize * 3,
    ...coords,
  });
  const showFile = useShowFile();
  const onShow = useCallback(() => {
    if (neighbors != null && neighbors.length > 0) {
      showFile(neighbors[0].file);
    }
  }, [neighbors]);

  if (neighbors == null || neighbors.length === 0) {
    return null;
  }

  const result = neighbors[0];
  const refinedLatLng = toLatLng(result, info.bbox);

  return (
    <Popup
      position={refinedLatLng}
      className={clsx(classes.fileMarkerPopup, className)}
    >
      <FileSummary file={neighbors[0].file}>
        <FileSummary.Name />
      </FileSummary>
      <MediaPreview
        src={neighbors[0].file.preview}
        alt="preview"
        blur={blur}
        className={classes.preview}
        onClick={onShow}
      />
    </Popup>
  );
}

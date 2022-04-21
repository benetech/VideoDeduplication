import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import Dashlet from "../Dashlet";
import L from "leaflet";
import EmbeddingsActions from "./EmbeddingsActions";
import tilesURL from "../../../application/api/embeddings/tilesURL";
import { EmbeddingAlgorithm, TilesInfo } from "../../../model/embeddings";
import useTilesInfo from "../../../application/api/embeddings/useTilesInfo";
import EmbeddingsMapTiles from "./EmbeddingsMapTiles";
import EmbeddingsMapStub from "./EmbeddingsMapStub";

const useStyles = makeStyles<Theme>({
  embeddingsMap: {},
  mapContainer: {
    width: "100%",
    height: 400,
  },
});

type EmbeddingsMapProps = {
  className?: string;
};

export default function EmbeddingsMap(props: EmbeddingsMapProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const ref = useRef(null);
  const [algorithm, setAlgorithm] = useState<EmbeddingAlgorithm>("pacmap");
  const [blur, setBlur] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current != null) {
      (ref.current as L.TileLayer).setUrl(tilesURL(algorithm));
    }
  }, [algorithm]);

  const info = useTilesInfo(algorithm);

  return (
    <Dashlet
      title="Embeddings"
      actions={
        <EmbeddingsActions
          algorithm={algorithm}
          onChange={setAlgorithm}
          blur={blur}
          onBlurChange={setBlur}
        />
      }
      className={clsx(classes.embeddingsMap, className)}
    >
      <div className={classes.mapContainer}>
        {info?.available && (
          <EmbeddingsMapTiles info={info as Required<TilesInfo>} blur={blur} />
        )}
        {!info?.available && (
          <EmbeddingsMapStub algorithm={algorithm} loading={info == null} />
        )}
      </div>
    </Dashlet>
  );
}

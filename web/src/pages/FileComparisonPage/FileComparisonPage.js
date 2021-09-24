import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import MotherFile from "./MotherFile/MotherFile";
import MatchFiles from "./MatchFiles/MatchFiles";
import { useParams } from "react-router-dom";
import useFile from "../../application/api/files/useFile";
import { useCompareFiles, useShowMatches } from "../../routing/hooks";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.dimensions.content.padding * 2,
  },
}));

function FileComparisonPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id: rawId, matchFileId } = useParams();
  const id = Number(rawId);
  const { file: motherFile } = useFile(id);
  const showMatches = useShowMatches();
  const handleShowMatches = useCallback(() => showMatches(id), [id]);

  useEffect(() => {
    if (motherFile?.external) {
      handleShowMatches();
    }
  }, [motherFile]);

  const compareFiles = useCompareFiles();
  const handleMatchFileChange = useCallback(
    (matchFile) => compareFiles(id, matchFile),
    [id]
  );

  return (
    <div className={clsx(classes.root, className)}>
      <Grid container spacing={0}>
        <Grid item xs={12} lg={6}>
          <MotherFile motherFileId={id} onBack={handleShowMatches} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <MatchFiles
            motherFileId={id}
            matchFileId={matchFileId != null ? Number(matchFileId) : null}
            onMatchFileChange={handleMatchFileChange}
          />
        </Grid>
      </Grid>
    </div>
  );
}

FileComparisonPage.propTypes = {
  className: PropTypes.string,
};

export default FileComparisonPage;

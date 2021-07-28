import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import MotherFile from "./MotherFile/MotherFile";
import MatchFiles from "./MatchFiles/MatchFiles";
import { useHistory, useParams } from "react-router-dom";
import { routes } from "../../../routing/routes";
import useFile from "../../../application/api/files/useFile";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.dimensions.content.padding * 2,
  },
}));

function FileComparisonPage(props) {
  const { className } = props;
  const classes = useStyles();
  const history = useHistory();
  const { id: rawId, matchFileId } = useParams();
  const id = Number(rawId);
  const { file: motherFile } = useFile(id);

  useEffect(() => {
    if (motherFile?.external) {
      history.push(routes.collection.fileMatchesURL(id));
    }
  }, [motherFile]);

  const handleMatchFileChange = useCallback(
    (newMatchFileId) =>
      history.push(routes.collection.fileComparisonURL(id, newMatchFileId)),
    [id]
  );

  const handleBack = useCallback(
    () => history.push(routes.collection.fileMatchesURL(id)),
    [id]
  );

  return (
    <div className={clsx(classes.root, className)}>
      <Grid container spacing={0}>
        <Grid item xs={12} lg={6}>
          <MotherFile motherFileId={id} onBack={handleBack} />
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

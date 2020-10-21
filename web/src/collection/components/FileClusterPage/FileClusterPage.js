import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileActionHeader from "../FileActionsHeader";
import FileSummaryHeader from "../FileSummaryHeader";
import { useParams } from "react-router-dom";
import useFile from "../../hooks/useFile";
import FileLoadingHeader from "../FileLoadingHeader";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../../state/selectors";
import { updateFileMatchFilters } from "../../state/actions";
import MatchGraph from "../MatchGraph";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
    minWidth: theme.dimensions.collectionPage.width,
  },
  summaryHeader: {
    margin: theme.spacing(2),
  },
  graph: {
    margin: theme.spacing(4),
  },
}));

function FileClusterPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id } = useParams();
  const { file, error, loadFile } = useFile(id);
  const matchesState = useSelector(selectFileMatches);
  const matches = matchesState.matches;
  const files = matchesState.files;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateFileMatchFilters(id, { hops: 2 }));
  }, [id]);

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id} />
        <FileLoadingHeader
          error={error}
          onRetry={loadFile}
          className={classes.summaryHeader}
        />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader id={id} matches={file.matchesCount} />
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      <MatchGraph
        source={file}
        matches={matches}
        files={files}
        className={classes.graph}
      />
    </div>
  );
}

FileClusterPage.propTypes = {
  className: PropTypes.string,
};

export default FileClusterPage;

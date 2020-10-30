import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import MotherFile from "./MotherFile/MotherFile";
import MatchFiles from "./MatchFiles/MatchFiles";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.dimensions.content.padding * 2,
  },
}));

function FileComparisonPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id: rawId } = useParams();
  const id = Number(rawId);

  return (
    <div className={clsx(classes.root, className)}>
      <Grid container spacing={0}>
        <Grid item xs={12} lg={6}>
          <MotherFile motherFileId={id} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <MatchFiles motherFileId={id} />
        </Grid>
      </Grid>
    </div>
  );
}

FileComparisonPage.propTypes = {
  className: PropTypes.string,
};

export default FileComparisonPage;

import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import FileMatchesActions from "./FileMatchesActions";
import {
  randomFile,
  randomMatches,
} from "../../../server-api/MockServer/fake-data/files";
import FileActionHeader from "../FileActionsHeader";
import FileSummaryHeader from "../FileSummaryHeader";
import SectionSeparator from "./SectionSeparator";
import { useIntl } from "react-intl";
import Grid from "@material-ui/core/Grid";
import MatchPreview from "./MatchPreview";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
  },
  summaryHeader: {
    margin: theme.spacing(2),
  },
  separator: {
    marginTop: theme.spacing(4),
  },
  matches: {
    margin: theme.spacing(2),
  },
}));

const file = randomFile();
file.matches = [...randomMatches(3)];

/**
 * Get i18n text
 */
function useMessages(file) {
  const intl = useIntl();
  const matches = String(file.matches.length).padStart(2, "0");
  return {
    matched: intl.formatMessage({ id: "file.matched" }, { count: matches }),
  };
}

function FileMatchesPage(props) {
  const { className } = props;
  const classes = useStyles();
  const messages = useMessages(file);
  const [view, setView] = useState(View.grid);
  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader file={file}>
        <FileMatchesActions
          view={view}
          onViewChange={setView}
          onCompare={() => console.log("compare")}
        />
      </FileActionHeader>
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      <SectionSeparator
        title={messages.matched}
        className={classes.separator}
      />
      <div className={classes.matches}>
        <Grid container spacing={4}>
          {file.matches.map((match) => (
            <Grid item xs={6} lg={3}>
              <MatchPreview match={match} />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

FileMatchesPage.propTypes = {
  className: PropTypes.string,
};

export default FileMatchesPage;

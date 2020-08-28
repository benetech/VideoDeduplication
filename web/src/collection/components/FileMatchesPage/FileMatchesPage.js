import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import FileMatchesActions from "./FileMatchesActions";
import {
  randomFile,
  randomFiles,
} from "../../../server-api/MockServer/fake-data/files";
import FileActionHeader from "../FileActionsHeader";
import FileSummaryHeader from "../FileSummaryHeader";
import SectionSeparator from "./SectionSeparator";
import { useIntl } from "react-intl";

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
}));

const file = randomFile();
file.matches = [...randomFiles(4)];

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
    </div>
  );
}

FileMatchesPage.propTypes = {
  className: PropTypes.string,
};

export default FileMatchesPage;

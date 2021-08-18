import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../../../prop-types/TaskType";
import MatchedTemplate from "./MatchedTemplate";
import useTemplateIndex from "../../../../../application/api/templates/useTemplateIndex";
import useFilesColl from "../../../../../application/api/files/useFilesColl";
import { useShowCollection } from "../../../../../routing/hooks";

const useStyles = makeStyles((theme) => ({
  match: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
}));

function MatchTemplatesResultsOverview(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const fileCounts = task?.result?.fileCounts || [];
  const templates = useTemplateIndex();
  const collection = useFilesColl();
  const showCollection = useShowCollection();

  const showMatches = useCallback((template) => {
    collection.updateParams({ templates: [template?.id] });
    showCollection();
  });

  return (
    <div className={clsx(className)} {...other}>
      {fileCounts.map((entry) => (
        <MatchedTemplate
          key={entry.templateId}
          template={templates.get(entry.templateId)}
          fileCount={entry.fileCount}
          onClick={showMatches}
          className={classes.match}
        />
      ))}
    </div>
  );
}

MatchTemplatesResultsOverview.propTypes = {
  /**
   * ProcessOnlineVideo task which results will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default MatchTemplatesResultsOverview;

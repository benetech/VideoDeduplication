import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { MatchTemplatesRequest, Task } from "../../../../../model/Task";
import MatchedTemplate from "./MatchedTemplate";
import useTemplateIndex from "../../../../../application/api/templates/useTemplateIndex";
import useFilesColl from "../../../../../application/api/files/useFilesColl";
import { useShowCollection } from "../../../../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  match: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
}));

function MatchTemplatesResultsOverview(
  props: MatchTemplatesResultsOverviewProps
): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const fileCounts = task?.result?.fileCounts || [];
  const templates = useTemplateIndex();
  const collection = useFilesColl();
  const showCollection = useShowCollection();
  const showMatches = useCallback((template) => {
    collection.updateParams({
      templates: [template?.id],
    });
    showCollection();
  }, []);
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

type MatchTemplatesResultsOverviewProps = {
  /**
   * ProcessOnlineVideo task which results will be displayed.
   */
  task: Task<MatchTemplatesRequest>;
  className?: string;
};
export default MatchTemplatesResultsOverview;

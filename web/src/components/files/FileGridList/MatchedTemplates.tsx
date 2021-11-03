import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import useTemplateIndex from "../../../application/api/templates/useTemplateIndex";
import { Template } from "../../../model/Template";
import TemplateIconViewer from "../../templates/TemplateIcon/TemplateIconViewer";

const useStyles = makeStyles<Theme>((theme) => ({
  matchedTemplates: {},
  icon: {
    display: "inline-block",
    width: 20,
    height: 20,
    fontSize: 20,
    margin: theme.spacing(0.2),
  },
}));

type MatchedTemplatesProps = {
  file: VideoFile;
  className?: string;
};

function useTemplates(templateIds?: Template["id"][]): Template[] {
  const templateIndex = useTemplateIndex();
  if (templateIds == null) {
    return [];
  }
  const result: Template[] = [];
  for (const id of templateIds) {
    if (templateIndex.has(id)) {
      result.push(templateIndex.get(id) as Template);
    }
  }
  return result;
}

function MatchedTemplates(props: MatchedTemplatesProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const templates = useTemplates(file.matchedTemplateIds);
  return (
    <div className={clsx(classes.matchedTemplates, className)} {...other}>
      {templates.slice(0, 3).map((template) => (
        <TemplateIconViewer
          icon={template.icon}
          key={template.id}
          className={classes.icon}
        />
      ))}
    </div>
  );
}

export default MatchedTemplates;

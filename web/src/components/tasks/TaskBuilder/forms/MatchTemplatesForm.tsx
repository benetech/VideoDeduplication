import React, { useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { MatchTemplatesRequest } from "../../../../model/Task";
import { useIntl } from "react-intl";
import Description from "../../../forms/Description";
import { TaskBuilderProps } from "../model";

const useStyles = makeStyles<Theme>((theme) => ({
  description: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "task.type.templates.description",
    }),
  };
}

export default function MatchTemplatesForm(
  props: TaskBuilderProps<MatchTemplatesRequest>
): JSX.Element {
  const { onValidated, className } = props;
  const messages = useMessages();
  const classes = useStyles(); // Initialize state

  useEffect(() => onValidated(true), []);

  return (
    <div className={clsx(className)}>
      <Description
        className={classes.description}
        text={messages.description}
      />
    </div>
  );
}

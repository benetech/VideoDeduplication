import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormControlLabel, FormGroup, Switch, Theme } from "@material-ui/core";
import { TaskBuilderProps } from "../model";
import { PrepareSemanticSearchRequest } from "../../../../model/Task";
import { useIntl } from "react-intl";
import Description from "../../../forms/Description";
import InputContainer from "../../../forms/InputContainer";

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
      id: "task.type.prepareSemanticSearch.description",
    }),
    force: intl.formatMessage({ id: "task.attr.forcePrepareSemantic" }),
    forceHelp: intl.formatMessage({
      id: "task.attr.forcePrepareSemantic.help",
    }),
  };
}

export default function PrepareSemanticSearch(
  props: TaskBuilderProps<PrepareSemanticSearchRequest>
): JSX.Element {
  const { request, onChange, onValidated, className } = props;
  const classes = useStyles();
  const messages = useMessages();

  useEffect(() => onValidated(true), []);

  const handleForceChange = useCallback(
    (event) => {
      onChange({
        ...request,
        force: !!event.target.checked,
      });
    },
    [onChange, request]
  );

  return (
    <div className={className}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer title={messages.force} tooltip={messages.forceHelp}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch checked={request.force} onChange={handleForceChange} />
            }
            label={messages.force}
          />
        </FormGroup>
      </InputContainer>
    </div>
  );
}

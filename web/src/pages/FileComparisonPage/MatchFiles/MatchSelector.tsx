import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import NavigateNextOutlinedIcon from "@material-ui/icons/NavigateNextOutlined";
import NavigateBeforeOutlinedIcon from "@material-ui/icons/NavigateBeforeOutlined";
import { basename } from "../../../lib/helpers/paths";
import { FileMatch } from "../../../model/Match";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  formControl: {
    width: 300,
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  index: { ...theme.mixins.text, marginRight: theme.spacing(2) },
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    label: intl.formatMessage({
      id: "file.match",
    }),
    nextLabel: intl.formatMessage({
      id: "aria.label.nextMatch",
    }),
    prevLabel: intl.formatMessage({
      id: "aria.label.prevMatch",
    }),
  };
}

function MatchSelector(props: MatchSelectorProps): JSX.Element {
  const { matches, onChange, selected, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("label");
  const handleSelect = useCallback(
    (event) => onChange(event.target.value),
    [onChange]
  );
  const handleNext = useCallback(
    () => onChange(Math.min(matches.length - 1, selected + 1)),
    [matches, selected]
  );
  const handlePrev = useCallback(
    () => onChange(Math.max(0, selected - 1)),
    [matches, selected]
  );
  const showSelected = matches.length > 0 && selected >= 0;
  return (
    <div
      className={clsx(classes.root, className)}
      data-selector="MatchSelector"
    >
      {showSelected && (
        <div className={classes.index}>
          {selected + 1} of {matches.length}
        </div>
      )}
      <FormControl
        variant="outlined"
        className={classes.formControl}
        size="small"
      >
        <InputLabel id={labelId}>{messages.label}</InputLabel>
        <Select
          labelId={labelId}
          value={showSelected ? selected : ""}
          onChange={handleSelect}
          label={messages.label}
          disabled={matches.length === 0}
          data-selector="MatchSelectorMenu"
        >
          {matches.map((match, index) => (
            <MenuItem
              value={index}
              key={index}
              data-selector="MatchSelectorMenuItem"
              data-file-id={match?.file?.id}
            >
              {basename(match.file.filename)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ButtonGroup>
        <SquaredIconButton
          variant="outlined"
          disabled={selected <= 0}
          className={classes.button}
          aria-label={messages.prevLabel}
          onClick={handlePrev}
          data-selector="PrevMatchButton"
        >
          <NavigateBeforeOutlinedIcon />
        </SquaredIconButton>
        <SquaredIconButton
          variant="outlined"
          disabled={selected >= matches.length - 1}
          className={classes.button}
          aria-label={messages.nextLabel}
          onClick={handleNext}
          data-selector="NextMatchButton"
        >
          <NavigateNextOutlinedIcon />
        </SquaredIconButton>
      </ButtonGroup>
    </div>
  );
}

type MatchSelectorProps = {
  /**
   * Selected match index.
   */
  selected: number;

  /**
   * Handle selection change.
   */
  onChange: (selected: number) => void;

  /**
   * Single file matches.
   */
  matches: FileMatch[];
  className?: string;
};
export default MatchSelector;

import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../../prop-types/FileType";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useIntl } from "react-intl";
import useUniqueId from "../../../../common/hooks/useUniqueId";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import NavigateNextOutlinedIcon from "@material-ui/icons/NavigateNextOutlined";
import NavigateBeforeOutlinedIcon from "@material-ui/icons/NavigateBeforeOutlined";
import { basename } from "../../../../common/helpers/paths";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  formControl: {
    width: 300,
    marginLeft: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  index: {
    ...theme.mixins.text,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    label: intl.formatMessage({ id: "file.match" }),
    nextLabel: intl.formatMessage({ id: "aria.label.nextMatch" }),
    prevLabel: intl.formatMessage({ id: "aria.label.prevMatch" }),
  };
}

function MatchSelector(props) {
  const { matches, onChange, selected, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("label");

  const handleSelect = useCallback((event) => onChange(event.target.value), [
    onChange,
  ]);

  const handleNext = useCallback(
    () => onChange(Math.min(matches.length - 1, selected + 1)),
    [matches, selected]
  );

  const handlePrev = useCallback(() => onChange(Math.max(0, selected - 1)), [
    matches,
    selected,
  ]);

  const showSelected = matches.length > 0 && selected >= 0;

  return (
    <div className={clsx(classes.root, className)}>
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
        >
          {matches.map((match, index) => (
            <MenuItem value={index} key={index}>
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
        >
          <NavigateBeforeOutlinedIcon />
        </SquaredIconButton>
        <SquaredIconButton
          variant="outlined"
          disabled={selected >= matches.length - 1}
          className={classes.button}
          aria-label={messages.nextLabel}
          onClick={handleNext}
        >
          <NavigateNextOutlinedIcon />
        </SquaredIconButton>
      </ButtonGroup>
    </div>
  );
}

MatchSelector.propTypes = {
  /**
   * Selected match index.
   */
  selected: PropTypes.number.isRequired,
  /**
   * Handle selection change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Single file matches.
   */
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      distance: PropTypes.number.isRequired,
      file: FileType.isRequired,
    })
  ),
  className: PropTypes.string,
};

export default MatchSelector;

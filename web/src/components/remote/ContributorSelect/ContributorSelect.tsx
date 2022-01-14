import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Checkbox,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import FormControl from "@material-ui/core/FormControl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { Contributor } from "../../../model/VideoFile";
import useContributorsAll from "../../../application/api/repositories/useContributorsAll";

const useStyles = makeStyles<Theme>((theme) => ({
  form: {
    width: "100%",
  },
  icon: {
    width: 25,
    height: 25,
    fontSize: 25,
    marginRight: theme.spacing(2),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    labelPartners: intl.formatMessage({
      id: "repos.attr.partners",
    }),
  };
}

/**
 * Get contributor text description.
 * @param contributor
 */
function description(contributor: Contributor): string {
  return `${contributor.repository.name}/${contributor.name}`;
}

type ContributorSelectProps = {
  selected: Contributor["id"][];
  onSelectedChange: (selected: Contributor["id"][]) => void;
  disabled?: boolean;
  className?: string;
};

export default function ContributorSelect(
  props: ContributorSelectProps
): JSX.Element {
  const { selected, onSelectedChange, disabled = false, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("template-label-");
  const { contributors } = useContributorsAll();
  const handleChange = useCallback(
    (event) => onSelectedChange(event.target.value),
    [onSelectedChange]
  );
  const renderValue = useCallback(
    (selected) => {
      const selectedContributors = contributors.filter(
        (contributor) => selected.indexOf(contributor.id) > -1
      );
      return selectedContributors.map(description).join(", ");
    },
    [contributors]
  );
  return (
    <FormControl className={clsx(classes.form, className)}>
      <InputLabel id={labelId}>{messages.labelPartners}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={selected}
        onChange={handleChange}
        input={<Input />}
        renderValue={renderValue}
        disabled={disabled || contributors.length === 0}
      >
        {contributors.map((contributor) => (
          <MenuItem key={contributor.id} value={contributor.id}>
            <Checkbox checked={selected.indexOf(contributor.id) > -1} />
            <ListItemText primary={description(contributor)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

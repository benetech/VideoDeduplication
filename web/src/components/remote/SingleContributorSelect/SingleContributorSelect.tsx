import React, { useCallback } from "react";
import { InputLabel, ListItemText, MenuItem, Select } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { Contributor } from "../../../model/VideoFile";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { useIntl } from "react-intl";
import { Nullable } from "../../../lib/types/util-types";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    partner: intl.formatMessage({ id: "task.attr.matchPartner" }),
    partnerHelp: intl.formatMessage({ id: "task.attr.matchPartner.help" }),
    all: intl.formatMessage({ id: "all" }),
  };
}

type SingleContributorSelectProps = {
  contributors: Contributor[];
  selected: Nullable<Contributor>;
  onSelect: (contributor: Nullable<Contributor>) => void;
  disabled?: boolean;
  className?: string;
};

export default function SingleContributorSelect(
  props: SingleContributorSelectProps
): JSX.Element {
  const { contributors, selected, onSelect, disabled, className } = props;
  const messages = useMessages();
  const partnerLabelId = useUniqueId("partner-label-");

  const handlePartnerChange = useCallback(
    (event) => {
      const selectedName = event.target.value;
      onSelect(
        contributors.find((contributor) => contributor.name === selectedName)
      );
    },
    [onSelect, contributors]
  );

  return (
    <FormControl fullWidth variant="outlined" className={className}>
      <InputLabel id={partnerLabelId}>{messages.partner}</InputLabel>
      <Select
        labelId={partnerLabelId}
        value={selected?.name || messages.all}
        onChange={handlePartnerChange}
        disabled={disabled || contributors.length === 0}
        renderValue={(value) => value as string}
        labelWidth={60}
      >
        <MenuItem value={messages.all}>
          <ListItemText primary={messages.all} />
        </MenuItem>
        {contributors.map((contributor) => (
          <MenuItem key={contributor.id} value={contributor.name}>
            <ListItemText primary={contributor.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

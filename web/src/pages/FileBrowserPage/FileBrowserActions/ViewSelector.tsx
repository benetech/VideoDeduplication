import React from "react";
import ListIcon from "@material-ui/icons/ViewStream";
import GridIcon from "@material-ui/icons/ViewModule";
import { useIntl } from "react-intl";
import IconSelect from "../../../components/basic/IconSelect";
import ListType from "../../../model/ListType";
import IconSelectOption from "../../../components/basic/IconSelect/IconSelectOption";

function useMessages() {
  const intl = useIntl();
  return {
    useList: intl.formatMessage({
      id: "actions.useListView",
    }),
    useGrid: intl.formatMessage({
      id: "actions.useGridView",
    }),
  };
}

function ViewSelector(props: ViewSelectorProps): JSX.Element {
  const { view, onChange, className } = props;
  const messages = useMessages();
  return (
    <IconSelect value={view} onChange={onChange} className={className}>
      <IconSelectOption
        value={ListType.linear}
        icon={ListIcon}
        tooltip={messages.useList}
        data-selector="ToggleListView"
      />
      <IconSelectOption
        value={ListType.grid}
        icon={GridIcon}
        tooltip={messages.useGrid}
        data-selector="ToggleGridView"
      />
    </IconSelect>
  );
}

type ViewSelectorProps = {
  view?: ListType;
  onChange?: (...args: any[]) => void;
  className?: string;
};
export default ViewSelector;

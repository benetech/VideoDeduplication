import React from "react";
import PropTypes from "prop-types";
import ListIcon from "@material-ui/icons/ViewStream";
import GridIcon from "@material-ui/icons/ViewModule";
import { useIntl } from "react-intl";
import IconSelect from "../../../../common/components/IconSelect";
import FileListType from "../../../state/fileList/FileListType";

function useMessages() {
  const intl = useIntl();
  return {
    useList: intl.formatMessage({ id: "actions.useListView" }),
    useGrid: intl.formatMessage({ id: "actions.useGridView" }),
  };
}

function ViewSelector(props) {
  const { view, onChange, className } = props;
  const messages = useMessages();

  return (
    <IconSelect value={view} onChange={onChange} className={className}>
      <IconSelect.Option
        value={FileListType.linear}
        icon={ListIcon}
        tooltip={messages.useList}
      />
      <IconSelect.Option
        value={FileListType.grid}
        icon={GridIcon}
        tooltip={messages.useGrid}
      />
    </IconSelect>
  );
}

ViewSelector.propTypes = {
  view: PropTypes.oneOf([FileListType.linear, FileListType.grid]),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default ViewSelector;

import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FilterPaneHeader from "./FilterPaneHeader";
import SelectableTabs, {
  SelectableTab,
} from "../../../../common/components/SelectableTabs";
import { useIntl } from "react-intl";
import ContentFilters from "./ContentFilters";
import MetadataFilters from "./MetadataFilters";
import Presets from "./Presets";

const useStyles = makeStyles((theme) => ({
  pane: {
    backgroundColor: theme.palette.background.paper,
    minWidth: 270,
  },
  filters: {
    position: "sticky",
    top: 0,
  },
  tabs: {
    margin: theme.spacing(2),
  },
  tabContent: {
    maxHeight: "calc(100vh - 150px)",
    overflowY: "auto",
  },
}));

/**
 * Identifiers for filter tabs
 */
const Tab = {
  content: "content",
  metadata: "metadata",
  presets: "presets",
};

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    content: intl.formatMessage({ id: "filter.content" }),
    metadata: intl.formatMessage({ id: "filter.metadata" }),
    presets: intl.formatMessage({ id: "filter.presets" }),
  };
}

/**
 * Get tab component type
 */
function getTabComponent(tab) {
  switch (tab) {
    case Tab.content:
      return ContentFilters;
    case Tab.metadata:
      return MetadataFilters;
    case Tab.presets:
      return Presets;
    default:
      throw new Error(`Unsupported tab: ${tab}`);
  }
}

/**
 * Get total count of active filters managed by filter pane.
 */
function useActiveFilters() {
  return ContentFilters.useActiveFilters() + MetadataFilters.useActiveFilters();
}

function FilterPane(props) {
  const { onSave, onClose, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(Tab.content);
  const contentFilters = ContentFilters.useActiveFilters();
  const metadataFilters = MetadataFilters.useActiveFilters();

  const TabComponent = getTabComponent(tab);

  return (
    <div className={clsx(classes.pane, className)} {...other}>
      <div className={classes.filters}>
        <FilterPaneHeader onClose={onClose} onSave={onSave} autoFocus={true} />
        <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
          <SelectableTab
            label={messages.content}
            value={Tab.content}
            badge={contentFilters}
            badgeColor="primary"
          />
          <SelectableTab
            label={messages.metadata}
            value={Tab.metadata}
            badge={metadataFilters}
            badgeColor="primary"
          />
          <SelectableTab label={messages.presets} value={Tab.presets} />
        </SelectableTabs>
        <TabComponent className={classes.tabContent} />
      </div>
    </div>
  );
}

/**
 * Hook to get total count of active filters managed by filter pane.
 */
FilterPane.useActiveFilters = useActiveFilters;

FilterPane.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  className: PropTypes.string,
};

export default FilterPane;

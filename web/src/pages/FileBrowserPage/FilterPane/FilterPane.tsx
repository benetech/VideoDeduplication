import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FilterPaneHeader from "./FilterPaneHeader";
import SelectableTabs, {
  SelectableTab,
} from "../../../components/basic/SelectableTabs";
import { useIntl } from "react-intl";
import ContentFilters from "./ContentFilters";
import MetadataFilters from "./MetadataFilters";
import Presets from "./Presets";
import SwitchComponent from "../../../components/basic/SwitchComponent/SwitchComponent";
import Case from "../../../components/basic/SwitchComponent/Case";

const useStyles = makeStyles<Theme>((theme) => ({
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
    content: intl.formatMessage({
      id: "filter.content",
    }),
    metadata: intl.formatMessage({
      id: "filter.metadata",
    }),
    presets: intl.formatMessage({
      id: "filter.presets",
    }),
    label: intl.formatMessage({
      id: "aria.label.filterPane",
    }),
  };
}
/**
 * Get total count of active filters managed by filter pane.
 */

function useActiveFilters() {
  return ContentFilters.useActiveFilters() + MetadataFilters.useActiveFilters();
}

function FilterPane(props: FilterPaneProps): JSX.Element {
  const { onClose = () => null, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(Tab.content);
  const contentFilters = ContentFilters.useActiveFilters();
  const metadataFilters = MetadataFilters.useActiveFilters();
  return (
    <div
      className={clsx(classes.pane, className)}
      aria-label={messages.label}
      {...other}
    >
      <div className={classes.filters}>
        <FilterPaneHeader onClose={onClose} autoFocus={true} />
        <SelectableTabs
          value={tab}
          onChange={setTab}
          className={classes.tabs}
          spacing={0.5}
        >
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
        <SwitchComponent value={tab}>
          <Case match={Tab.content}>
            <ContentFilters className={classes.tabContent} />
          </Case>
          <Case match={Tab.metadata}>
            <MetadataFilters className={classes.tabContent} />
          </Case>
          <Case match={Tab.presets}>
            <Presets className={classes.tabContent} />
          </Case>
        </SwitchComponent>
      </div>
    </div>
  );
}
/**
 * Hook to get total count of active filters managed by filter pane.
 */

FilterPane.useActiveFilters = useActiveFilters;
type FilterPaneProps = {
  onClose?: () => void;
  className?: string;
};
export default FilterPane;

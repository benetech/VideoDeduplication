import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ObjectGroupList from "./ObjectGroupList";
import { groupObjects } from "../groupObjects";
import ObjectGroupListItem from "./ObjectGroupListItem";
import position from "../objectPosition";
import { TemplateMatch } from "../../../model/Template";
import SelectableTabs, {
  SelectableTab,
} from "../../../components/basic/SelectableTabs";
import SwitchComponent from "../../../components/basic/SwitchComponent/SwitchComponent";
import Case from "../../../components/basic/SwitchComponent/Case";
import { VideoFile } from "../../../model/VideoFile";
import TemplateBlackList from "./TemplateBlackList";
import { useIntl } from "react-intl";
import useUpdateObject from "../../../application/api/objects/useUpdateObject";

const useStyles = makeStyles<Theme>((theme) => ({
  objectPane: {
    height: 574,
    overflow: "auto",
  },
  loading: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    margin: theme.spacing(3),
  },
  blackList: {
    margin: theme.spacing(3),
  },
}));
/**
 * Object panel tabs.
 */

const Tab = {
  found: "found",
  blackList: "blackList",
  falsePositive: "falsePositive",
};
const second = 1000; // in millis

/**
 * Get translated text
 */

function useMessages() {
  const intl = useIntl();
  return {
    found: intl.formatMessage({
      id: "objects.found",
    }),
    blackList: intl.formatMessage({
      id: "objects.templateBlackList",
    }),
    falsePositive: intl.formatMessage({
      id: "objects.falsePositive",
    }),
  };
}

type UseGroupsResults = {
  objects: TemplateMatch[];
  groups: TemplateMatch[][];
  falsePositive: TemplateMatch[];
  falseGroups: TemplateMatch[][];
};

/**
 * Split objects into groups.
 */
function useGroups(objectsProp: TemplateMatch[]): UseGroupsResults {
  const objects = useMemo(
    () => objectsProp.filter((object) => !object.falsePositive),
    [objectsProp]
  );
  const groups = useMemo(() => groupObjects(objects, 10 * second), [objects]);
  const falsePositive = useMemo(
    () => objectsProp.filter((object) => object.falsePositive),
    [objectsProp]
  );
  const falseGroups = useMemo(
    () => groupObjects(falsePositive, 10 * second),
    [falsePositive]
  );
  return {
    objects,
    groups,
    falsePositive,
    falseGroups,
  };
}

function ObjectsPanel(props: ObjectsPanelProps): JSX.Element {
  const { file, objects: objectsProp, onSelect, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const updateObject = useUpdateObject();
  const [tab, setTab] = useState(Tab.found);
  const handleDelete = useCallback(
    async (object) => {
      try {
        await updateObject({ ...object, falsePositive: true });
      } catch (error) {
        console.error("Error deleting object", error, {
          error,
        });
      }
    },
    [updateObject]
  );
  const handleRestore = useCallback(
    async (object) => {
      try {
        await updateObject({ ...object, falsePositive: false });
      } catch (error) {
        console.error("Error restoring object", error, {
          error,
        });
      }
    },
    [updateObject]
  );
  const { objects, groups, falsePositive, falseGroups } =
    useGroups(objectsProp);
  useEffect(() => {
    if (objects.length !== 0 && tab !== Tab.found) {
      setTab(Tab.found);
    }
  }, [objectsProp.length]);
  useEffect(() => {
    if (objects.length === 0 && tab === Tab.found) {
      setTab(Tab.blackList);
    }
  }, [objects.length]);
  useEffect(() => {
    if (falsePositive.length === 0 && tab === Tab.falsePositive) {
      setTab(objects.length > 0 ? Tab.found : Tab.blackList);
    }
  }, [falsePositive.length]);
  return (
    <div className={clsx(classes.objectPane, className)} {...other}>
      <div className={classes.header}>
        <SelectableTabs value={tab} onChange={setTab} size="small">
          {objects.length > 0 && (
            <SelectableTab label={messages.found} value={Tab.found} />
          )}
          <SelectableTab label={messages.blackList} value={Tab.blackList} />
          {falsePositive.length > 0 && (
            <SelectableTab
              label={messages.falsePositive}
              value={Tab.falsePositive}
            />
          )}
        </SelectableTabs>
      </div>
      <SwitchComponent value={tab}>
        <Case match={Tab.found}>
          <ObjectGroupList>
            {groups.map((group) => (
              <ObjectGroupListItem
                objects={group}
                key={position(group[0])}
                onSelect={onSelect}
                onDelete={handleDelete}
              />
            ))}
          </ObjectGroupList>
        </Case>
        <Case match={Tab.blackList}>
          <TemplateBlackList file={file} className={classes.blackList} />
        </Case>
        <Case match={Tab.falsePositive}>
          <ObjectGroupList>
            {falseGroups.map((group) => (
              <ObjectGroupListItem
                objects={group}
                key={position(group[0])}
                onSelect={onSelect}
                onDelete={handleRestore}
              />
            ))}
          </ObjectGroupList>
        </Case>
      </SwitchComponent>
    </div>
  );
}

type ObjectsPanelProps = Omit<React.HTMLProps<HTMLDivElement>, "onSelect"> & {
  /**
   * File owning the objects.
   */
  file: VideoFile;

  /**
   * Objects recognized in video file.
   */
  objects: TemplateMatch[];

  /**
   * Jump to a particular object
   */
  onSelect: (object: TemplateMatch) => void;
};
export default ObjectsPanel;

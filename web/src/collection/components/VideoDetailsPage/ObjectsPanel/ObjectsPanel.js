import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectGroupList from "./ObjectGroupList";
import { groupObjects } from "../groupObjects";
import ObjectGroupListItem from "./ObjectGroupListItem";
import position from "../objectPosition";
import ObjectType from "../../../../application/objects/prop-types/ObjectType";
import SelectableTabs, {
  SelectableTab,
} from "../../../../common/components/SelectableTabs";
import SwitchComponent from "../../../../common/components/SwitchComponent/SwitchComponent";
import Case from "../../../../common/components/SwitchComponent/Case";
import FileType from "../../../prop-types/FileType";
import TemplateBlackList from "./TemplateBlackList";
import { useIntl } from "react-intl";
import ObjectAPI from "../../../../application/objects/ObjectAPI";

const useStyles = makeStyles((theme) => ({
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
    found: intl.formatMessage({ id: "objects.found" }),
    blackList: intl.formatMessage({ id: "objects.templateBlackList" }),
    falsePositive: intl.formatMessage({ id: "objects.falsePositive" }),
  };
}

/**
 * Split objects into groups.
 */
function useGroups(objectsProp) {
  const objects = useMemo(
    () => objectsProp.filter((object) => !object.falsePositive),
    [objectsProp]
  );
  const groups = useMemo(() => groupObjects(objects, 10 * second), [objects]);

  const falsePositive = useMemo(
    () => objectsProp.filter((object) => object.falsePositive),
    [objectsProp]
  );
  const falseGroups = useMemo(() => groupObjects(falsePositive, 10 * second), [
    falsePositive,
  ]);

  return { objects, groups, falsePositive, falseGroups };
}

function ObjectsPanel(props) {
  const { file, objects: objectsProp, onJump, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const objectsAPI = ObjectAPI.use();
  const [tab, setTab] = useState(Tab.found);

  const handleDelete = useCallback(
    async (object) => {
      const updates = { ...object, falsePositive: true };
      try {
        await objectsAPI.updateObject(updates, object);
      } catch (error) {
        console.error("Error occurred while deleting object", error, { error });
      }
    },
    [objectsAPI]
  );

  const handleRestore = useCallback(
    async (object) => {
      const updates = { ...object, falsePositive: false };
      try {
        await objectsAPI.updateObject(updates, object);
      } catch (error) {
        console.error("Error occurred while restoring object", error, {
          error,
        });
      }
    },
    [objectsAPI]
  );

  const { objects, groups, falsePositive, falseGroups } = useGroups(
    objectsProp
  );

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
                onJump={onJump}
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
                onJump={onJump}
                onDelete={handleRestore}
              />
            ))}
          </ObjectGroupList>
        </Case>
      </SwitchComponent>
    </div>
  );
}

ObjectsPanel.propTypes = {
  /**
   * File owning the objects.
   */
  file: FileType.isRequired,
  /**
   * Objects recognized in video file.
   */
  objects: PropTypes.arrayOf(ObjectType).isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectsPanel;

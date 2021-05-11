import React, { useEffect, useMemo, useState } from "react";
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
};

const second = 1000; // in millis

function ObjectsPanel(props) {
  const { file, objects, onJump, className, ...other } = props;
  const classes = useStyles();
  const [tab, setTab] = useState(Tab.blackList);

  useEffect(() => {
    if (objects.length !== 0 && tab === Tab.blackList) {
      setTab(Tab.found);
    }
  }, [objects.length]);

  const groups = useMemo(() => groupObjects(objects, 10 * second), [objects]);

  return (
    <div className={clsx(classes.objectPane, className)} {...other}>
      <div className={classes.header}>
        <SelectableTabs value={tab} onChange={setTab} size="small">
          {objects.length > 0 && (
            <SelectableTab label="Found" value={Tab.found} />
          )}
          <SelectableTab label="Black List" value={Tab.blackList} />
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
              />
            ))}
          </ObjectGroupList>
        </Case>
        <Case match={Tab.blackList}>
          <TemplateBlackList file={file} className={classes.blackList} />
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

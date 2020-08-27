import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import { useIntl } from "react-intl";
import FileMatchesActions from "./FileMatchesActions";
import SelectableTabs from "../../../common/components/SelectableTabs/SelectableTabs";
import SelectableTab from "../../../common/components/SelectableTabs/SelectableTab";
import {
  randomFile,
  randomFiles,
} from "../../../server-api/MockServer/fake-data/files";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import FileNavigationTabs from "../FileNavigationTabs";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
  },
  actionsHeader: {
    display: "flex",
    alignItems: "center",
  },
  navTabs: {
    flexGrow: 1,
  },
  actions: {
    flexGrow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
}));

/**
 * Get navigation handler
 */
function useNavigation(file) {
  const history = useHistory();
  return (tab) => {
    if (tab === 0) {
      history.push(routes.collection.fileURL(file.id));
    } else if (tab === 1) {
      history.push(routes.collection.fileMatchesURL(file.id));
    }
  };
}

const file = randomFile();
file.matches = [...randomFiles(4)];

function FileMatchesPage(props) {
  const { className } = props;
  const classes = useStyles();
  const navigate = useNavigation(file);
  const [view, setView] = useState(View.grid);
  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.actionsHeader}>
        <FileNavigationTabs file={file} className={classes.navTabs} />
        <div className={classes.actions}>
          <FileMatchesActions
            view={view}
            onViewChange={setView}
            onCompare={() => console.log("compare")}
          />
        </div>
      </div>
    </div>
  );
}

FileMatchesPage.propTypes = {
  className: PropTypes.string,
};

export default FileMatchesPage;

import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useHistory } from "react-router-dom";
import FileSelector from "./FileSelector";
import TaskSidebar from "./TaskSidebar";
import { useIntl } from "react-intl";
import Title from "../../../common/components/Title";
import Description from "./Description";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import { IconButton } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  content: {
    display: "flex",
    alignItems: "stretch",
  },
  selector: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
  },
  description: {
    flexGrow: 1,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "processing.title" }),
  };
}

function ProcessingPage(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const history = useHistory();
  const messages = useMessages();
  const [showTasks, setShowTasks] = useState(true);

  const handleToggleTasks = useCallback(() => setShowTasks(!showTasks), [
    showTasks,
  ]);

  const Icon = showTasks ? CloseOutlinedIcon : PlaylistAddCheckOutlinedIcon;

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <Title text={messages.title}>
        <Description className={classes.description} />
        <IconButton color="inherit" onClick={handleToggleTasks}>
          <Icon color="inherit" fontSize="large" />
        </IconButton>
      </Title>
      <div className={classes.content}>
        <FileSelector className={classes.selector} />
        {showTasks && <TaskSidebar className={classes.tasks} />}
      </div>
    </div>
  );
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;

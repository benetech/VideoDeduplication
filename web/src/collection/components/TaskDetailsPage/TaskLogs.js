import React, { useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useParams } from "react-router";
import { useServer } from "../../../server-api/context";

const useStyles = makeStyles((theme) => ({
  logsContainer: {
    overflow: "auto",
    width: "100%",
    minHeight: 400,
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#272c34",
    color: theme.palette.common.white,
  },
  logs: {},
  progress: {
    marginTop: theme.spacing(2),
  },
}));

function TaskLogs(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const { id } = useParams();
  const [logs, setLogs] = useState(null);
  const server = useServer();

  useEffect(() => {
    server.fetchLogs({ id }).then((resp) => {
      setLogs(resp.data);
    });
  }, []);

  return (
    <div className={clsx(classes.logsContainer, className)} {...other}>
      {logs && <pre className={classes.logs}>{logs}</pre>}
      {logs == null && (
        <CircularProgress
          size={30}
          color="inherit"
          className={classes.progress}
        />
      )}
    </div>
  );
}

TaskLogs.propTypes = {
  className: PropTypes.string,
};

export default TaskLogs;

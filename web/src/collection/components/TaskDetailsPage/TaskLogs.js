import React, { useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useParams } from "react-router";
import { useServer } from "../../../server-api/context";

const useStyles = makeStyles(() => ({ logsContainer: {} }));

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
      {logs == null && <CircularProgress color="primary" />}
      <pre>{logs}</pre>
    </div>
  );
}

TaskLogs.propTypes = {
  className: PropTypes.string,
};

export default TaskLogs;

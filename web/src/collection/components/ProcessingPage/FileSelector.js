import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "../../../common/components/Button";
import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";
import { updateTask } from "../../state/tasks/actions";

const useStyles = makeStyles(() => ({
  selector: {
    height: 600,
    border: "4px dashed #D8D8D8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function FileSelector(props) {
  const { className } = props;
  const classes = useStyles();
  const server = useServer();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleProcess = useCallback(() => {
    setLoading(true);
    server
      .createTask({
        request: { type: "ProcessDirectory", directory: "." },
      })
      .then((response) => {
        if (response.success) {
          dispatch(updateTask(response.data));
        }
      })
      .finally(() => setLoading(false));
  });

  return (
    <div className={clsx(classes.selector, className)}>
      <Button
        color="primary"
        variant="outlined"
        onClick={handleProcess}
        disabled={loading}
      >
        Process Entire Dataset
      </Button>
    </div>
  );
}

FileSelector.propTypes = {
  /**
   * Submit a new task.
   */
  onSubmit: PropTypes.func,
  className: PropTypes.string,
};

export default FileSelector;

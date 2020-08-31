import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileExtensionPicker from "./FileExtensionPicker";
import { useDispatch, useSelector } from "react-redux";
import { selectFilters } from "../../../state/selectors";
import { updateFilters } from "../../../state";
import { useExtensions } from "./useExtensions";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

function MetadataFilters(props) {
  const { className } = props;
  const classes = useStyles();
  const filters = useSelector(selectFilters);
  const dispatch = useDispatch();
  const extensions = useExtensions();

  const handleUpdateExtensions = useCallback(
    (extensions) => dispatch(updateFilters({ extensions })),
    []
  );

  return (
    <div className={clsx(classes.root, className)}>
      <FileExtensionPicker
        selected={filters.extensions}
        onChange={handleUpdateExtensions}
        extensions={extensions}
      />
    </div>
  );
}

MetadataFilters.propTypes = {
  className: PropTypes.string,
};

export default MetadataFilters;

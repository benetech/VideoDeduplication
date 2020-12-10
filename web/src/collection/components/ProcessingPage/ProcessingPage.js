import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import ProcessingHeader from "./ProcessingHeader";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import FileSelector from "./FileSelector";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {};
}

function ProcessingPage(props) {
  const { className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();
  const history = useHistory();

  const handleClose = useCallback(
    () => history.push(routes.collection.fingerprints, { keepFilters: true }),
    []
  );

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ProcessingHeader onClose={handleClose} />
      <FileSelector />
    </div>
  );
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;

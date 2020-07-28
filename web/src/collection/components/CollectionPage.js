import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";
import { useIntl } from "react-intl";
import Dashboard from "./Dashboard";

const useStyles = makeStyles((theme) => ({
  body: {
    height: "100%",
  },
  dashboard: {
    height: "100%",
  },
}));

function CollectionPage(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      title={intl.formatMessage({ id: "collection.title" })}
      header={<CollectionNavigation />}
      className={className}
    >
      <div className={classes.body}>
        <Dashboard className={classes.dashboard} />
      </div>
    </AppPage>
  );
}

CollectionPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionPage;

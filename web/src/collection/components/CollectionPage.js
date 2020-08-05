import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";
import { useIntl } from "react-intl";
import DashboardView from "./DashboardView";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import FingerprintsView from "./Fingerprints/FingerprintsView";

const useStyles = makeStyles(() => ({
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
        <Switch>
          <Route exact path={routes.collection.home}>
            <Redirect to={routes.collection.analytics} />
          </Route>
          <Route path={routes.collection.analytics}>
            <DashboardView />
          </Route>
          <Route path={routes.collection.fingerprints}>
            <FingerprintsView />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

CollectionPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionPage;

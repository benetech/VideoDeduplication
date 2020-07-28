import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";
import { useIntl } from "react-intl";
import Dashboard from "./Dashboard";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { routes } from "../../routing/routes";

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
        <Router>
          <Switch>
            <Route exact path={routes.collection.home}>
              <Redirect to={routes.collection.analytics} />
            </Route>
            <Route path={routes.collection.analytics}>
              <Dashboard className={classes.dashboard} />
            </Route>
            <Route path={routes.collection.fingerprints}>
              <div>Hello Fingerprints</div>
            </Route>
          </Switch>
        </Router>
      </div>
    </AppPage>
  );
}

CollectionPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionPage;

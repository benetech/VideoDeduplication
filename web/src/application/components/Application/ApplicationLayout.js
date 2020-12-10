import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import AppMenu from "../AppMenu";
import CollectionRootPage from "../../../collection/components/CollectionRootPage";
import { routes } from "../../../routing/routes";
import AppPage from "../AppPage";
import { useIntl } from "react-intl";
import DashboardPage from "../../../collection/components/DashboardPage";

const useStyles = makeStyles((theme) => ({
  root: {
    width: `calc(100vw - ${theme.spacing(1)}px)`,
    height: "100vh",
    display: "flex",
    justifyContent: "center",
  },
  content: {
    minWidth: 0,
    height: "min-content",
    display: "flex",
    flexGrow: 1,
    maxWidth: theme.dimensions.application.maxWidth,
  },
  menu: {
    flexShrink: 0,
    minHeight: "100vh",
  },
  body: {
    flexGrow: 2,
    minWidth: 0,
  },
}));

/**
 * Top-level application layout: side-bar menu + body.
 */
function ApplicationLayout(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.content}>
        <Router>
          <AppMenu className={classes.menu} />
          <Switch>
            <Route exact path={routes.home}>
              <Redirect to={routes.analytics.home} />
            </Route>
            <Route path={routes.analytics.home}>
              <DashboardPage className={classes.body} />
            </Route>
            <Route path={routes.collection.home}>
              <CollectionRootPage className={classes.body} />
            </Route>
            <Route path={routes.database.home}>
              <AppPage
                title={intl.formatMessage({ id: "nav.database" })}
                className={classes.body}
              />
            </Route>
            <Route path={routes.organization.home}>
              <AppPage
                title={intl.formatMessage({ id: "nav.organization" })}
                className={classes.body}
              />
            </Route>
            <Route path={routes.collaborators.home}>
              <AppPage
                title={intl.formatMessage({ id: "nav.collaborators" })}
                className={classes.body}
              />
            </Route>
            <Route path={routes.processing.home}>
              <AppPage
                title={intl.formatMessage({ id: "nav.processing" })}
                className={classes.body}
              />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

ApplicationLayout.propTypes = {
  className: PropTypes.string,
};

export default ApplicationLayout;

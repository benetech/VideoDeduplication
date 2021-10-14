import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import clsx from "clsx";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import AppMenu from "../components/app/AppMenu";
import { routes } from "../routing/routes";
import DashboardPage from "../pages/DashboardPage";
import CollectionRootPage from "../pages/CollectionRootPage";
import AppPage from "../components/app/AppPage";
import TemplatesRootPage from "../pages/TemplatesRootPage/TemplatesRootPage";
import ProcessingRootPage from "../pages/ProcessingRootPage";
import React from "react";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    width: `calc(100vw - ${theme.dimensions.scrollbar.size}px)`,
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

type JusticeAIRootComponentProps = {
  className?: string;
};

/**
 * Top-level application layout: side-bar menu + body.
 */
export default function JusticeAIRootComponent(
  props: JusticeAIRootComponentProps
): JSX.Element {
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
            <Route path={routes.templates.home}>
              <TemplatesRootPage className={classes.body} />
            </Route>
            <Route path={routes.collaborators.home}>
              <AppPage
                title={intl.formatMessage({ id: "nav.collaborators" })}
                className={classes.body}
              />
            </Route>
            <Route path={routes.processing.home}>
              <ProcessingRootPage className={classes.body} />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

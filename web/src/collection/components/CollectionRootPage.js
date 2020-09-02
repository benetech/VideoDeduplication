import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";
import { useIntl } from "react-intl";
import DashboardPage from "./DashboardPage";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import FileBrowserPage from "./FileBrowserPage/FileBrowserPage";
import VideoDetailsPage from "./VideoDetailsPage/VideoDetailsPage";
import FileMatchesPage from "./FileMatchesPage/FileMatchesPage";

const useStyles = makeStyles(() => ({
  body: {
    height: "100%",
  },
  dashboard: {
    height: "100%",
  },
}));

function CollectionRootPage(props) {
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
            <DashboardPage />
          </Route>
          <Route exact path={routes.collection.fingerprints}>
            <FileBrowserPage />
          </Route>
          <Route exact path={routes.collection.file}>
            <VideoDetailsPage />
          </Route>
          <Route exact path={routes.collection.fileMatches}>
            <FileMatchesPage />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

CollectionRootPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionRootPage;

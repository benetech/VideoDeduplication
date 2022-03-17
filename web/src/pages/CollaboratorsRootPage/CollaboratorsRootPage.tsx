import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import AppPage from "../../components/app/AppPage";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import { useIntl } from "react-intl";
import RepositoriesPage from "../RepositoriesPage";

const useStyles = makeStyles<Theme>({
  body: {
    height: "100%",
  },
});

type CollaboratorsRootPageProps = {
  className?: string;
};

function CollaboratorsRootPage(props: CollaboratorsRootPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      className={className}
      title={intl.formatMessage({ id: "nav.collaborators" })}
      {...other}
    >
      <div className={classes.body}>
        <Switch>
          <Route exact path={routes.collaborators.home}>
            <Redirect to={routes.collaborators.repositories} />
          </Route>
          <Route path={routes.collaborators.repositories}>
            <RepositoriesPage />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

export default CollaboratorsRootPage;

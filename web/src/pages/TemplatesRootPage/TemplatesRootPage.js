import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../components/app/AppPage";
import { useIntl } from "react-intl";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import TemplatesPage from "../TemplatesPage";

const useStyles = makeStyles(() => ({
  body: {
    height: "100%",
  },
}));

function TemplatesRootPage(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      title={intl.formatMessage({ id: "nav.templates" })}
      className={className}
    >
      <div className={classes.body} role="main">
        <Switch>
          <Route exact path={routes.templates.home}>
            <TemplatesPage />
          </Route>
        </Switch>
      </div>
    </AppPage>
  );
}

TemplatesRootPage.propTypes = {
  className: PropTypes.string,
};

export default TemplatesRootPage;

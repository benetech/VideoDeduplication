import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AppPage from "../../../application/components/AppPage";
import { useIntl } from "react-intl";
import Dashboard from "./Dashboard";

const useStyles = makeStyles(() => ({
  body: {
    height: "100%",
  },
  dashboard: {
    height: "100%",
  },
}));

function DashboardPage(props) {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <AppPage
      title={intl.formatMessage({ id: "nav.dashboard" })}
      className={className}
    >
      <div className={classes.body} role="main">
        <Dashboard />
      </div>
    </AppPage>
  );
}

DashboardPage.propTypes = {
  className: PropTypes.string,
};

export default DashboardPage;

import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Label from "../../common/components/Label";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  body: {
    display: "flex",
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
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
        <Label variant="title1" color="primary">
          {intl.formatMessage({ id: "collection.dashboard.title" })}
        </Label>
        <ExpandMoreIcon />
      </div>
    </AppPage>
  );
}

CollectionPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionPage;

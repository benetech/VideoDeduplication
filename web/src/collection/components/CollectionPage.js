import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Label from "../../common/components/Label";
import AppPage from "../../application/components/AppPage";
import CollectionNavigation from "./CollectionNavigation";

const useStyles = makeStyles((theme) => ({
  body: {
    padding: theme.dimensions.content.padding,
  },
}));

function CollectionPage(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <AppPage title="My Collection" className={className}>
      <div className={classes.body}>
        <Label variant="title1" color="primary">
          Dashboard
        </Label>
      </div>
    </AppPage>
  );
}

CollectionPage.propTypes = {
  className: PropTypes.string,
};

export default CollectionPage;

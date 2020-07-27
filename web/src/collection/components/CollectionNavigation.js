import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import NavLinkListAdaptive from "../../common/components/NavLinkListAdaptive";

const { useState } = require("react");

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  links: {
    flexGrow: 1,
  },
  spacer: {
    flexGrow: 2,
    [theme.breakpoints.down("md")]: {
      flexGrow: 0,
      width: theme.spacing(2),
    },
  },
}));

const makeLinks = (intl) => [
  {
    title: intl.formatMessage({ id: "collection.nav.analytics" }),
  },
  {
    title: intl.formatMessage({ id: "collection.nav.fingerprints" }),
  },
  {
    title: intl.formatMessage({ id: "collection.nav.collaborators" }),
  },
  {
    title: intl.formatMessage({ id: "collection.nav.organization" }),
  },
];

/**
 * Navigation links in the collection page header.
 */
function CollectionNavigation(props) {
  const { className } = props;
  const intl = useIntl();
  const links = makeLinks(intl);
  const [selected, setSelected] = useState(links[0].title);

  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.spacer} />
      <NavLinkListAdaptive
        collapseOn="md"
        links={links}
        selected={selected}
        onSelect={(link) => setSelected(link.title)}
        className={classes.links}
      />
      <div className={classes.spacer} />
    </div>
  );
}

CollectionNavigation.propTypes = {
  className: PropTypes.string,
};

export default CollectionNavigation;

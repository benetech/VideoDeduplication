import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import HeaderLinks from "../../common/components/HeaderLinks";
import HeaderLink from "../../common/components/HeaderLink";
import clsx from "clsx";
import { useIntl } from "react-intl";

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
  },
}));

const links = [
  {
    title: "collection.nav.analytics",
  },
  {
    title: "collection.nav.fingerprints",
  },
  {
    title: "collection.nav.collaborators",
  },
  {
    title: "collection.nav.organization",
  },
];

/**
 * Navigation links in the collection page header.
 */
function CollectionNavigation(props) {
  const { className } = props;
  const [selected, setSelected] = useState(0);
  const intl = useIntl();

  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.spacer} />
      <HeaderLinks className={classes.links}>
        {links.map((link, index) => (
          <HeaderLink
            title={intl.formatMessage({ id: link.title })}
            selected={selected === index}
            onClick={() => setSelected(index)}
            key={index}
          />
        ))}
      </HeaderLinks>
      <div className={classes.spacer} />
    </div>
  );
}

CollectionNavigation.propTypes = {
  className: PropTypes.string,
};

export default CollectionNavigation;

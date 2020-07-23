import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import HeaderLinks from "../../common/components/HeaderLinks";
import HeaderLink from "../../common/components/HeaderLink";

const { useState } = require("react");

const useStyles = makeStyles((theme) => ({}));

const links = [
  {
    title: "Analytics",
  },
  {
    title: "My Fingerprints",
  },
  {
    title: "Collaborators",
  },
  {
    title: "Organization",
  },
];

/**
 * Navigation links in the collection page header.
 */
function CollectionNavigation(props) {
  const { className } = props;
  const [selected, setSelected] = useState(0);

  const classes = useStyles();
  return (
    <HeaderLinks className={className}>
      {links.map((link, index) => (
        <HeaderLink
          title={link.title}
          selected={selected === index}
          onClick={() => setSelected(index)}
          key={index}
        />
      ))}
    </HeaderLinks>
  );
}

CollectionNavigation.propTypes = {
  className: PropTypes.string,
};

export default CollectionNavigation;

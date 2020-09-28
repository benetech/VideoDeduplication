import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router-dom";
import NavLinkListAdaptive from "../../common/components/NavLinkListAdaptive";
import { routes } from "../../routing/routes";

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
    title: intl.formatMessage({ id: "nav.analytics" }),
    location: routes.collection.analytics,
  },
  {
    title: intl.formatMessage({ id: "nav.fingerprints" }),
    location: routes.collection.fingerprints,
  },
  {
    title: intl.formatMessage({ id: "nav.collaborators" }),
    location: routes.collaborators.home,
  },
  {
    title: intl.formatMessage({ id: "nav.organization" }),
    location: routes.organization.home,
  },
];

function useSelectedLink(links) {
  const pathname = useLocation().pathname;
  const found = links.find((link) => pathname.startsWith(link.location));
  return found || links[0];
}

function useSelectPage() {
  const history = useHistory();
  return (link) => history.push(link.location);
}

/**
 * Navigation links in the collection page header.
 */
function CollectionNavigation(props) {
  const { className } = props;
  const intl = useIntl();
  const links = makeLinks(intl);
  const selected = useSelectedLink(links);
  const setSelected = useSelectPage();

  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.spacer} />
      <NavLinkListAdaptive
        collapseOn="md"
        links={links}
        selected={selected}
        onSelect={setSelected}
        className={classes.links}
        role="navigation"
        aria-label={intl.formatMessage({ id: "aria.label.headerNavLinks" })}
      />
      <div className={classes.spacer} />
    </div>
  );
}

CollectionNavigation.propTypes = {
  className: PropTypes.string,
};

export default CollectionNavigation;

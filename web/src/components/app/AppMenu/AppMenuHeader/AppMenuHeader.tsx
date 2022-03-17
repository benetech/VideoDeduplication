import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ExpandedLogo from "./ExpandedLogo";
import CollapsedLogo from "./CollapsedLogo";
import { useIntl } from "react-intl";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  headerRoot: {
    height: 146,
    flexShrink: 0,
  },
  openContent: {
    margin: "7px 7px 0px 14px",
    height: theme.dimensions.list.itemHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeContent: {
    height: "100%",
    width: theme.dimensions.list.collapseWidth,
    paddingTop: 17,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  closedContentButton: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 28,
    color: theme.palette.common.black,
  },
}));

/**
 * Title of the application left-side menu.
 */
function AppMenuHeader(props: AppMenuHeaderProps): JSX.Element {
  const {
    open,
    onToggle,
    "aria-controls": ariaControls,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const intl = useIntl();

  if (open) {
    return (
      <div className={clsx(classes.headerRoot, className)} {...other}>
        <div className={classes.openContent}>
          <ExpandedLogo />
          <IconButton
            onClick={onToggle}
            aria-label={intl.formatMessage({ id: "actions.toggleSidebar" })}
            aria-controls={ariaControls}
            data-selector="AppMenuToggle"
          >
            <MenuIcon
              fontSize="large"
              classes={{ fontSizeLarge: classes.menuIcon }}
            />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(classes.headerRoot, className)} {...other}>
      <div className={classes.closeContent}>
        <CollapsedLogo />
        <div className={classes.closedContentButton}>
          <IconButton
            onClick={onToggle}
            aria-label={intl.formatMessage({ id: "actions.toggleSidebar" })}
            aria-controls={ariaControls}
            data-selector="AppMenuToggle"
          >
            <MenuIcon
              fontSize="large"
              classes={{ fontSizeLarge: classes.menuIcon }}
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

type AppMenuHeaderProps = React.HTMLProps<HTMLDivElement> & {
  open: boolean;
  onToggle: () => void;
  className?: string;
  "aria-controls"?: string;
};

export default AppMenuHeader;

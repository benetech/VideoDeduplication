import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateType } from "../../../prop-types/TemplateType";
import TemplateIcon from "../TemplateIcon/TemplateIcon";
import IconButton from "@material-ui/core/IconButton";
import { Collapse } from "@material-ui/core";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

const useStyles = makeStyles((theme) => ({
  item: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginLeft: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(3),
    ...theme.mixins.title3,
    fontWeight: "bold",
  },
  example: {
    width: 80,
    height: 80,
    margin: theme.spacing(1),
    display: "inline-block",
  },
}));

function TemplateListItem(props) {
  const { template, className, ...other } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const ExpandIcon = expand ? ExpandMoreOutlinedIcon : ChevronRightOutlinedIcon;

  const handleExpand = useCallback(() => setExpand(!expand), [expand]);

  return (
    <div className={clsx(classes.item, className)} {...other}>
      <div className={classes.header}>
        <IconButton onClick={handleExpand}>
          <ExpandIcon />
        </IconButton>
        <TemplateIcon icon={template.icon} className={classes.icon} />
        <div className={classes.title}>{template.name}</div>
      </div>
      <Collapse in={expand}>
        <div>
          <div>
            {template.examples.map((example, index) => (
              <img
                src={example.url}
                key={example.id}
                alt={`Example ${index}`}
                className={classes.example}
              />
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
}

TemplateListItem.propTypes = {
  /**
   * Template to be displayed.
   */
  template: TemplateType.isRequired,
  className: PropTypes.string,
};

export default TemplateListItem;

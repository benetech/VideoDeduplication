import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateType } from "../../../prop-types/TemplateType";
import { Collapse } from "@material-ui/core";
import { useIntl } from "react-intl";
import TemplateHeader from "./TemplateHeader";
import TemplateExamplePreview from "./TemplateExamplePreview";
import ButtonBase from "@material-ui/core/ButtonBase";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import useUniqueId from "../../../../common/hooks/useUniqueId";
import TemplateGalleryDialog from "./TemplateGalleryDialog";

const useStyles = makeStyles((theme) => ({
  item: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
  },
  header: {},
  examples: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  example: {
    margin: theme.spacing(1),
  },
  examplesDescription: {
    ...theme.mixins.text,
    color: theme.palette.primary.main,
    margin: theme.spacing(1),
  },
  addExampleInput: {
    display: "none",
  },
  addExampleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.palette.divider,
    borderStyle: "dashed",
    borderWidth: 1,
    width: 80,
    height: 80,
    margin: theme.spacing(1),
    fontSize: 50,
    color: theme.palette.divider,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    examplesDescription: intl.formatMessage({ id: "templates.examples" }),
  };
}

function TemplateListItem(props) {
  const {
    template,
    onChange,
    onAddExamples,
    onDeleteExample,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const inputId = useUniqueId("add-files-");
  const [expand, setExpand] = useState(false);
  const [edit, setEdit] = useState(false);
  const [startExample, setStartExample] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const openGallery = useCallback((example) => {
    setStartExample(example);
    setShowGallery(true);
  });
  const closeGallery = useCallback(() => setShowGallery(false));

  const toggleExpand = useCallback(() => setExpand(!expand), [expand]);

  const toggleEdit = useCallback(() => {
    setEdit(!edit);
    setExpand(true);
  }, [edit]);

  const handleAddExamples = useCallback(
    (event) => onAddExamples([...event.target.files], template),
    [template, onAddExamples]
  );

  const handleIconChange = useCallback(
    (icon) => onChange({ id: template.id, icon }),
    [template, onChange]
  );

  const handleNameChange = useCallback(
    (name) => onChange({ id: template.id, name }),
    [template, onChange]
  );

  const handleDeleteExample = useCallback(
    (example) => onDeleteExample(example, template),
    [template, onDeleteExample]
  );

  return (
    <div className={clsx(classes.item, className)} {...other}>
      <TemplateHeader
        template={template}
        onEditChange={toggleEdit}
        onIconChange={handleIconChange}
        onNameChange={handleNameChange}
        onExpandChange={toggleExpand}
        edit={edit}
        expanded={expand}
        className={classes.header}
      />
      <Collapse in={expand}>
        <div>
          <div className={classes.examplesDescription}>
            {messages.examplesDescription}
          </div>
          <div className={classes.examples}>
            {template.examples.map((example) => (
              <TemplateExamplePreview
                key={example.id}
                example={example}
                edit={edit}
                onDelete={handleDeleteExample}
                onClick={openGallery}
                className={classes.example}
              />
            ))}
            {edit && (
              <React.Fragment>
                <input
                  accept="image/*"
                  className={classes.addExampleInput}
                  id={inputId}
                  multiple
                  type="file"
                  onChange={handleAddExamples}
                />
                <label htmlFor={inputId}>
                  <ButtonBase
                    focusRipple
                    className={classes.addExampleButton}
                    component="span"
                  >
                    <AddOutlinedIcon fontSize="inherit" />
                  </ButtonBase>
                </label>
              </React.Fragment>
            )}
          </div>
        </div>
      </Collapse>
      <TemplateGalleryDialog
        template={template}
        open={showGallery}
        onClose={closeGallery}
        startExample={startExample}
      />
    </div>
  );
}

TemplateListItem.propTypes = {
  /**
   * Template to be displayed.
   */
  template: TemplateType.isRequired,
  /**
   * Handle change template name.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Handle example delete.
   */
  onDeleteExample: PropTypes.func.isRequired,
  /**
   * Handle new examples.
   */
  onAddExamples: PropTypes.func.isRequired,
  /**
   * Enable edit-mode by default for new templates.
   */
  new: PropTypes.bool,
  className: PropTypes.string,
};

export default TemplateListItem;

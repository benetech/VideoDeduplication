import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Collapse, Theme } from "@material-ui/core";
import { Template } from "../../../model/Template";
import { useIntl } from "react-intl";
import TemplateHeader from "./TemplateHeader";
import TemplateExamplePreview from "./TemplateExamplePreview";
import ButtonBase from "@material-ui/core/ButtonBase";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import TemplateGalleryDialog from "./TemplateGalleryDialog";

const useStyles = makeStyles<Theme>((theme) => ({
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
    examplesDescription: intl.formatMessage({
      id: "templates.examples",
    }),
  };
}

function TemplateListItem(props: TemplateListItemProps): JSX.Element {
  const {
    template,
    onChange,
    onAddExamples,
    onDeleteExample,
    onDelete,
    onShowMatches,
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
  }, []);
  const closeGallery = useCallback(() => setShowGallery(false), []);
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
    (icon) => onChange({ ...template, icon }, template),
    [template, onChange]
  );
  const handleNameChange = useCallback(
    (name) => onChange({ ...template, name }, template),
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
        onShowMatches={onShowMatches}
        onDelete={onDelete}
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

type TemplateListItemProps = {
  /**
   * Template to be displayed.
   */
  template: Template;

  /**
   * Handle change template name.
   */
  onChange: (...args: any[]) => void;

  /**
   * Handle example delete.
   */
  onDeleteExample: (...args: any[]) => void;

  /**
   * Handle new examples.
   */
  onAddExamples: (...args: any[]) => void;

  /**
   * Enable edit-mode by default for new templates.
   */
  new?: boolean;

  /**
   * Handle show template matches.
   */
  onShowMatches: (...args: any[]) => void;

  /**
   * Handle delete template.
   */
  onDelete: (...args: any[]) => void;
  className?: string;
};
export default TemplateListItem;

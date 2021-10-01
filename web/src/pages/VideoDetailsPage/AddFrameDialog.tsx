import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import thumbnailURL from "../../application/api/files/helpers/thumbnailURL";
import { VideoFile } from "../../model/VideoFile";
import TemplateSelect from "../../components/templates/TemplateSelect";
import Button from "../../components/basic/Button";
import {
  CreateExampleFn,
  useCreateExampleFromFrame,
} from "../../application/api/templates/useTemplateAPI";
import indexEntities from "../../lib/entity/indexEntities";
import SelectableTabs, {
  SelectableTab,
} from "../../components/basic/SelectableTabs";
import SwitchComponent from "../../components/basic/SwitchComponent/SwitchComponent";
import Case from "../../components/basic/SwitchComponent/Case";
import NewTemplateForm from "../../components/templates/NewTemplateForm";
import useNewTemplateForm, {
  TemplateErrors,
} from "../../components/templates/NewTemplateForm/useNewTemplateForm";
import useTemplatesAll from "../../application/api/templates/useTemplatesAll";
import { Template } from "../../model/Template";
import { Transient } from "../../lib/entity/Entity";
import { DialogProps } from "@material-ui/core/Dialog/Dialog";

const useStyles = makeStyles<Theme>((theme) => ({
  noScroll: {
    overflowY: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    margin: theme.spacing(1),
  },
  form: {
    width: 500,
    height: 64,
  },
  image: {
    width: 500,
    marginBottom: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    addTemplate: intl.formatMessage({
      id: "actions.addTemplate",
    }),
    existingTemplate: intl.formatMessage({
      id: "templates.existing",
    }),
    addFrame: intl.formatMessage({
      id: "actions.addFrameToTemplate",
    }),
    create: intl.formatMessage({
      id: "actions.create",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
  };
}

/**
 * Target template options
 */
enum Target {
  EXISTING_TEMPLATE = "existing",
  NEW_TEMPLATE = "new",
}

type UseAddToExistingResults = {
  loaded: boolean;
  templates: Template[];
  selected: Template["id"][];
  onChange: (selected: Template["id"][]) => void;
  onCreate: () => Promise<void>;
  canCreate: boolean;
  isLoading: boolean;
};

function useAddToExising(
  file: VideoFile,
  time: number,
  addFrame: CreateExampleFn,
  onClose: () => void
): UseAddToExistingResults {
  const [selected, setSelected] = useState<Template["id"][]>([]);
  const { templates, done: loaded } = useTemplatesAll();
  const templateIndex: Map<Template["id"], Template> = useMemo(
    () => indexEntities(templates),
    [templates]
  );
  const [isLoading, setIsLoading] = useState(false);
  const onCreate = useCallback(async () => {
    setIsLoading(true);

    try {
      for (const id of selected) {
        const template = templateIndex.get(id);
        if (template == null) {
          continue;
        }
        try {
          await addFrame({
            template,
            file,
            time,
          });
        } catch (error) {
          console.error(error);
        }
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [templateIndex, selected, file, time]);
  return {
    loaded,
    templates,
    selected,
    onChange: setSelected,
    onCreate,
    canCreate: selected.length > 0 && !isLoading,
    isLoading,
  };
}

type UseAddToNewResults = {
  template: Transient<Template>;
  onChange: (template: Transient<Template>) => void;
  errors: TemplateErrors;
  onCreate: () => Promise<void>;
  canCreate: boolean;
  isLoading: boolean;
};

function useAddToNew(
  file: VideoFile,
  time: number,
  addFrame: CreateExampleFn,
  onClose: () => void
): UseAddToNewResults {
  const form = useNewTemplateForm();
  const [isLoading, setIsLoading] = useState(false);
  const onCreate = useCallback(async () => {
    setIsLoading(true);

    try {
      const template = await form.onCreate();
      await addFrame({
        template,
        file,
        time,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [form.template, file, time, addFrame]);
  return {
    template: form.template,
    onChange: form.onChange,
    errors: form.errors,
    onCreate,
    canCreate: !form.errors.name && !isLoading,
    isLoading,
  };
}

/**
 * Use video frame as a new template example.
 */
function AddFrameDialog(props: AddFrameDialogProps): JSX.Element {
  const { file, time, onClose, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const addFrame = useCreateExampleFromFrame();
  const existing = useAddToExising(file, time, addFrame, onClose);
  const fresh = useAddToNew(file, time, addFrame, onClose);
  const [target, setTarget] = useState(Target.EXISTING_TEMPLATE);
  const handler = target === Target.NEW_TEMPLATE ? fresh : existing;
  useEffect(() => {
    if (existing.loaded && existing.templates.length === 0) {
      setTarget(Target.NEW_TEMPLATE);
    }
  }, [existing.loaded]);
  return (
    <Dialog className={clsx(className)} onClose={onClose} {...other}>
      <DialogTitle>{messages.addFrame}</DialogTitle>
      <DialogContent>
        <div className={classes.content}>
          <img
            src={thumbnailURL(file, time)}
            alt={`${file?.filename} at ${time}`}
            className={classes.image}
          />
          <SelectableTabs
            value={target}
            onChange={setTarget}
            className={classes.tabs}
          >
            {existing.templates.length > 0 && (
              <SelectableTab
                label={messages.existingTemplate}
                value={Target.EXISTING_TEMPLATE}
              />
            )}
            <SelectableTab
              label={messages.addTemplate}
              value={Target.NEW_TEMPLATE}
            />
          </SelectableTabs>
          <SwitchComponent value={target}>
            <Case match={Target.EXISTING_TEMPLATE}>
              <TemplateSelect
                templates={existing.templates}
                onChange={existing.onChange}
                value={existing.selected}
                className={classes.form}
                fullWidth
              />
            </Case>
            <Case match={Target.NEW_TEMPLATE}>
              <NewTemplateForm
                template={fresh.template}
                onChange={fresh.onChange}
                errors={fresh.errors}
                className={classes.form}
              />
            </Case>
          </SwitchComponent>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handler.onCreate}
          color="primary"
          autoFocus
          disabled={!handler.canCreate}
        >
          {messages.create}
        </Button>
        <Button onClick={onClose} color="secondary">
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type AddFrameDialogProps = DialogProps & {
  /**
   * File to extract frame.
   */
  file: VideoFile;

  /**
   * Time position in file, in milliseconds
   */
  time: number;

  /**
   * Handle dialog close.
   */
  onClose: () => void;
  className?: string;
};
export default AddFrameDialog;

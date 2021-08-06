import React, { useCallback, useState } from "react";
import clsx from "clsx";
import lodash from "lodash";
import PropTypes from "prop-types";
import { DefaultFilters } from "../../../application/state/files/coll/initialState";
import { makeStyles } from "@material-ui/styles";
import PresetList from "../../../components/presets/PresetList";
import { useDispatch } from "react-redux";
import LoadTrigger from "../../../components/basic/LoadingTrigger/LoadTrigger";
import { useIntl } from "react-intl";
import PresetAPI from "../../../application/api/presets/PresetAPI";
import UpdatePresetDialog from "./UpdatePresetDialog";
import DeletePresetDialog from "./DeletePresetDialog";
import useFilesColl from "../../../application/api/files/useFilesColl";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  trigger: {
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  presets: {
    margin: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    error: intl.formatMessage({ id: "presets.loadError" }),
  };
}

function Presets(props) {
  const { className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [preset, setPreset] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const presetApi = PresetAPI.use();
  const presetList = presetApi.useLazyPresetList();
  const collection = useFilesColl();

  const handleApply = useCallback((preset) => {
    const filters = lodash.merge({}, DefaultFilters, preset.filters);
    console.log("Applying", { preset, filters });
    collection.setParams(filters);
  });

  const handleUpdate = useCallback(
    (updated, original) => presetApi.updatePreset(updated, original),
    [presetApi]
  );

  const handleDelete = useCallback(
    (preset) => presetApi.deletePreset(preset),
    [presetApi]
  );

  const handleShowUpdate = useCallback((preset) => {
    setPreset(preset);
    setShowUpdate(true);
  });

  const handleCloseUpdate = useCallback(() => setShowUpdate(false));

  const handleShowDelete = useCallback((preset) => {
    setPreset(preset);
    setShowDelete(true);
  });

  const handleCloseDelete = useCallback(() => setShowDelete(false));

  return (
    <div className={clsx(classes.root, className)}>
      <PresetList>
        {presetList.presets.map((preset) => (
          <PresetList.Item
            key={preset.id}
            preset={preset}
            onClick={handleApply}
            onUpdate={handleShowUpdate}
            onDelete={handleShowDelete}
          />
        ))}
        <LoadTrigger
          loading={presetList.isLoading}
          onLoad={presetList.loadMore}
          hasMore={presetList.hasMore}
          errorMessage={messages.error}
          error={presetList.error}
          className={classes.trigger}
        />
      </PresetList>
      {preset && (
        <UpdatePresetDialog
          preset={preset}
          open={showUpdate}
          onClose={handleCloseUpdate}
          onUpdate={handleUpdate}
        />
      )}
      {preset && (
        <DeletePresetDialog
          preset={preset}
          open={showDelete}
          onClose={handleCloseDelete}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

Presets.propTypes = {
  className: PropTypes.string,
};

export default Presets;

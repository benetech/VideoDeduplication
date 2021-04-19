import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { MatchCategory } from "../../../state/fileList/MatchCategory";
import { FileSort } from "../../../state/fileList/FileSort";

import { makeStyles } from "@material-ui/styles";
import PresetList from "./PresetList";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
}));

const presets = [
  {
    id: 1,
    name: "Foo Dossier DossierDossierDossierDossierDossierDossier",
    filters: {
      query: "/foo/",
      extensions: [],
      length: { lower: null, upper: null },
      date: { lower: null, upper: null },
      audio: null,
      exif: null,
      matches: MatchCategory.all,
      sort: FileSort.date,
      remote: null,
      templates: [],
    },
  },
  {
    id: 2,
    name: "Remote",
    filters: {
      query: "",
      extensions: [],
      length: { lower: null, upper: null },
      date: { lower: null, upper: null },
      audio: null,
      exif: null,
      matches: MatchCategory.all,
      sort: FileSort.date,
      remote: true,
      templates: [],
    },
  },
];

function Presets(props) {
  const { className } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      <PresetList>
        {presets.map((preset, index) => (
          <PresetList.Item
            key={preset.id}
            preset={preset}
            onClick={console.log}
            onDelete={console.log}
            divider={index < presets.length - 1}
          />
        ))}
      </PresetList>
    </div>
  );
}

Presets.propTypes = {
  className: PropTypes.string,
};

export default Presets;

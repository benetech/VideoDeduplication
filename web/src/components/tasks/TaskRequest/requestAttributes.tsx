import React from "react";
import Bool from "../../basic/Bool";
import { formatDuration } from "../../../lib/helpers/format";
import ExtensionList from "./ExtensionList";
import FileRef from "../../basic/FileRef";
import LinkList from "./LinkList";
import {
  BaseTaskRequest,
  FindFrameRequest,
  GenerateTilesRequest,
  MatchTemplatesRequest,
  PrepareSemanticSearchRequest,
  ProcessDirectoryRequest,
  ProcessOnlineVideoRequest,
} from "../../../model/Task";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import embeddingAlgoName from "../../../lib/messages/embeddingAlgoName";
import ValueBadge from "../../basic/ValueBadge";

export const commonRequestAttributes: AttributeRenderer<BaseTaskRequest>[] = [
  {
    title: "task.attr.frameSampling",
    value: (request) => request.frameSampling,
  },
  {
    title: "task.attr.matchDistance",
    value: (request) => request.matchDistance,
  },
  {
    title: "task.attr.filterDark",
    // eslint-disable-next-line react/display-name
    value: (request) => <Bool value={request.filterDark} />,
  },
  {
    title: "task.attr.darkThreshold",
    value: (request) => request.darkThreshold,
  },
  {
    title: "task.attr.minDurationSeconds",
    value: (request, intl) =>
      request.minDuration != null &&
      formatDuration(request.minDuration, intl, false),
  },
  {
    title: "task.attr.extensions",
    // eslint-disable-next-line react/display-name
    value: (request) => <ExtensionList extensions={request.extensions} />,
  },
];

/**
 * Process-Directory request attributes
 */
export const processDirectoryAttributes: AttributeRenderer<ProcessDirectoryRequest>[] =
  [
    {
      title: "task.attr.directory",
      value: (request) => request.directory,
    },
    ...commonRequestAttributes,
  ];

/**
 * Match-Templates request attributes.
 */
export const matchTemplatesAttributes: AttributeRenderer<MatchTemplatesRequest>[] =
  [
    {
      title: "task.attr.templateDistance",
      value: (request) => request.templateDistance,
    },
    {
      title: "task.attr.templateDistanceMin",
      value: (request) => request.templateDistanceMin,
    },
    ...commonRequestAttributes,
  ];

/**
 * Find-Frame request attributes.
 */
export const findFrameAttributes: AttributeRenderer<FindFrameRequest>[] = [
  {
    title: "task.attr.file",
    // eslint-disable-next-line react/display-name
    value: (request) => <FileRef fileId={request.fileId} />,
  },
  {
    title: "task.attr.frameTime",
    value: (request, intl) =>
      formatDuration(request.frameTimeMillis, intl, false),
  },
  {
    title: "task.attr.directory",
    value: (request) => request.directory,
  },
  {
    title: "task.attr.templateDistance",
    value: (request) => request.templateDistance,
  },
  {
    title: "task.attr.templateDistanceMin",
    value: (request) => request.templateDistanceMin,
  },
  ...commonRequestAttributes,
];

/**
 * Process online request attributes.
 */
export const processOnlineVideoAttributes: AttributeRenderer<ProcessOnlineVideoRequest>[] =
  [
    {
      title: "task.attr.onlineVideoURLs",
      // eslint-disable-next-line react/display-name
      value: (request) => <LinkList links={request.urls} />,
    },
    {
      title: "task.attr.onlineDestination",
      value: (request) => request.destinationTemplate,
    },
  ];

/**
 * Prepare semantic search request attributes.
 */
export const prepareSemanticSearchAttributes: AttributeRenderer<PrepareSemanticSearchRequest>[] =
  [
    {
      title: "task.attr.forcePrepareSemantic",
      // eslint-disable-next-line react/display-name
      value: (request) => <Bool value={request.force} />,
    },
  ];

/**
 * Prepare semantic search request attributes.
 */
export const generateTilesAttributes: AttributeRenderer<GenerateTilesRequest>[] =
  [
    {
      title: "task.attr.embeddingAlgorithm",
      // eslint-disable-next-line react/display-name
      value: (request) => (
        <ValueBadge
          value={embeddingAlgoName(request.algorithm)}
          color="secondary"
        />
      ),
    },
    {
      title: "task.attr.generateTilesMaxZoom",
      value: (request) => request.maxZoom,
    },
    {
      title: "task.attr.forceGenerateTiles",
      // eslint-disable-next-line react/display-name
      value: (request) => <Bool value={request.force} />,
    },
  ];

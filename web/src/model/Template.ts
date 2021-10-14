import { VideoFile } from "./VideoFile";
import { Transient } from "../lib/entity/Entity";

/**
 * Template query filters.
 */
export type TemplateFilters = {
  name?: string;
};

/**
 * Template exclusion query filters.
 */
export type TemplateExclusionFilters = {
  templateId?: number;
  fileId?: number;
};

/**
 * Template example query filters.
 */
export type TemplateExampleFilters = {
  templateId?: number;
};

/**
 * Template match query filters.
 */
export type TemplateMatchFilters = {
  templateId?: number;
  fileId?: number;
};

/**
 * Template icon kinds.
 */
export enum IconKind {
  PREDEFINED = "predefined",
  CUSTOM = "custom",
}

/**
 * Template icon descriptor.
 */
export type TemplateIcon = {
  kind: IconKind;
  key: string;
};

/**
 * Default icon.
 */
export const DefaultTemplateIcon: TemplateIcon = Object.freeze({
  kind: IconKind.PREDEFINED,
  key: "GiPoliceOfficerHead",
});

/**
 * Template example prop-type.
 *
 * Template example is an image associate with a template which visually
 * exemplifies some object or situation represented by the template.
 */
export type TemplateExample = {
  id: number;
  url: string;
  templateId: number;
  template?: Template;
};

/**
 * Prop type for template.
 *
 * Template is collection of example-images which visually represents some
 * object or situation which the application will be able to find in the
 * existing files.
 */
export type Template = {
  id: number;
  name: string;
  icon: TemplateIcon;
  examples: TemplateExample[];
  fileCount?: number;
};

/**
 * Black-listed (file, template) pair.
 */
export type TemplateExclusion = {
  id: number;
  file: VideoFile;
  template: Template;
};

/**
 * Recognized object (synonym for Template Match) prop-type.
 */
export type TemplateMatch = {
  id: number;
  fileId: number;
  templateId: number;
  /** Start time, ms */
  start: number;
  /** End time, ms */
  end: number;
  /** Mean distance between template and the video fragment. */
  meanDistance: number;
  /** Minimum distance between template and the video fragment. */
  minDistance: number;
  /** Point in time with maximal similarity, ms. */
  minDistanceTime: number;
  template?: Template;
  file?: VideoFile;
  falsePositive?: boolean;
};

/**
 * Create empty template stub.
 */
export function makeTemplate(): Transient<Template> {
  return {
    name: "",
    icon: DefaultTemplateIcon,
    examples: [],
  };
}

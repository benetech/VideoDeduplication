function exifTag(file, tagName) {
  return file.exif && file.exif[tagName];
}

/**
 * General EXIF attributes to be displayed.
 *
 * See https://exiftool.org/TagNames/EXIF.html for more details
 */
export const generalEXIFAttributes = [
  {
    title: "exif.Make",
    value: (file) => exifTag(file, "Make"),
  },
  {
    title: "exif.Model",
    value: (file) => exifTag(file, "Model"),
  },
  {
    title: "exif.Orientation",
    value: (file) => exifTag(file, "Orientation"),
  },
  {
    title: "exif.Software",
    value: (file) => exifTag(file, "Software"),
  },
  {
    title: "exif.DateTime",
    value: (file) => exifTag(file, "DateTime"),
  },
  {
    title: "exif.YCbCrPositioning",
    value: (file) => exifTag(file, "YCbCrPositioning"),
  },
  {
    title: "exif.Compression",
    value: (file) => exifTag(file, "Compression"),
  },
  {
    title: "exif.XResolution",
    value: (file) => exifTag(file, "XResolution"),
  },
  {
    title: "exif.YResolution",
    value: (file) => exifTag(file, "YResolution"),
  },
  {
    title: "exif.ResolutionUnit",
    value: (file) => exifTag(file, "ResolutionUnit"),
  },
  {
    title: "exif.ExposureTime",
    value: (file) => exifTag(file, "ExposureTime"),
  },
  {
    title: "exif.FNumber",
    value: (file) => exifTag(file, "FNumber"),
  },
  {
    title: "exif.ExposureProgram",
    value: (file) => exifTag(file, "ExposureProgram"),
  },
  {
    title: "exif.ExifVersion",
    value: (file) => exifTag(file, "ExifVersion"),
  },
  {
    title: "exif.ComponentsConfiguration",
    value: (file) => exifTag(file, "ComponentsConfiguration"),
  },
  {
    title: "exif.CompressedBitsPerPixel",
    value: (file) => exifTag(file, "CompressedBitsPerPixel"),
  },
];

/**
 * FlashPix EXIF Attributes
 *
 * See https://exiftool.org/TagNames/FlashPix.html for more details
 */
export const flashPixEXIFAttributes = [
  {
    title: "exif.CompObj",
    value: (file) => exifTag(file, "CompObj"),
  },
  {
    title: "exif.AudioInfo",
    value: (file) => exifTag(file, "AudioInfo"),
  },
  {
    title: "exif.DataObject",
    value: (file) => exifTag(file, "DataObject"),
  },
  {
    title: "exif.DocumentInfo",
    value: (file) => exifTag(file, "DocumentInfo"),
  },
  {
    title: "exif.Extensions",
    value: (file) => exifTag(file, "Extensions"),
  },
  {
    title: "exif.GlobalInfo",
    value: (file) => exifTag(file, "GlobalInfo"),
  },
  {
    title: "exif.Image",
    value: (file) => exifTag(file, "Image"),
  },
  {
    title: "exif.ImageInfo",
    value: (file) => exifTag(file, "ImageInfo"),
  },
  {
    title: "exif.Operation",
    value: (file) => exifTag(file, "Operation"),
  },
  {
    title: "exif.ScreenNail",
    value: (file) => exifTag(file, "ScreenNail"),
  },
  {
    title: "exif.SummaryInfo",
    value: (file) => exifTag(file, "SummaryInfo"),
  },
  {
    title: "exif.Transform",
    value: (file) => exifTag(file, "Transform"),
  },
  {
    title: "exif.AudioStream",
    value: (file) => exifTag(file, "AudioStream"),
  },
  {
    title: "exif.Contents",
    value: (file) => exifTag(file, "Contents"),
  },
  {
    title: "exif.CurrentUser",
    value: (file) => exifTag(file, "CurrentUser"),
  },
  {
    title: "exif.ICC_Profile",
    value: (file) => exifTag(file, "ICC_Profile"),
  },
  {
    title: "exif.PreviewImage",
    value: (file) => exifTag(file, "PreviewImage"),
  },
  {
    title: "exif.PreviewInfo",
    value: (file) => exifTag(file, "PreviewInfo"),
  },
  {
    title: "exif.SubimageHdr",
    value: (file) => exifTag(file, "SubimageHdr"),
  },
  {
    title: "exif.WordDocument",
    value: (file) => exifTag(file, "WordDocument"),
  },
];

export const audioEXIFAttributes = [];

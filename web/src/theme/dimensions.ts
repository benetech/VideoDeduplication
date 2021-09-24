const dimensions = {
  list: {
    itemHeight: 68,
    collapseWidth: 85,
  },
  selectionDecorator: {
    verticalSize: 4,
    horizontalSize: 3,
  },
  application: {
    maxWidth: 1455,
  },
  scrollbar: {
    size: 12,
  },
  header: {
    padding: 16,
  },
  content: {
    padding: 20,
  },
  gridItem: {
    width: 272,
    imageHeight: 117,
  },
  collectionPage: {
    width: 750,
  },
};

export type Dimensions = typeof dimensions;
export type DimensionOptions = Partial<Dimensions>;

export default dimensions;

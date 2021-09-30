type CropImageURLOptions = {
  imageURL: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resultWidth: number;
  resultHeight: number;
};

export default function cropImageURL({
  imageURL,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  resultWidth,
  resultHeight,
}: CropImageURLOptions): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        // Create invisible canvas
        const canvas = document.createElement("canvas");
        const widthUnit = image.naturalWidth / 100;
        const heightUnit = image.naturalHeight / 100;
        canvas.width = resultWidth || width * widthUnit;
        canvas.height = resultHeight || height * heightUnit;

        const context = canvas.getContext("2d");
        context?.drawImage(
          image,
          x * widthUnit,
          y * heightUnit,
          width * widthUnit,
          height * heightUnit,
          0,
          0,
          resultWidth || width * widthUnit,
          resultHeight || height * heightUnit
        );
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      } catch (err) {
        reject(err);
      }
    };
    image.src = imageURL;
  });
}

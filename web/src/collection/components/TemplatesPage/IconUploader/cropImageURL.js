export default function cropImageURL({ imageURL, x, y, width, height }) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        // Create invisible canvas
        const canvas = document.createElement("canvas");
        const widthUnit = image.naturalWidth / 100;
        const heightUnit = image.naturalHeight / 100;
        canvas.width = width * widthUnit;
        canvas.height = height * heightUnit;

        const context = canvas.getContext("2d");
        context.drawImage(
          image,
          x * widthUnit,
          y * heightUnit,
          width * widthUnit,
          height * heightUnit,
          0,
          0,
          width * widthUnit,
          height * heightUnit
        );
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      } catch (err) {
        reject(err);
      }
    };
    image.src = imageURL;
  });
}

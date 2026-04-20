export async function compressImage(file, maxSize = 768, quality = 0.6) {
  const img = await createImageBitmap(file);

  let { width, height } = img;

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error("Gagal mengompres gambar"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || "";
      const base64 = String(result).split(",")[1];

      resolve({
        base64,
        mimeType: "image/jpeg",
      });
    };
    reader.onerror = () => reject(new Error("Gagal membaca file hasil kompres"));
    reader.readAsDataURL(blob);
  });
}
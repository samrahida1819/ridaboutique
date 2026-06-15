type CloudinaryFetchOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit";
  gravity?: "auto" | "center" | "face";
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

export function cloudinaryFetch(sourceUrl: string, options: CloudinaryFetchOptions = {}) {
  const {
    width = 1400,
    height,
    crop = "fill",
    gravity = "auto"
  } = options;

  const transforms = ["f_auto", "q_auto", `c_${crop}`, `w_${width}`, `g_${gravity}`];

  if (height) {
    transforms.push(`h_${height}`);
  }

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms.join(",")}/${encodeURIComponent(sourceUrl)}`;
}

export const cloudinaryConfig = {
  cloudName,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "rida-boutique-custom-orders"
};

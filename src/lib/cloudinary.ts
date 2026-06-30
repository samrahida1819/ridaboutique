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

export function hasCloudinaryUploadConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
    body: formData,
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const data = (await response.json()) as { secure_url?: string };

  if (!data.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return data.secure_url;
}

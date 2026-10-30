const IMAGES_BASE = "https://store-api.softclub.tj/images/";

export const toImageUrl = (name?: string | null): string => {
  if (!name) return "";
  if (/^https?:\/\//i.test(name)) return name;
  return `${IMAGES_BASE}${name}`;
};

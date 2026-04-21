
export const generateUniqueUsername = (displayName, uid) => {
  // Fallback if displayName is missing
  if (!displayName) return `user_${uid.substring(0, 5).toLowerCase()}`;
  const cleanName = displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')        // Remove all spaces
    .replace(/[^\w-]+/g, '');    // Remove non-alphanumeric (except underscores/dashes)

  // 2. Get the 4-character "discriminator" from the UID
  // We lowercase it to keep the URL looking consistent
  const discriminator = uid.substring(0, 4).toLowerCase();

  return `${cleanName}_${discriminator}`;
};
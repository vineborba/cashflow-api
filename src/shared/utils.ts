const notAlphanumericRegex = /[^\d\w\-_]/g;
export const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .trim()
    .replace(" ", "-")
    .replace(notAlphanumericRegex, "");
};

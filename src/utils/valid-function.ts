export const isValidEmailFormat = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidUrlFormat = (url: string): boolean => {
  // /^(https?:\/\/)/i
  //  /^(https?:\/\/)([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i
  // /^(https?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[/?]\S+)$/i;
  if (!url) return false;
  const urlRegexComprehensive = /^(https?:\/\/)/i;
  return urlRegexComprehensive.test(url);
}
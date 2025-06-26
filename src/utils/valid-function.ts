export const isValidEmailFormat = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidUrlFormat = (url: string): string | null => {
  if (!url) return "URL을 입력해주세요.";

  const startsWithHttpOrHttpsAndNoSpaces = /^(https?:\/\/\S+)$/i;
  if (!startsWithHttpOrHttpsAndNoSpaces.test(url)) {
    if (!/^(https?:\/\/)/i.test(url)) {
      return "URL은 'http://' 또는 'https://'로 시작해야 합니다.";
    } else {
      // http/https로 시작은 하지만 공백이 포함된 경우
      return "URL에 공백이 포함될 수 없습니다.";
    }
  }
  return null;
}
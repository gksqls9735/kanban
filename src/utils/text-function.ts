export const truncateText = (text: string, maxLength: number): string => {
  const limit = Math.max(0, Math.floor(maxLength));

  if (typeof text !== 'string') {
    console.error("truncateText: 'text' 인자는 문자열이어야 합니다.");
    return '';
  }

  if (text.length > limit) {
    return text.slice(0, limit);
  } else {
    return text;
  }
};

export const getInitial = (name: string): string => {
  return name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : '';
};

export const generateUniqueId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function extractLastTeamName(teamString: string): string {
  if (!teamString) return '';
  const segments = teamString.split('/');
  return segments[segments.length - 1];
}

export function extractFirstTeamName(teamString: string): string {
  if (!teamString) return '';
  const segments = teamString.split('/');
  return segments[0];
}
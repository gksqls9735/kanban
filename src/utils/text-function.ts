import { Section, SelectOption } from "../types/type";

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

export const normalizeSpaces = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s\s+/g, ' ');
};

export const getNextUntitledName = (baseName: string, list: Section[] | SelectOption[]) => {
  let maxNumber = 0;

  if (list.length === 0) return baseName;

  const firstItem = list[0];

  if ('sectionId' in firstItem && typeof (firstItem as Section).sectionId === 'string') {
    const sectionsList = list as Section[];

    sectionsList.forEach(item => {
      const normalizedName = normalizeSpaces(item.sectionName);
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // baseName 특수문자 이스케이프
      const regex = new RegExp(`^${normalizeSpaces(escapedBaseName)}\\s*(\\d*)$`)
      const match = normalizedName.match(regex);

      if (match) {
        const num = match[1] === '' ? 0 : parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    return maxNumber > 0 ? `${baseName} ${maxNumber + 1}` : `${baseName} 1`;
  } else if ('code' in firstItem && typeof (firstItem as SelectOption).code === 'string') {
    const selectOptionList = list as SelectOption[];

    selectOptionList.forEach(item => {
      const normalizedName = normalizeSpaces(item.name);
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // baseName 특수문자 이스케이프
      const regex = new RegExp(`^${normalizeSpaces(escapedBaseName)}\\s*(\\d*)$`)
      const match = normalizedName.match(regex);

      if (match) {
        const num = match[1] === '' ? 0 : parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    return maxNumber > 0 ? `${baseName} ${maxNumber + 1}` : `${baseName} 1`;
  } else {
    return baseName;
  }

};
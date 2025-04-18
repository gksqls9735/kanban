import { SelectOption } from "../types/type";

// Sample Priorities
export const priorityUrgent: SelectOption = { code: '01', name: '긴급', colorMain: '#f63d68', colorSub: '#ffe4e8' };
export const priorityHigh: SelectOption = { code: '02', name: '높음', colorMain: '#f2994a', colorSub: '#fef1e6' };
export const priorityMedium: SelectOption = { code: '03', name: '보통', colorMain: '#2d9cdb', colorSub: '#e8f4fc' };
export const priorityLow: SelectOption = { code: '04', name: '낮음', colorMain: '#8d99a8', colorSub: '#f8f9fb' };

// Sample Statuses
export const statusWaiting: SelectOption = { code: '01', name: '대기', colorMain: '#8d99a8', colorSub: '#f8f9fb' };
export const statusInProgress: SelectOption = { code: '02', name: '진행', colorMain: '#2d9cdb', colorSub: '#e8f4fc' };
export const statusCompleted: SelectOption = { code: '03', name: '완료', colorMain: '#6fcf97', colorSub: '#eef9f2' };

export const prioritySelect = [
  priorityUrgent, priorityHigh, priorityMedium, priorityLow
];

export const statusSelect = [
  statusWaiting, statusInProgress, statusCompleted,
];
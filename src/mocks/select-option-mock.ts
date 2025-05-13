import { SelectOption } from "../types/type";

// Sample Priorities
export const priorityUrgent: SelectOption = { code: '01', name: '긴급', colorMain: '#f63d68', colorSub: '#ffe4e8' };
export const priorityHigh: SelectOption = { code: '02', name: '높음', colorMain: '#f2994a', colorSub: '#fef1e6' };
export const priorityMedium: SelectOption = { code: '03', name: '보통', colorMain: '#2d9cdb', colorSub: '#e8f4fc' };
export const priorityLow: SelectOption = { code: '04', name: '낮음', colorMain: '#8d99a8', colorSub: '#f8f9fb' };

// Sample Statuses
export const statusWaiting: SelectOption = { code: '01', name: '대기', colorMain: '#5F6B7A', colorSub: '#EEF1F6' };
export const statusInProgress: SelectOption = { code: '02', name: '진행', colorMain: '#16B364', colorSub: '#D1FADF' };
export const statusCompleted: SelectOption = { code: '03', name: '완료', colorMain: '#0BA5EC', colorSub: '#E0F2FE' };

export const prioritySelect = [
  priorityUrgent, priorityHigh, priorityMedium, priorityLow
];

export const statusSelect = [
  statusWaiting, statusInProgress, statusCompleted,
];

export const option1: SelectOption = { code: '01', name: '옵선1', colorMain: '#FFE6EB', colorSub: '#FFEFF2' };
export const option2: SelectOption = { code: '02', name: '옵선2옵선2', colorMain: '#FFEAD5', colorSub: '#FFF6ED' };
export const option3: SelectOption = { code: '03', name: '옵선3옵선3옵선3', colorMain: '#E4F8B4', colorSub: '#F5FFDE' };
export const option4: SelectOption = { code: '04', name: '옵선4옵선4옵선4옵선4', colorMain: '#D1FADF', colorSub: '#ECFDF3' };
export const option5: SelectOption = { code: '05', name: '옵선5옵선5옵선5옵선5옵선5', colorMain: '#D2FCEE', colorSub: '#E6FFF7' };
export const option6: SelectOption = { code: '06', name: '옵선6옵선6옵선6옵선6옵선6', colorMain: '#F0F9FF', colorSub: '#E0F2FE' };
export const option7: SelectOption = { code: '07', name: '옵선7옵선7옵선7옵선7', colorMain: '#E4E8EE', colorSub: '#F8F9FB' };
export const option8: SelectOption = { code: '08', name: '옵선8옵선8옵선8', colorMain: '#D8DCEC', colorSub: '#EAECF5' };
export const option9: SelectOption = { code: '09', name: '옵선9옵선9', colorMain: '#E1DDFE', colorSub: '#EDE9FE' };
export const option10: SelectOption = { code: '10', name: '옵선10', colorMain: '#EFE8D3', colorSub: '#F5F3EA' };

export const options: SelectOption[] = [
  option1, option2, option3, option4, option5, option6, option7, option8, option9, option10,
]
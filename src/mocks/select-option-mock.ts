import { SelectOption, SelectableOption } from "../types/type";

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

export const option1: SelectableOption = { code: '01', name: '옵선1', colorMain: '#FFE6EB', colorSub: '#FFEFF2', isSelected: false };
export const option2: SelectableOption = { code: '02', name: '옵선2옵선2', colorMain: '#FFEAD5', colorSub: '#FFF6ED', isSelected: true };
export const option3: SelectableOption = { code: '03', name: '옵선3옵선3옵선3', colorMain: '#E4F8B4', colorSub: '#F5FFDE', isSelected: false };
export const option4: SelectableOption = { code: '04', name: '옵선4옵선4옵선4옵선4', colorMain: '#D1FADF', colorSub: '#ECFDF3', isSelected: true };
export const option5: SelectableOption = { code: '05', name: '옵선5옵선5옵선5옵선5옵선5', colorMain: '#D2FCEE', colorSub: '#E6FFF7', isSelected: true };
export const option6: SelectableOption = { code: '06', name: '옵선6옵선6옵선6옵선6옵선6', colorMain: '#F0F9FF', colorSub: '#E0F2FE', isSelected: false };
export const option7: SelectableOption = { code: '07', name: '옵선7옵선7옵선7옵선7', colorMain: '#E4E8EE', colorSub: '#F8F9FB', isSelected: false };
export const option8: SelectableOption = { code: '08', name: '옵선8옵선8옵선8', colorMain: '#D8DCEC', colorSub: '#EAECF5', isSelected: true };
export const option9: SelectableOption = { code: '09', name: '옵선9옵선9', colorMain: '#E1DDFE', colorSub: '#EDE9FE', isSelected: false };
export const option10: SelectableOption = { code: '10', name: '옵선10', colorMain: '#EFE8D3', colorSub: '#F5F3EA', isSelected: true };

export const options: SelectableOption[] = [
  option1, option2, option3, option4, option5, option6, option7, option8, option9, option10,
]

export const singleOption1: SelectableOption = { code: '01', name: '옵선1', colorMain: '#FFE6EB', colorSub: '#FFEFF2', isSelected: false };
export const singleOption2: SelectableOption = { code: '02', name: '옵선2옵선2', colorMain: '#FFEAD5', colorSub: '#FFF6ED', isSelected: false };
export const singleOption3: SelectableOption = { code: '03', name: '옵선3옵선3옵선3', colorMain: '#E4F8B4', colorSub: '#F5FFDE', isSelected: false };
export const singleOption4: SelectableOption = { code: '04', name: '옵선4옵선4옵선4옵선4', colorMain: '#D1FADF', colorSub: '#ECFDF3', isSelected: false };
export const singleOption5: SelectableOption = { code: '05', name: '옵선5옵선5옵선5옵선5옵선5', colorMain: '#D2FCEE', colorSub: '#E6FFF7', isSelected: false };
export const singleOption6: SelectableOption = { code: '06', name: '옵선6옵선6옵선6옵선6옵선6', colorMain: '#F0F9FF', colorSub: '#E0F2FE', isSelected: false };
export const singleOption7: SelectableOption = { code: '07', name: '옵선7옵선7옵선7옵선7', colorMain: '#E4E8EE', colorSub: '#F8F9FB', isSelected: false };
export const singleOption8: SelectableOption = { code: '08', name: '옵선8옵선8옵선8', colorMain: '#D8DCEC', colorSub: '#EAECF5', isSelected: false };
export const singleOption9: SelectableOption = { code: '09', name: '옵선9옵선9', colorMain: '#E1DDFE', colorSub: '#EDE9FE', isSelected: false };
export const singleOption10: SelectableOption = { code: '10', name: '옵선10', colorMain: '#EFE8D3', colorSub: '#F5F3EA', isSelected: false };

export const singleOptions: SelectableOption[] = [
  singleOption1, singleOption2, singleOption3, singleOption4, singleOption5, singleOption6, singleOption7, singleOption8, singleOption9, singleOption10
]
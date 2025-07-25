export const DATE_PICKER_STYLE = `
.datepicker-dropdown-panel {
  position: absolute;
  z-index: 1001;
}

.datepicker-dropdown-panel .datetime-picker-container {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px 24px;
  background-color: #fff;
  width: 296px;
  box-shadow: 0px 0px 16px 0px #00000014;
  box-sizing: border-box;
}

/* 상단 선택 정보 */
.datepicker-dropdown-panel .datetime-picker-container .selected-info {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row {
  gap: 8px;
  width: 100%;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row.separate {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row>div:has(.date-input),
.datepicker-dropdown-panel .datetime-picker-container .date-time-row>.time-placeholder,
.datepicker-dropdown-panel .datetime-picker-container .date-time-row>.time-select-container {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .date-input {
  padding: 8px 12px;
  padding-right: 30px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: white;
  width: 100%;
  height: 36px;
  min-width: 0;
  box-sizing: border-box;
  font-weight: 400;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .date-input:focus {
  outline: none;
  border: none;
  border: 1px solid rgba(228, 232, 238, 1);
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .clear-date-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #d3d8e0;
  border-radius: 50%;
  z-index: 1;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .time-placeholder {
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(141, 153, 168, 1);
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  width: 100%;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  background-color: white;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .date-input.select {
  background-color: #fff;
  color: #333;
  border-color: #a0a0a0;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .time-select-combined {
  flex-grow: 1;
  padding: 0 8px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
  height: 36px;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  cursor: pointer;
  color: #0F1B2A;
  ;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpolyline%20points%3D%221%2C1%205%2C5%209%2C1%22%20stroke%3D%22%23666666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: .5rem auto;
}

.datepicker-dropdown-panel .datetime-picker-container .date-time-row .time-select-combined {
  outline: none;
  border: none;
  border: 1px solid rgba(228, 232, 238, 1);
}

/* 달력 헤더 */
.datepicker-dropdown-panel .datetime-picker-container .calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 18px;
  color: #36363D;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-header .nav-button {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-header .nav-button:hover {
  color: #000;
}

/* 요일 헤더 */
.datepicker-dropdown-panel .datetime-picker-container .calendar-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-days-header .day-label {
  font-size: 14px;
  font-weight: 400;
  text-align: center;
}

/* 날짜 셀 그리드 */
.datepicker-dropdown-panel .datetime-picker-container .calendar-body {
  display: flex;
  flex-direction: column;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  text-align: center;
  cursor: pointer;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 400;
  position: relative;
  transition: background-color 0.2s ease, color 0.2s ease;
  margin: 1px;
  box-sizing: border-box;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell span {
  position: relative;
  z-index: 2;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell:not(.disabled):hover {
  background-color: #eee;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.other-month {
  color: #ccc;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.disabled {
  cursor: not-allowed;
  color: #ccc;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.disabled:hover {
  background-color: transparent;
}


.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.start-date,
.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.end-date {
  background-color: #16B364;
  color: white;
  font-weight: 400;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.single-date {
  background-color: #16B364;
  color: white;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.start-date-in-range {
  color: #16B364;
  border: 1px solid #16B364;
  font-weight: 400;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.other-month.in-range {
  color: #16B364;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.other-month.start-date,
.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.other-month.end-date {
  color: white;
}

.datepicker-dropdown-panel .datetime-picker-container .calendar-body .calendar-cell.in-range {
  background-color: #D1FADF;
  color: #16B364;
  border-radius: 50%;
}
/* 하단 토글 섹션 */
.datepicker-dropdown-panel .datetime-picker-container .toggle-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E4E8EE;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .toggle-item label:first-child {
  font-weight: 400;
  font-size: 13px;
  color: #36363D;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E4E8EE;
  -webkit-transition: .4s;
  transition: .4s;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  top: 3px;
  left: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  box-shadow: 0px 0px 4px 0px #00000029;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section input:checked+.slider {
  border-color: #bdbdbd;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section input:checked+.slider.green {
  background-color: #16B364;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section input:checked+.slider:before {
  -webkit-transform: translate(19px);
  -ms-transform: translate(19px);
  transform: translateX(19px);
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .slider.round {
  border-radius: 12px;
}

.datepicker-dropdown-panel .datetime-picker-container .toggle-section .slider.round:before {
  border-radius: 12px;
  box-shadow: 0px 0px 4px 0px #00000029;
}

.custom-time-select-container {
  position: relative; /* 옵션 목록 위치 지정을 위해 */
  width: 100%; /* 부모에 맞게 너비 조절 */
  min-width: 0; /* flex-grow와 함께 사용 시 */
  flex-grow: 1; /* 부모 flex 컨테이너 내에서 공간 차지 */
  box-sizing: border-box;
}

/* 드롭다운 트리거 (현재 선택된 시간 표시되는 부분) */
.custom-select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
  height: 36px;
  cursor: pointer;
  color: #0F1B2A;
  white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트 ... 처리 */
}

/* 화살표 아이콘 (CSS로 만들거나 SVG 사용) */
.custom-select-trigger .custom-select-arrow-icon {
  width: 10px;
  height: 6px;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpolyline%20points%3D%221%2C1%205%2C5%209%2C1%22%20stroke%3D%22%23666666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-left: 8px; /* 텍스트와 화살표 사이 간격 */
}

/* 드롭다운 옵션 목록 컨테이너 */
.custom-select-options {
  position: absolute;
  top: 50%; /* 트리거 바로 아래에 위치 */
  left: 90%;
  width: 152px;
  max-height: 196px; /* 최대 높이 설정 (스크롤바를 위해) */
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
  border-radius: 4px;
  padding: 8px 0px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  z-index: 1000; /* 다른 요소 위에 표시되도록 */
}

.custom-select-options ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-select-options li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #0F1B2A;
}

.custom-select-options li:hover {
  background-color: #f0f0f0; /* 호버 시 배경색 */
}

.custom-select-options li.selected {
  background-color: #ECFDF3; /* 선택된 항목 배경색 */
}

/* 스크롤바 커스터마이징 (Webkit 브라우저 - Chrome, Safari 등) */
.custom-select-options::-webkit-scrollbar {
  width: 5px; /* gantt-scrollbar-y와 동일하게 5px */
  height: 0px; /* 세로 스크롤바이므로 가로는 0 */
}

.custom-select-options::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2); /* gantt-scrollbar-y와 동일 */
  border-radius: 3px; /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.1); /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-track {
  /* gantt-scrollbar-y는 track에 border-radius만 있지만, 보통 track도 배경색을 가집니다. */
  /* 필요에 따라 track 배경색을 추가하거나 제거하세요. */
  background-color: transparent; /* 트랙 배경색을 투명하게 설정하여 더 깔끔하게 보일 수 있습니다. */
  border-radius: 10px; /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-button {
  display: none; /* gantt-scrollbar-y와 동일 */
}
`


export const SPEECH_BUBBLE_TOOLTIP_STYLE = `
.speech-bubble-tooltip {
  position: relative;
  width: fit-content;
  height: fit-content;
  background-color: #4A4A52;
  border-radius: 2px;
  padding: 6px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 400;
  text-align: center;
  line-height: 130%;
}

.speech-bubble-tooltip::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
}

/* 위쪽 회살표 */
.speech-bubble-tooltip-top::before {
  top: -6px;
  left: var(--arrow-offset, 50%);
  transform: translateX(-50%);
  border-bottom: 7px solid #4A4A52;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

/* 아래쪽 화살표 */
.speech-bubble-tooltip-bottom::before {
  bottom: -6px;
  left: var(--arrow-offset, 50%);
  transform: translateX(-50%);
  border-top: 7px solid #4A4A52;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

/* 왼쪽 화살표 */
.speech-bubble-tooltip-left::before {
  left: -6px;
  top: var(--arrow-offset, 50%);
  transform: translateY(-50%);
  border-right: 7px solid #4A4A52;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 오른쪽 화살표 */
.speech-bubble-tooltip-right::before {
  right: -6px;
  top: var(--arrow-offset, 50%);
  transform: translateY(-50%);
  border-left: 7px solid #4A4A52;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}
`
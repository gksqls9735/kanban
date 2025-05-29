export type FileAttachment = {
  // 데이터베이스에서는 참고하는 작업이나 채팅 id 생성
  fileId: string;      // 서버에서 생성된 고유 파일 ID
  fileName: string;    // 원본 파일 이름
  fileUrl: string;     // 파일 접근/다운로드 URL
  fileType: string;
}

export type UrlData = {
  urlId: string
  title: string;
  requestedUrl: string;
  order: number;
}


export type MeasurementUnit =
  "숫자" | "퍼센트" | "KRW" |  "USD" | "EUR" | "JPY" | "CNY" | "사용자 지정 테이블" | "형식 없음";

export interface NumericField {
  value: number;
  unit: MeasurementUnit; // <--- 여기를 string에서 MeasurementUnit으로 변경
  decimalPlaces: number;
}
export type Email = {
  id: string;
  email: string;
  nickname: string;
  order: number;
}

/** 섹션 */
export type Section = {
  /** 섹션 아이디 */
  sectionId: string
  /** 섹션명 */
  sectionName: string
  /** 정렬순서 */
  order: number
  /** 토글 */
  isOpen?: boolean;
  /** 새 작업 확인 */
  isNew?: boolean;
}

export interface SectionGroup extends Section {
  tasks: Task[];
}


/**
 * 사용자
 * -> 기획서상 담당자의 프로필 이미지가 노출됨에 따라 프로필 이미지 추가 요청
 * -> 프로필 사진이 없는 경우 icon은 null
 */
export type User = {
  /** 사용자 아이디 */
  id: string
  /** 사용자 이름 */
  username: string
  /** 프로필 이미지 */
  icon: string | null
  /** 팀 명 */
  team: string
}

/** 담당자 */
export type Participant = User & {
  /** 주담당자 여부 */
  isMain: boolean
}

/**
 * 우선순위, 작업상태
 * -> 디폴트값 고정이 아니라 사용자가 커스텀할 수 있기에 아래처럼 변경 제안
 * -> colorMain은 글씨 색, colorSub는 배경 색 (배경색 없는 경우 null)
 */
export type SelectOption = {
  /** 코드 */
  code: string
  /** 이름 */
  name: string
  /** 메인 색 (텍스트) */
  colorMain: string
  /** 서브 색 (배경) */
  colorSub: string | null
}

/**
 * 다중 옵션 및 단일 옵션
 */
export type SelectableOption = SelectOption & {
  /** 선택한 옵션인지 아닌지 확인 */
  isSelected: boolean;
}

/**
 * 투두
 * -> 하나의 작업에 여러 투두가 존재
 * -> 투두에는 기한과 담당자(주, 부)가 있음
 */
export type Todo = {
  /** 작업 아이디 */
  taskId: string
  /** 투두 아이디 */
  todoId: string
  /** 투두 등록자 아이디 */
  todoOwner: string
  /** 완료 여부 */
  isCompleted: boolean
  /** 투두 내용 */
  todoTxt: string
  /** 기한 (null)*/
  todoDt: Date | null
  /** 담당자 */
  participants: Participant[]
  /** 정렬순서 */
  order: number
}

// --- Generated Task Data ---
export type Task = {
  /** 섹션 아이디 */
  sectionId: string
  /** 작업 아이디 */
  taskId: string
  /** 작업명(작업 제목) */
  taskName: string
  /** 작업 등록자 */
  taskOwner: User
  /** 시작일 */
  start: Date
  /** 종료일 */
  end: Date
  /** 우선순위 */
  priority: SelectOption
  /** 작업 상태 */
  status: SelectOption
  /** 가중치 */
  importance: number
  /** 진행률 */
  progress: number
  /** 투두 리스트 */
  todoList: Todo[]

  /** 관계성 아이디 리스트 */
  dependencies: string[]
  /** 담당자(주, 부) */
  participants: Participant[]
  /** 작업 그래프 색 */
  color: string
  /** 정렬순서 */
  order: number

  /** 작업 상세 컴포넌트 필요 */
  /** 작업 자체 첨부파일 목록 (추가) */
  taskAttachments?: FileAttachment[];
  /** 작업 참고 링크 */
  urls?: UrlData[];
  /** 다중 선택 옵션 */
  multiSelection?: SelectableOption[];
  /** 단일 선택 옵션 */
  singleSelection?: SelectableOption[];
  /** 숫자 필드 */
  numericField?: NumericField;
  /** Email */
  emails?: Email[];
  /** ID 접두사 */
  prefix?: string;
  /** 채팅 목록 */
  chatlist?: Chat[];

  /** 작업 상세 내용 */
  memo?: string
  /**  */
  depth?: number
  /**  */
  isNew?: boolean
}

/** 채팅 */
export type Chat = {
  chatId: string;
  taskId: string;
  parentChatId: string | null; // ✅ 최상위 채팅이면 null
  chatContent: string;
  user: User;
  createdAt: Date;
  likedUserIds: string[];
  attachments?: FileAttachment[];

  replies?: Chat[]; // ✅ 재귀 구조로 자식들 포함
};


export type Tooltip = {
  x: number;
  y: number;
  text: string;
  visible: boolean;
  startDate: string;
  endDate: string;
  status: string;
}

export interface TaskState {
  draggingTaskId: string | null;
  startX: number | null;
  initialTasks: Map<string, { start: Date; end: Date }>;
  isDragging: boolean;
  initialScrollLeft: number;
  resizing: {
    start: { taskId: string | null; initialDate: Date | null },
    end: { taskId: string | null; initialDate: Date | null },
    progress: { taskId: string | null; initialProgress: number | null },
  },
}

export type TaskAction =
  | { type: 'START_DRAG'; taskId: string, startX: number; initialTasks: Map<string, { start: Date; end: Date }>; initialScrollLeft: number }
  | { type: 'END_DRAG' }
  | { type: 'START_RESIZE'; resizeType: 'start' | 'end' | 'progress'; taskId: string; initialDate?: Date; initialProgress?: number; startX: number }
  | { type: 'END_RESIZE'; resizeType: 'start' | 'end' | 'progress' }
  | { type: 'SET_IS_DRAGGING'; isDragging: boolean }
  | { type: 'UPDATE_TASKS'; updatedTasks: Task[] };


export interface TaskBarHandlers {
  onMouseEnter: (e: React.MouseEvent, t: Task) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent, t: Task) => void;
  onClick: (e: React.MouseEvent, task: Task) => void;
  onContextMenu: (e: React.MouseEvent, t: Task) => void;
  onResizeStart: (e: React.MouseEvent, t: Task, type: "start" | "end" | "progress") => void;
  onDragStart: (startTaskId: string, x1: number, y1: number, isParent: boolean) => void;
}

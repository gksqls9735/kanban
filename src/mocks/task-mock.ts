import { Section, Task } from "../types/type";
import { options, priorityHigh, priorityLow, priorityMedium, priorityUrgent, singleOptions, statusCompleted, statusInProgress, statusWaiting } from "./select-option-mock";
import { chatlist, emails, exampleAttachments, numericExamples, urls } from "./task-detail-mock";
import { user1, user2, user3, user4, user5, user6, user7, user8 } from "./user-mock";

export const sections: Section[] = [
  {
    sectionId: 'SM202503191552000002',
    sectionName: '백엔드 개발',
    order: 3,
  },
  {
    sectionId: 'SM202503191552000003',
    sectionName: '프론트 개발',
    order: 2,
  },
  {
    sectionId: 'SM202503191552000004',
    sectionName: '기획',
    order: 0,
  },
  {
    sectionId: 'SM202503191552000005',
    sectionName: '디자인',
    order: 1,
  },
]

export const productLaunchSections: Section[] = [
  {
    sectionId: 'PL202505211105000001',
    sectionName: '시장 조사 및 기획',
    order: 0,
  },
  {
    sectionId: 'PL202505211105000002',
    sectionName: '프로토타입 및 UX/UI 설계',
    order: 1,
  },
  {
    sectionId: 'PL202505211105000003',
    sectionName: '핵심 기능 개발 (MVP)',
    order: 2,
  },
  {
    sectionId: 'PL202505211105000004',
    sectionName: '알파/베타 테스트',
    order: 3,
  },
  {
    sectionId: 'PL202505211105000005',
    sectionName: '마케팅 및 출시 준비',
    order: 4,
  },
  {
    sectionId: 'PL202505211105000006',
    sectionName: '공식 출시',
    order: 5,
  },
  {
    sectionId: 'PL202505211105000007',
    sectionName: '출시 후 안정화 및 피드백 반영',
    order: 6,
  },
];

export const departmentSections: Section[] = [
  {
    sectionId: 'DP202505211035000001',
    sectionName: '개발팀',
    order: 2,
  },
  {
    sectionId: 'DP202505211035000002',
    sectionName: '기획팀',
    order: 0,
  },
  {
    sectionId: 'DP202505211035000003',
    sectionName: '디자인팀',
    order: 1,
  },
  {
    sectionId: 'DP202505211035000004',
    sectionName: '마케팅팀',
    order: 3,
  },
  {
    sectionId: 'DP202505211035000005',
    sectionName: '영업팀',
    order: 4,
  },
  {
    sectionId: 'DP202505211035000006',
    sectionName: '인사팀',
    order: 5,
  },
  {
    sectionId: 'DP202505211035000007',
    sectionName: '재무팀',
    order: 6,
  },
];

export const sectionTasks: Task[] = [
  // --- Section: 기획 (SM202503191552000004) ---
  {
    sectionId: 'SM202503191552000004',
    taskId: 'SD202504101001000001',
    taskName: '시장 조사 및 경쟁사 분석',
    taskOwner: user1,
    start: new Date('2025-04-15T09:00:00'), // 변경 없음 (선행 작업 없음)
    end: new Date('2025-04-20T18:00:00'),   // 변경 없음
    priority: priorityHigh,
    status: statusInProgress,
    importance: 1,
    progress: 40,
    todoList: [
      { taskId: 'SD202504101001000001', todoId: 'ST202504101002000001', todoOwner: 'test05', isCompleted: true, todoTxt: '경쟁사 기능 리스트업', todoDt: new Date('2025-04-16'), participants: [{ ...user5, isMain: true }], order: 1 },
      { taskId: 'SD202504101001000001', todoId: 'ST202504101002000002', todoOwner: 'test05', isCompleted: false, todoTxt: '타겟 사용자 설문 조사 초안 작성', todoDt: new Date('2025-04-18'), participants: [{ ...user5, isMain: true }], order: 2 },
      { taskId: 'SD202504101001000001', todoId: 'ST202504101002000003', todoOwner: 'test05', isCompleted: false, todoTxt: '설문 조사', todoDt: new Date('2025-04-19'), participants: [{ ...user5, isMain: true }], order: 3 },
    ],
    dependencies: [],
    participants: [{ ...user5, isMain: true }, { ...user3, isMain: false }],
    color: '#FFB6C1', // LightPink
    sectionOrder: 0,
    statusOrder: 0,
    memo: '주요 경쟁사 3곳 선정하여 심층 분석 필요',
    taskAttachments: [
      exampleAttachments[0],
      exampleAttachments[1],
      exampleAttachments[2],
      exampleAttachments[3],
      exampleAttachments[4],
    ],
    urls: urls,
    multiSelection: options,
    singleSelection: singleOptions,
    numericField: numericExamples[0],
    emails: emails,
    prefix: 'IT',
    chatlist: chatlist,
  },
  {
    sectionId: 'SM202503191552000004',
    taskId: 'SD202504101001000002',
    taskName: '요구사항 정의서 작성',
    taskOwner: user2,
    start: new Date('2025-04-21T09:00:00'), // 선행(SD...01) 종료(04-20) 다음 날 (변경 없음)
    end: new Date('2025-04-25T18:00:00'),   // 시작일 + 원래 기간(5일)
    priority: priorityUrgent,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [
      { taskId: 'SD202504101001000002', todoId: 'ST202504101003000001', todoOwner: 'test05', isCompleted: false, todoTxt: '주요 기능 목록화', todoDt: new Date('2025-04-22'), participants: [{ ...user5, isMain: true }], order: 1 },
      { taskId: 'SD202504101001000002', todoId: 'ST202504101003000002', todoOwner: 'test05', isCompleted: false, todoTxt: '비기능적 요구사항 정의', todoDt: new Date('2025-04-24'), participants: [{ ...user5, isMain: true }], order: 2 },
    ],
    dependencies: ['SD202504101001000001'],
    participants: [{ ...user5, isMain: true }, { ...user1, isMain: false }, { ...user2, isMain: false }, { ...user3, isMain: false },
    { ...user4, isMain: false }, { ...user6, isMain: false }, { ...user7, isMain: false }, { ...user8, isMain: false }
    ],
    color: '#FFB6C1', // LightPink
    sectionOrder: 1,
    statusOrder: 0,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000004',
    taskId: 'SD202504101001000003',
    taskName: '서비스 정책 수립',
    taskOwner: user5,
    start: new Date('2025-04-26T09:00:00'), // 선행(SD...02) 종료(04-25) 다음 날
    end: new Date('2025-04-30T18:00:00'),   // 시작일 + 원래 기간(5일)
    priority: priorityMedium,
    status: statusWaiting,
    importance: 2,
    progress: 0,
    todoList: [],
    dependencies: ['SD202504101001000002'],
    participants: [{ ...user5, isMain: true }, { ...user1, isMain: false }],
    color: '#FFB6C1', // LightPink
    sectionOrder: 2,
    statusOrder: 1,
    memo: '개인정보 처리 방침, 이용 약관 등 검토',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000004',
    taskId: 'SD202504101001000004',
    taskName: 'end null-1',
    taskOwner: user5,
    start: new Date('2025-04-26T09:00:00'), // 선행(SD...02) 종료(04-25) 다음 날
    end: null,   // 시작일 + 원래 기간(5일)
    priority: priorityMedium,
    status: statusWaiting,
    importance: 2,
    progress: 0,
    todoList: [],
    dependencies: [],
    participants: [{ ...user5, isMain: true }, { ...user1, isMain: false }],
    color: '#FFB6C1', // LightPink
    sectionOrder: 3,
    statusOrder: 7,
    memo: 'end null-1 test',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000004',
    taskId: 'SD202504101001000005',
    taskName: 'end null-2',
    taskOwner: user5,
    start: new Date('2025-04-30T09:00:00'), // 선행(SD...02) 종료(04-25) 다음 날
    end: null,   // 시작일 + 원래 기간(5일)
    priority: priorityMedium,
    status: statusWaiting,
    importance: 2,
    progress: 0,
    todoList: [],
    dependencies: [],
    participants: [{ ...user5, isMain: true }, { ...user1, isMain: false }],
    color: '#FFB6C1', // LightPink
    sectionOrder: 4,
    statusOrder: 8,
    memo: 'end null-2 test',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },

  // --- Section: 디자인 (SM202503191552000005) ---
  {
    sectionId: 'SM202503191552000005',
    taskId: 'SD202504101005000001',
    taskName: '디자인 컨셉 및 무드보드 제작',
    taskOwner: user6,
    start: new Date('2025-04-21T09:00:00'), // 선행(SD...01) 종료(04-20) 다음 날
    end: new Date('2025-04-25T18:00:00'),   // 시작일 + 원래 기간(5일)
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [
      { taskId: 'SD202504101005000001', todoId: 'ST202504101006000001', todoOwner: 'test06', isCompleted: false, todoTxt: '레퍼런스 수집', todoDt: new Date('2025-04-23'), participants: [{ ...user6, isMain: true }], order: 1 },
      { taskId: 'SD202504101005000001', todoId: 'ST202504101006000002', todoOwner: 'test06', isCompleted: false, todoTxt: '무드보드 시안 2개 제작', todoDt: new Date('2025-04-25'), participants: [{ ...user6, isMain: true }], order: 2 },
    ],
    dependencies: ['SD202504101001000001'],
    participants: [{ ...user6, isMain: true }, { ...user7, isMain: false }],
    color: '#98FB98', // PaleGreen
    sectionOrder: 0,
    statusOrder: 2,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',

  },
  {
    sectionId: 'SM202503191552000005',
    taskId: 'SD202504101005000002',
    taskName: '와이어프레임 설계',
    taskOwner: user6,
    start: new Date('2025-04-26T09:00:00'), // 선행(SD...02) 종료(04-25) 다음 날
    end: new Date('2025-05-03T18:00:00'),   // 시작일 + 원래 기간(8일)
    priority: priorityUrgent,
    status: statusWaiting,
    importance: 2,
    progress: 0,
    todoList: [
      { taskId: 'SD202504101005000002', todoId: 'ST202504101007000001', todoOwner: 'test06', isCompleted: false, todoTxt: '주요 화면 IA 설계', todoDt: new Date('2025-04-29'), participants: [{ ...user6, isMain: true }], order: 1 },
      { taskId: 'SD202504101005000002', todoId: 'ST202504101007000002', todoOwner: 'test06', isCompleted: false, todoTxt: '화면별 와이어프레임 스케치', todoDt: new Date('2025-05-02'), participants: [{ ...user6, isMain: true }], order: 2 },
    ],
    dependencies: ['SD202504101001000002'],
    participants: [{ ...user6, isMain: true }, { ...user5, isMain: false }, { ...user7, isMain: false }],
    color: '#98FB98', // PaleGreen
    sectionOrder: 1,
    statusOrder: 3,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000005',
    taskId: 'SD202504101005000003',
    taskName: 'UI 디자인 및 프로토타입 제작',
    taskOwner: user6,
    start: new Date('2025-05-04T09:00:00'), // 선행(SD...02 WF) 종료(05-03) 다음 날
    end: new Date('2025-05-13T18:00:00'),   // 시작일 + 원래 기간(10일)
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1.5,
    progress: 0,
    todoList: [
      { taskId: 'SD202504101005000003', todoId: 'ST202504101008000001', todoOwner: 'test06', isCompleted: false, todoTxt: '주요 화면 UI 디자인', todoDt: new Date('2025-05-10'), participants: [{ ...user6, isMain: true }], order: 1 },
      { taskId: 'SD202504101005000003', todoId: 'ST202504101008000002', todoOwner: 'test06', isCompleted: false, todoTxt: '인터랙션 정의 및 프로토타이핑', todoDt: new Date('2025-05-12'), participants: [{ ...user6, isMain: true }], order: 2 },
    ],
    dependencies: ['SD202504101005000002'],
    participants: [{ ...user6, isMain: true }, { ...user7, isMain: false }, { ...user8, isMain: false }],
    color: '#98FB98', // PaleGreen
    sectionOrder: 2,
    statusOrder: 4,
    memo: 'Figma 활용하여 디자인 및 프로토타입 제작',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },

  // --- Section: 프론트 개발 (SM202503191552000003) ---
  {
    sectionId: 'SM202503191552000003',
    taskId: 'SD202504101010000001',
    taskName: '프로젝트 초기 설정 및 구조 설계',
    taskOwner: user7,
    start: new Date('2025-05-01T09:00:00'), // 변경 없음 (선행 작업 없음, 임의 시작일)
    end: new Date('2025-05-03T18:00:00'),   // 변경 없음
    priority: priorityLow,
    status: statusCompleted, // progress 100% 이므로 Completed 로 변경
    importance: 2,
    progress: 100,
    todoList: [
      { taskId: 'SD202504101010000001', todoId: 'ST202504101011000001', todoOwner: 'test07', isCompleted: true, todoTxt: 'React + TypeScript 프로젝트 생성', todoDt: new Date('2025-05-01'), participants: [{ ...user7, isMain: true }], order: 1 },
      { taskId: 'SD202504101010000001', todoId: 'ST202504101011000002', todoOwner: 'test07', isCompleted: true, todoTxt: '폴더 구조 및 기본 컴포넌트 설계', todoDt: new Date('2025-05-02'), participants: [{ ...user7, isMain: true }], order: 2 },
    ],
    dependencies: [],
    participants: [{ ...user7, isMain: true }, { ...user4, isMain: false }],
    color: '#ADD8E6', // LightBlue
    sectionOrder: 0,
    statusOrder: 0,
    taskAttachments: [
      exampleAttachments[0],
      exampleAttachments[1],
      exampleAttachments[2],
      exampleAttachments[3],
      exampleAttachments[4],
    ],
    urls: urls,
    multiSelection: options,
    singleSelection: singleOptions,
    numericField: numericExamples[0],
    emails: emails,
    prefix: 'IT',
    chatlist: chatlist,
  },
  {
    sectionId: 'SM202503191552000003',
    taskId: 'SD202504101010000004', // 순서 조정: 공통 컴포넌트가 먼저 개발되는게 일반적
    taskName: '공통 컴포넌트 라이브러리 구축',
    taskOwner: user7,
    start: new Date('2025-05-04T09:00:00'), // 선행(SD...01 FE Init) 종료(05-03) 다음 날
    end: new Date('2025-05-10T18:00:00'),   // 시작일 + 원래 기간(7일)
    priority: priorityMedium,
    status: statusCompleted,
    importance: 1.5,
    progress: 100,
    todoList: [
      { taskId: 'SD202504101010000004', todoId: 'ST202504101013000001', todoOwner: 'test07', isCompleted: true, todoTxt: '버튼 컴포넌트 구현', todoDt: new Date('2025-05-07'), participants: [{ ...user7, isMain: true }], order: 1 },
      { taskId: 'SD202504101010000004', todoId: 'ST202504101013000002', todoOwner: 'test07', isCompleted: true, todoTxt: '모달 컴포넌트 구현', todoDt: new Date('2025-05-09'), participants: [{ ...user7, isMain: true }], order: 2 },
      { taskId: 'SD202504101010000004', todoId: 'ST202504101013000003', todoOwner: 'test07', isCompleted: true, todoTxt: 'Storybook 연동', todoDt: new Date('2025-05-08'), participants: [{ ...user7, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101010000001'],
    participants: [{ ...user7, isMain: true }, { ...user4, isMain: false }],
    color: '#ADD8E6', // LightBlue
    sectionOrder: 1, // 순서 변경
    statusOrder: 1,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000003',
    taskId: 'SD202504101010000002',
    taskName: '로그인/회원가입 UI 개발',
    taskOwner: user7,
    // 선행: UI 디자인(SD...03 Design, 05-13 종료), 인증 API(SD...02 BE Auth, 아래 계산: 05-14 종료)
    start: new Date('2025-05-15T09:00:00'), // 더 늦은 선행(BE Auth) 종료(05-14) 다음 날
    end: new Date('2025-05-21T18:00:00'),   // 시작일 + 원래 기간(7일)
    priority: priorityUrgent,
    status: statusInProgress,
    importance: 1,
    progress: 60,
    todoList: [
      { taskId: 'SD202504101010000002', todoId: 'ST202504101012000001', todoOwner: 'test07', isCompleted: true, todoTxt: '로그인 화면 퍼블리싱', todoDt: new Date('2025-05-18'), participants: [{ ...user7, isMain: true }], order: 1 },
      { taskId: 'SD202504101010000002', todoId: 'ST202504101012000002', todoOwner: 'test07', isCompleted: false, todoTxt: '회원가입 폼 구현', todoDt: new Date('2025-05-20'), participants: [{ ...user7, isMain: true }], order: 2 },
      { taskId: 'SD202504101010000002', todoId: 'ST202504101012000003', todoOwner: 'test07', isCompleted: false, todoTxt: 'API 연동 (로그인)', todoDt: new Date('2025-05-17'), participants: [{ ...user7, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101005000003', 'SD202504101015000002'],
    participants: [{ ...user7, isMain: true }],
    color: '#ADD8E6', // LightBlue
    sectionOrder: 2, // 순서 변경
    statusOrder: 1,
    memo: '소셜 로그인 기능은 추후 구현 예정',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000003',
    taskId: 'SD202504101010000003',
    taskName: '메인 대시보드 UI 개발',
    taskOwner: user4,
    start: new Date('2025-05-14T09:00:00'), // 선행(SD...03 Design) 종료(05-13) 다음 날
    end: new Date('2025-05-21T18:00:00'),   // 시작일 + 원래 기간(8일)
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['SD202504101005000003'],
    participants: [{ ...user4, isMain: true }, { ...user7, isMain: false }],
    color: '#ADD8E6', // LightBlue
    sectionOrder: 3, // 순서 변경
    statusOrder: 5,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },


  // --- Section: 백엔드 개발 (SM202503191552000002) ---
  {
    sectionId: 'SM202503191552000002',
    taskId: 'SD202503191553000001',
    taskName: 'DB 분석 및 테스트 데이터 생성',
    taskOwner: user1,
    start: new Date('2025-04-26T09:00:00'), // 선행(SD...02 Req) 종료(04-25) 다음 날 (원래 날짜 무시하고 규칙 적용)
    end: new Date('2025-04-30T18:00:00'),   // 시작일 + 원래 기간(5일)
    priority: priorityUrgent,
    status: statusCompleted,
    importance: 1,
    progress: 100,
    todoList: [
      { taskId: 'SD202503191553000001', todoId: 'ST202503271341000002', todoOwner: 'test01', isCompleted: true, todoTxt: 'DB 스키마 분석', todoDt: new Date('2025-04-27'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202503191553000001', todoId: 'ST202503271341000003', todoOwner: 'test01', isCompleted: true, todoTxt: '테스트 데이터 생성 스크립트 작성', todoDt: new Date('2025-04-29'), participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }], order: 2 }
    ],
    dependencies: ['SD202504101001000002'],
    participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }, { ...user1, isMain: false }],
    color: '#73D5F6',
    sectionOrder: 0,
    statusOrder: 2,
    memo: 'ERD 기반으로 분석 완료. 더미 데이터 1000건 생성.',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000002',
    taskId: 'SD202504101015000001',
    taskName: 'API 서버 환경 설정',
    taskOwner: user8,
    start: new Date('2025-05-01T09:00:00'), // 선행(SD...01 DB) 종료(04-30) 다음 날
    end: new Date('2025-05-20T18:00:00'),   // 시작일 + 원래 기간(3일)
    priority: priorityHigh,
    status: statusInProgress,
    importance: 1,
    progress: 70,
    todoList: [
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000001', todoOwner: 'test08', isCompleted: true, todoTxt: 'Node.js + Express 프로젝트 초기화', todoDt: new Date('2025-05-11'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000002', todoOwner: 'test08', isCompleted: false, todoTxt: '데이터베이스 연결 설정', todoDt: new Date('2025-05-06'), participants: [{ ...user8, isMain: true }], order: 2 },
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000003', todoOwner: 'test08', isCompleted: false, todoTxt: 'ORM (TypeORM) 설정', todoDt: new Date('2025-05-15'), participants: [{ ...user8, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202503191553000001'],
    participants: [{ ...user8, isMain: true }],
    color: '#73D5F6',
    sectionOrder: 1,
    statusOrder: 2,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000002',
    taskId: 'SD202504101015000002',
    taskName: '사용자 인증 API 개발 (JWT 기반)',
    taskOwner: user8,
    start: new Date('2025-05-04T09:00:00'), // 선행(SD...01 BE Init) 종료(05-03) 다음 날
    end: new Date('2025-05-14T18:00:00'),   // 시작일 + 원래 기간(11일)
    priority: priorityUrgent,
    status: statusInProgress,
    importance: 1.5,
    progress: 30,
    todoList: [
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000001', todoOwner: 'test08', isCompleted: true, todoTxt: '회원가입 API 엔드포인트 구현', todoDt: new Date('2025-05-12'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000002', todoOwner: 'test08', isCompleted: false, todoTxt: '로그인 API 및 JWT 발급 구현', todoDt: new Date('2025-05-05'), participants: [{ ...user8, isMain: true }], order: 2 },
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000003', todoOwner: 'test08', isCompleted: false, todoTxt: '비밀번호 암호화 적용', todoDt: new Date('2025-05-07'), participants: [{ ...user8, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101015000001'],
    participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }],
    color: '#73D5F6',
    sectionOrder: 2,
    statusOrder: 3,
    memo: '보안 강화 위해 bcrypt 사용',
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000002',
    taskId: 'SD202504101015000003',
    taskName: '게시글 CRUD API 개발',
    taskOwner: user2,
    start: new Date('2025-05-04T09:00:00'), // 선행(SD...01 BE Init) 종료(05-03) 다음 날
    end: new Date('2025-05-11T18:00:00'),   // 시작일 + 원래 기간(8일)
    priority: priorityHigh,
    status: statusWaiting,
    importance: 0.5,
    progress: 0,
    todoList: [],
    dependencies: ['SD202504101015000001'],
    participants: [{ ...user2, isMain: true }, { ...user8, isMain: false }],
    color: '#73D5F6',
    sectionOrder: 3,
    statusOrder: 6,
    taskAttachments: [],
    urls: [],
    multiSelection: options,
    singleSelection: singleOptions,
    emails: emails,
    prefix: 'IT',
  },
];


// --- Generated Task Data for productLaunchSections ---
export const productLaunchTasks: Task[] = [
  // --- Section: 1. 시장 조사 및 기획 (PL202505211105000001) ---
  {
    sectionId: 'PL202505211105000001',
    taskId: 'PLT202506011000000001',
    taskName: '경쟁 제품 분석 및 요구사항 정의',
    taskOwner: user1,
    start: new Date('2025-06-03T09:00:00'),
    end: new Date('2025-06-14T18:00:00'),
    priority: priorityHigh,
    status: statusCompleted,
    importance: 1,
    progress: 100,
    todoList: [],
    dependencies: [], // 첫 작업이므로 의존성 없음
    participants: [{ ...user1, isMain: true }, { ...user6, isMain: false }],
    color: '#FEEBC8', // Orange
    sectionOrder: 0,
    statusOrder: 0,
    memo: '주요 경쟁사 5개사 분석 및 MVP 핵심 요구사항 문서화 완료.',
  },

  // --- Section: 2. 프로토타입 및 UX/UI 설계 (PL202505211105000002) ---
  {
    sectionId: 'PL202505211105000002',
    taskId: 'PLT202506011000000002',
    taskName: '와이어프레임 및 프로토타입 제작',
    taskOwner: user2,
    start: new Date('2025-06-17T09:00:00'), // 기획 완료 후 시작
    end: new Date('2025-06-28T18:00:00'),
    priority: priorityHigh,
    status: statusCompleted,
    importance: 1,
    progress: 100,
    todoList: [],
    dependencies: ['PLT202506011000000001'], // '요구사항 정의' 작업에 의존
    participants: [{ ...user2, isMain: true }, { ...user1, isMain: false }],
    color: '#C4F1F9', // Cyan
    sectionOrder: 0,
    statusOrder: 0,
    memo: 'Figma를 이용한 주요 화면 프로토타입 제작 및 내부 리뷰 완료.',
  },
  {
    sectionId: 'PL202505211105000002',
    taskId: 'PLT202506011000000003',
    taskName: 'UI 상세 디자인 및 디자인 시스템 구축',
    taskOwner: user2,
    start: new Date('2025-07-01T09:00:00'),
    end: new Date('2025-07-12T18:00:00'),
    priority: priorityMedium,
    status: statusInProgress,
    importance: 2,
    progress: 70,
    todoList: [],
    dependencies: ['PLT202506011000000002'], // '프로토타입 제작' 작업에 의존
    participants: [{ ...user2, isMain: true }, { ...user3, isMain: false }],
    color: '#C4F1F9', // Cyan
    sectionOrder: 1,
    statusOrder: 1,
  },

  // --- Section: 3. 핵심 기능 개발 (MVP) (PL202505211105000003) ---
  {
    sectionId: 'PL202505211105000003',
    taskId: 'PLT202506011000000004',
    taskName: '백엔드 API 및 데이터베이스 설계/개발',
    taskOwner: user4,
    start: new Date('2025-07-15T09:00:00'), // 디자인 완료 후 시작
    end: new Date('2025-08-09T18:00:00'),
    priority: priorityHigh,
    status: statusInProgress,
    importance: 1,
    progress: 30,
    todoList: [],
    dependencies: ['PLT202506011000000003'], // 'UI 디자인' 작업에 의존
    participants: [{ ...user4, isMain: true }],
    color: '#BEE3F8', // Blue
    sectionOrder: 0,
    statusOrder: 2,
  },
  {
    sectionId: 'PL202505211105000003',
    taskId: 'PLT202506011000000005',
    taskName: '프론트엔드 UI 컴포넌트 개발',
    taskOwner: user3,
    start: new Date('2025-07-22T09:00:00'), // 백엔드와 병렬로 진행 가능 (API 명세 확정 후)
    end: new Date('2025-08-16T18:00:00'),
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['PLT202506011000000003'], // 'UI 디자인' 작업에 의존
    participants: [{ ...user3, isMain: true }, { ...user2, isMain: false }],
    color: '#BEE3F8', // Blue
    sectionOrder: 1,
    statusOrder: 3,
  },

  // --- Section: 4. 알파/베타 테스트 (PL202505211105000004) ---
  {
    sectionId: 'PL202505211105000004',
    taskId: 'PLT202506011000000006',
    taskName: '통합 테스트 및 QA 진행',
    taskOwner: user5,
    start: new Date('2025-08-19T09:00:00'), // 개발 완료 후 시작
    end: new Date('2025-08-30T18:00:00'),
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['PLT202506011000000004', 'PLT202506011000000005'], // 백엔드, 프론트엔드 개발에 모두 의존
    participants: [{ ...user5, isMain: true }, { ...user3, isMain: false }, { ...user4, isMain: false }],
    color: '#C6F6D5', // Green
    sectionOrder: 0,
    statusOrder: 4,
  },

  // --- Section: 5. 마케팅 및 출시 준비 (PL202505211105000005) ---
  {
    sectionId: 'PL202505211105000005',
    taskId: 'PLT202506011000000007',
    taskName: '사전 등록 페이지 및 마케팅 컨텐츠 제작',
    taskOwner: user6,
    start: new Date('2025-08-05T09:00:00'), // 개발 막바지에 병렬로 진행
    end: new Date('2025-08-23T18:00:00'),
    priority: priorityMedium,
    status: statusInProgress,
    importance: 2,
    progress: 50,
    todoList: [],
    dependencies: ['PLT202506011000000003'], // 디자인 확정 후 진행
    participants: [{ ...user6, isMain: true }, { ...user2, isMain: false }],
    color: '#FED7D7', // Red
    sectionOrder: 0,
    statusOrder: 5,
  },

  // --- Section: 6. 공식 출시 (PL202505211105000006) ---
  {
    sectionId: 'PL202505211105000006',
    taskId: 'PLT202506011000000008',
    taskName: 'D-Day: 제품 공식 출시',
    taskOwner: user1,
    start: new Date('2025-09-02T10:00:00'), // QA 및 마케팅 준비 완료 후
    end: new Date('2025-09-02T12:00:00'), // 단기 이벤트성 작업
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['PLT202506011000000006', 'PLT202506011000000007'], // QA, 마케팅에 의존
    participants: [{ ...user1, isMain: true }, { ...user3, isMain: false }, { ...user4, isMain: false }, { ...user6, isMain: false }],
    color: '#D6BCFA', // Purple
    sectionOrder: 0,
    statusOrder: 6,
    memo: '서버 배포, 앱 스토어 공개, 보도자료 배포',
  },

  // --- Section: 7. 출시 후 안정화 및 피드백 반영 (PL202505211105000007) ---
  {
    sectionId: 'PL202505211105000007',
    taskId: 'PLT202506011000000009',
    taskName: '초기 사용자 피드백 수집 및 긴급 버그 수정',
    taskOwner: user1,
    start: new Date('2025-09-02T12:00:00'), // 출시 직후 시작
    end: new Date('2025-09-13T18:00:00'),
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['PLT202506011000000008'], // '공식 출시'에 의존
    participants: [{ ...user1, isMain: true }, { ...user3, isMain: false }, { ...user4, isMain: false }, { ...user5, isMain: false }],
    color: '#FBD38D', // Amber
    sectionOrder: 0,
    statusOrder: 7,
  },
];


// --- Generated Task Data for departmentSections (Corrected) ---
export const departmentTasks: Task[] = [
  // --- Section: 기획팀 (DP202505211035000002) ---
  {
    sectionId: 'DP202505211035000002',
    taskId: 'DPT202507011000000001',
    taskName: '3분기 신규 기능 상세 기획',
    taskOwner: user1,
    start: new Date('2025-07-01T09:00:00'),
    end: new Date('2025-07-12T18:00:00'),
    priority: priorityHigh,
    status: statusWaiting,
    // --- 추가된 속성 ---
    importance: 1,
    progress: 100,
    todoList: [],
    // ------------------
    dependencies: [], // 최상위 기획 작업
    participants: [{ ...user1, isMain: true }, { ...user3, isMain: false }], // 개발팀 리뷰 참여
    color: '#FEEBC8', // 기획팀 색상 (Orange)
    sectionOrder: 0,
    statusOrder: 0,
    memo: '로그인, 마이페이지, 공유하기 기능에 대한 PRD 문서 작성 완료.',
  },
  {
    sectionId: 'DP202505211035000002',
    taskId: 'DPT202507011000000002',
    taskName: '사용자 만족도 설문조사 및 분석',
    taskOwner: user1,
    start: new Date('2025-07-15T09:00:00'),
    end: new Date('2025-07-26T18:00:00'),
    priority: priorityMedium,
    status: statusInProgress,
    importance: 2,
    progress: 40,
    todoList: [],
    dependencies: [], // 독립적인 분석 업무
    participants: [{ ...user1, isMain: true }],
    color: '#FEEBC8', // 기획팀 색상 (Orange)
    sectionOrder: 1,
    statusOrder: 1,
  },

  // --- Section: 디자인팀 (DP202505211035000003) ---
  {
    sectionId: 'DP202505211035000003',
    taskId: 'DPT202507011000000003',
    taskName: '3분기 신규 기능 UI/UX 디자인',
    taskOwner: user2,
    start: new Date('2025-07-15T09:00:00'),
    end: new Date('2025-07-31T18:00:00'),
    priority: priorityHigh,
    status: statusInProgress,
    importance: 1,
    progress: 60,
    todoList: [],
    dependencies: ['DPT202507011000000001'], // '상세 기획'에 의존
    participants: [{ ...user2, isMain: true }, { ...user1, isMain: false }],
    color: '#C4F1F9', // 디자인팀 색상 (Cyan)
    sectionOrder: 0,
    statusOrder: 2,
    memo: '로그인, 마이페이지 프로토타입 완료. 공유하기 디자인 진행 중.',
  },

  // --- Section: 개발팀 (DP202505211035000001) ---
  {
    sectionId: 'DP202505211035000001',
    taskId: 'DPT202507011000000004',
    taskName: '신규 기능 개발 (BE)',
    taskOwner: user4,
    start: new Date('2025-08-01T09:00:00'),
    end: new Date('2025-08-23T18:00:00'),
    priority: priorityHigh,
    status: statusWaiting,
    importance: 1,
    progress: 0,
    todoList: [],
    dependencies: ['DPT202507011000000003'], // 'UI/UX 디자인'에 의존
    participants: [{ ...user4, isMain: true }],
    color: '#BEE3F8', // 개발팀 색상 (Blue)
    sectionOrder: 0,
    statusOrder: 3,
  },
  {
    sectionId: 'DP202505211035000001',
    taskId: 'DPT202507011000000005',
    taskName: '서버 아키텍처 개선',
    taskOwner: user3,
    start: new Date('2025-08-05T09:00:00'),
    end: new Date('2025-08-16T18:00:00'),
    priority: priorityMedium,
    status: statusWaiting,
    importance: 2,
    progress: 0,
    todoList: [],
    dependencies: [], // 내부 기술 개선 업무
    participants: [{ ...user3, isMain: true }, { ...user4, isMain: false }],
    color: '#BEE3F8', // 개발팀 색상 (Blue)
    sectionOrder: 1,
    statusOrder: 4,
  },

  // --- Section: 마케팅팀 (DP202505211035000004) ---
  {
    sectionId: 'DP202505211035000004',
    taskId: 'DPT202507011000000006',
    taskName: '가을 시즌 프로모션 기획 및 컨텐츠 제작',
    taskOwner: user5,
    start: new Date('2025-07-29T09:00:00'),
    end: new Date('2025-08-23T18:00:00'),
    priority: priorityMedium,
    status: statusInProgress,
    importance: 2,
    progress: 25,
    todoList: [],
    dependencies: [], // 마케팅팀 독립 업무
    participants: [{ ...user5, isMain: true }, { ...user2, isMain: false }], // 디자인팀 협업
    color: '#FED7D7', // 마케팅팀 색상 (Red)
    sectionOrder: 0,
    statusOrder: 5,
  },

  // --- Section: 영업팀 (DP202505211035000005) ---
  {
    sectionId: 'DP202505211035000005',
    taskId: 'DPT202507011000000007',
    taskName: '주요 고객사 대상 신규 기능 제안',
    taskOwner: user6,
    start: new Date('2025-07-22T09:00:00'),
    end: new Date('2025-08-09T18:00:00'),
    priority: priorityHigh,
    status: statusCompleted,
    importance: 1,
    progress: 100,
    todoList: [],
    dependencies: ['DPT202507011000000001'], // '상세 기획' 내용 기반으로 제안
    participants: [{ ...user6, isMain: true }],
    color: '#FAF089', // 영업팀 색상 (Yellow)
    sectionOrder: 0,
    statusOrder: 6,
  },

  // --- Section: 인사팀 (DP202505211035000006) ---
  {
    sectionId: 'DP202505211035000006',
    taskId: 'DPT202507011000000008',
    taskName: '하반기 경력직 채용 공고 게시 및 서류 검토',
    taskOwner: user7,
    start: new Date('2025-07-08T09:00:00'),
    end: new Date('2025-07-26T18:00:00'),
    priority: priorityMedium,
    status: statusCompleted,
    importance: 2,
    progress: 100,
    todoList: [],
    dependencies: [],
    participants: [{ ...user7, isMain: true }],
    color: '#C6F6D5', // 인사팀 색상 (Green)
    sectionOrder: 0,
    statusOrder: 7,
  },

  // --- Section: 재무팀 (DP202505211035000007) ---
  {
    sectionId: 'DP202505211035000007',
    taskId: 'DPT202507011000000009',
    taskName: '2분기 실적 마감 및 재무 보고서 작성',
    taskOwner: user8,
    start: new Date('2025-07-01T09:00:00'),
    end: new Date('2025-07-15T18:00:00'),
    priority: priorityHigh,
    status: statusCompleted,
    importance: 1,
    progress: 100,
    todoList: [],
    dependencies: [],
    participants: [{ ...user8, isMain: true }],
    color: '#E9D8FD', // 재무팀 색상 (Purple)
    sectionOrder: 0,
    statusOrder: 8,
  },
];
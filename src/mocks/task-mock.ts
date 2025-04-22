import { Section, Task } from "../types/type";
import { priorityHigh, priorityLow, priorityMedium, priorityUrgent, statusCompleted, statusInProgress, statusWaiting } from "./select-option-mock";
import { emails, exampleAttachments, urls } from "./task-detail-mock";
import { user1, user2, user3, user4, user5, user6, user7, user8 } from "./user-mock";

export const sections: Section[] = [
  {
    sectionId: 'SM202503191552000002',
    sectionName: '백엔드 개발',
    order: 4,
  },
  {
    sectionId: 'SM202503191552000003',
    sectionName: '프론트 개발',
    order: 3,
  },
  {
    sectionId: 'SM202503191552000004',
    sectionName: '기획',
    order: 1,
  },
  {
    sectionId: 'SM202503191552000005',
    sectionName: '디자인',
    order: 2,
  },
]


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
      { taskId: 'SD202504101001000001', todoId: 'ST202504101002000003', todoOwner: 'test05', isCompleted: false, todoTxt: '설문 조사', todoDt: new Date('2025-05-18'), participants: [{ ...user5, isMain: true }], order: 3 },
    ],
    dependencies: [],
    participants: [{ ...user5, isMain: true }, { ...user3, isMain: false }],
    color: '#FFB6C1', // LightPink
    order: 1,
    memo: '주요 경쟁사 3곳 선정하여 심층 분석 필요',
    taskAttachments: [
      exampleAttachments[0],
      exampleAttachments[1],
      exampleAttachments[2],
      exampleAttachments[3],
      exampleAttachments[4],
    ],
    urls: urls,
    emails: emails,
    prefix: 'IT',
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
    participants: [{ ...user5, isMain: true }, { ...user2, isMain: false }, { ...user1, isMain: false }, { ...user8, isMain: false }],
    color: '#FFB6C1', // LightPink
    order: 2,
    taskAttachments: [],
    urls: [],
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
    order: 3,
    memo: '개인정보 처리 방침, 이용 약관 등 검토',
    taskAttachments: [],
    urls: [],
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
    order: 1,
    taskAttachments: [],
    urls: [],
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
    order: 2,
    taskAttachments: [],
    urls: [],
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
      { taskId: 'SD202504101005000003', todoId: 'ST202504101008000002', todoOwner: 'test06', isCompleted: false, todoTxt: '인터랙션 정의 및 프로토타이핑', todoDt: new Date('2025-05-14'), participants: [{ ...user6, isMain: true }], order: 2 },
    ],
    dependencies: ['SD202504101005000002'],
    participants: [{ ...user6, isMain: true }, { ...user7, isMain: false }, { ...user8, isMain: false }],
    color: '#98FB98', // PaleGreen
    order: 3,
    memo: 'Figma 활용하여 디자인 및 프로토타입 제작',
    taskAttachments: [],
    urls: [],
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
    order: 1,
    taskAttachments: [],
    urls: [],
    emails: emails,
    prefix: 'IT',
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
      { taskId: 'SD202504101010000004', todoId: 'ST202504101013000003', todoOwner: 'test07', isCompleted: true, todoTxt: 'Storybook 연동', todoDt: new Date('2025-05-11'), participants: [{ ...user7, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101010000001'],
    participants: [{ ...user7, isMain: true }, { ...user4, isMain: false }],
    color: '#ADD8E6', // LightBlue
    order: 2, // 순서 변경
    taskAttachments: [],
    urls: [],
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
      { taskId: 'SD202504101010000002', todoId: 'ST202504101012000003', todoOwner: 'test07', isCompleted: false, todoTxt: 'API 연동 (로그인)', todoDt: new Date('2025-05-21'), participants: [{ ...user7, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101005000003', 'SD202504101015000002'],
    participants: [{ ...user7, isMain: true }],
    color: '#ADD8E6', // LightBlue
    order: 3, // 순서 변경
    memo: '소셜 로그인 기능은 추후 구현 예정',
    taskAttachments: [],
    urls: [],
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
    order: 4, // 순서 변경
    taskAttachments: [],
    urls: [],
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
      { taskId: 'SD202503191553000001', todoId: 'ST202503271341000002', todoOwner: 'test01', isCompleted: true, todoTxt: 'DB 스키마 분석', todoDt: new Date('2025-04-19'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202503191553000001', todoId: 'ST202503271341000003', todoOwner: 'test01', isCompleted: true, todoTxt: '테스트 데이터 생성 스크립트 작성', todoDt: new Date('2025-04-21'), participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }], order: 2 }
    ],
    dependencies: ['SD202504101001000002'],
    participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }, { ...user1, isMain: false }],
    color: '#73D5F6',
    order: 1,
    memo: 'ERD 기반으로 분석 완료. 더미 데이터 1000건 생성.',
    taskAttachments: [],
    urls: [],
    emails: emails,
    prefix: 'IT',
  },
  {
    sectionId: 'SM202503191552000002',
    taskId: 'SD202504101015000001',
    taskName: 'API 서버 환경 설정',
    taskOwner: user8,
    start: new Date('2025-05-01T09:00:00'), // 선행(SD...01 DB) 종료(04-30) 다음 날
    end: new Date('2025-05-03T18:00:00'),   // 시작일 + 원래 기간(3일)
    priority: priorityHigh,
    status: statusInProgress,
    importance: 1,
    progress: 70,
    todoList: [
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000001', todoOwner: 'test08', isCompleted: true, todoTxt: 'Node.js + Express 프로젝트 초기화', todoDt: new Date('2025-04-23'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000002', todoOwner: 'test08', isCompleted: false, todoTxt: '데이터베이스 연결 설정', todoDt: new Date('2025-04-24'), participants: [{ ...user8, isMain: true }], order: 2 },
      { taskId: 'SD202504101015000001', todoId: 'ST202504101016000003', todoOwner: 'test08', isCompleted: false, todoTxt: 'ORM (TypeORM) 설정', todoDt: new Date('2025-04-25'), participants: [{ ...user8, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202503191553000001'],
    participants: [{ ...user8, isMain: true }],
    color: '#73D5F6',
    order: 2,
    taskAttachments: [],
    urls: [],
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
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000001', todoOwner: 'test08', isCompleted: true, todoTxt: '회원가입 API 엔드포인트 구현', todoDt: new Date('2025-05-01'), participants: [{ ...user8, isMain: true }], order: 1 },
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000002', todoOwner: 'test08', isCompleted: false, todoTxt: '로그인 API 및 JWT 발급 구현', todoDt: new Date('2025-05-05'), participants: [{ ...user8, isMain: true }], order: 2 },
      { taskId: 'SD202504101015000002', todoId: 'ST202504101017000003', todoOwner: 'test08', isCompleted: false, todoTxt: '비밀번호 암호화 적용', todoDt: new Date('2025-05-07'), participants: [{ ...user8, isMain: true }], order: 3 },
    ],
    dependencies: ['SD202504101015000001'],
    participants: [{ ...user8, isMain: true }, { ...user2, isMain: false }],
    color: '#73D5F6',
    order: 3,
    memo: '보안 강화 위해 bcrypt 사용',
    taskAttachments: [],
    urls: [],
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
    order: 4,
    taskAttachments: [],
    urls: [],
    emails: emails,
    prefix: 'IT',
  },
];

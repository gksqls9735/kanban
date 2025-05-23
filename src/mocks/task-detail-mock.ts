import { Chat, Email, FileAttachment, NumericField, UrlData } from "../types/type";
import { user1, user2, user3, user4 } from "./user-mock";

// 첨부 예시
export const exampleAttachments: FileAttachment[] = [
  {
    fileId: '01',
    fileName: 'favicon.ico', // URL에서 추출
    fileUrl: '/files/favicon.ico',
    fileType: 'image/x-icon' // 확장자 기반 유추 (또는 image/vnd.microsoft.icon)
  },
  {
    fileId: '02',
    fileName: 'logo192.png', // URL에서 추출
    fileUrl: '/files/logo192.png',
    fileType: 'image/png' // 확장자 기반 유추
  },
  {
    fileId: '03',
    fileName: 'logo512.png', // URL에서 추출
    fileUrl: '/files/logo512.png',
    fileType: 'image/png' // 확장자 기반 유추
  },
  {
    fileId: '04',
    fileName: '241030_Works_프로젝트_기획_v0.8.pptx', // URL에서 추출
    fileUrl: '/files/241030_Works_프로젝트_기획_v0.8.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx MIME 타입
  },
  {
    fileId: '05',
    fileName: 'robots.txt', // URL에서 추출
    fileUrl: '/files/robots.txt',
    fileType: 'text/plain' // .txt MIME 타입
  },
  {
    fileId: '06',
    fileName: '고정 IP 설정 가이드.pdf', // URL에서 추출
    fileUrl: '/files/고정 IP 설정 가이드.pdf',
    fileType: 'application/pdf' // .pdf MIME 타입
  },
  {
    fileId: '07',
    fileName: 'truncateText.ts', // URL에서 추출
    fileUrl: '/files/truncateText.ts',
    fileType: 'text/typescript' // .ts MIME 타입 (또는 application/typescript)
  },
  {
    fileId: '08',
    fileName: '이벤트.docx', // URL에서 추출
    fileUrl: '/files/이벤트.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx MIME 타입
  }
];

export const urls: UrlData[] = [
  {
    urlId: "naver-url",
    title: "naver",
    requestedUrl: "https://www.naver.com/",
    order: 0,
  },
  {
    urlId: "google-url",
    title: "google",
    requestedUrl: "https://www.google.co.kr/",
    order: 1,
  },
  {
    urlId: "papago-url",
    title: "papago",
    requestedUrl: "https://papago.naver.com/",
    order: 2,
  },
  {
    urlId: "Works-url",
    title: "Works",
    requestedUrl: "https://works.bizbee.co.kr/",
    order: 3,
  },
  {
    urlId: "Yahoo-url",
    title: "Yahoo | Mail, Weather, Search, Politics, News, Finance, Sports &amp; Videos",
    requestedUrl: "https://www.yahoo.com/?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAANl7hC1bby97pbeUJk6URue8_CKwGu4Jd7yyEr04B0i4El_riP_ScXCiHMg9oWTgBwqXmLf-3J70WCzGIhRhLk3dibyTEMStUNGvLRG84IawcshmDY4WQAlrt_KxbhH4eV662bxXYSq2-a-KnQ0SsX1hL6tsKKQKWcRSWlioVjrU",
    order: 4,
  },
  {
    urlId: "kakao-url",
    title: "kakao",
    requestedUrl: "https://www.kakaocorp.com/page/",
    order: 4,
  },
  {
    urlId: "유튜브-url",
    title: "유튜브",
    requestedUrl: "https://www.youtube.com/",
    order: 5,
  },
]

export const numericExamples: NumericField[] = [
  { value: 3.4567, unit: "퍼센트", decimalPlaces: 2 },
  { value: 180.25, unit: '숫자', decimalPlaces: 1 },
  { value: 75.123, unit: '숫자', decimalPlaces: 1 },
  { value: 12999.99, unit: 'USD', decimalPlaces: 0 },
  { value: 36.689, unit: 'USD', decimalPlaces: 1 },
  { value: 1.23456, unit: 'USD', decimalPlaces: 3 }
];

export const emails: Email[] = [
  { id: 'email01', email: "alice.wonder@example.com", nickname: "앨리스", order: 0 },
  { id: 'email02', email: "bob.builder@sample.net", nickname: "밥 아저씨", order: 1 },
  { id: 'email03', email: "charlie_chaplin@email.org", nickname: "찰리", order: 2 },
  { id: 'email04', email: "dev_master_123@devzone.io", nickname: "개발고수", order: 3 },
  { id: 'email05', email: "elice.academy.official@elice.com", nickname: "엘리스 교육", order: 4 },
  { id: 'email06', email: "frontend.lover@web.dev", nickname: "프롱이", order: 5 },
  { id: 'email07', email: "backend.guru@server.tech", nickname: "백엔드 전문가", order: 6 },
  { id: 'email08', email: "happy.user.77@mymail.co.kr", nickname: "행복한유저", order: 7 },
  { id: 'email09', email: "test@test.com", nickname: "테스터", order: 8 }
];





// chatTask1_Root1의 답글의 답글
const chatTask1_Reply1_SubReply1: Chat = {
  chatId: 'chat-003-task1-reply1-sub1',
  taskId: 'SD202504101001000001',
  parentChatId: 'chat-002-task1-reply1', // 부모: chatTask1_Reply1
  chatContent: '피드백 주셔서 감사합니다. 추가 의견 있으시면 언제든 알려주세요.',
  user: user1,
  createdAt: new Date('2024-07-20T09:35:00Z'),
  likedUserIds: [],
  // attachments: [], // 첨부파일 없음
  // replies: [], // 더 이상 답글 없음
};

// chatTask1_Root1의 첫 번째 답글
const chatTask1_Reply1: Chat = {
  chatId: 'chat-002-task1-reply1',
  taskId: 'SD202504101001000001',
  parentChatId: 'chat-001-task1', // 부모: chatTask1_Root1
  chatContent: '네, 기대됩니다! 기획서 잘 봤습니다.',
  user: user2,
  createdAt: new Date('2024-07-20T09:30:00Z'),
  likedUserIds: [user1.id],
  attachments: [],
  replies: [chatTask1_Reply1_SubReply1], // 위에서 정의한 답글 포함
};

// chatTask1_Root1의 두 번째 답글
const chatTask1_Reply2: Chat = {
  chatId: 'chat-004-task1-reply2',
  taskId: 'SD202504101001000001',
  parentChatId: 'chat-001-task1', // 부모: chatTask1_Root1
  chatContent: '디자인 시안 작업해서 곧 공유드릴게요!',
  user: user3,
  createdAt: new Date('2024-07-20T10:00:00Z'),
  likedUserIds: [user1.id, user2.id],
  attachments: [exampleAttachments[1]],
  // replies: [], // 답글 없음
};

// Task 1의 첫 번째 최상위 채팅
export const chatTask1_Root1: Chat = {
  chatId: 'chat-001-task1',
  taskId: 'SD202504101001000001',
  parentChatId: null, // 최상위 채팅
  chatContent: '새로운 칸반보드 프로젝트 시작합니다! 다들 화이팅입니다. 🚀',
  user: user1,
  createdAt: new Date('2024-07-20T09:00:00Z'),
  likedUserIds: [user2.id, user3.id],
  attachments: [exampleAttachments[1]],
  replies: [chatTask1_Reply1, chatTask1_Reply2], // 위에서 정의한 답글들 포함
};

// Task 1의 두 번째 최상위 채팅 (답글 없음)
export const chatTask1_Root2: Chat = {
  chatId: 'chat-005-task1',
  taskId: 'SD202504101001000001',
  parentChatId: null, // 최상위 채팅
  chatContent: '회의록 정리해서 올립니다. 다음 주 월요일 오전 회의 일정 참고해주세요.',
  user: user4,
  createdAt: new Date('2024-07-21T14:00:00Z'),
  likedUserIds: [user1.id],
  // attachments: [],
  // replies: [],
};


// Task ID: SD202504101001000002 에 대한 채팅들

// chatTask2_Root1의 첫 번째 답글
const chatTask2_Reply1: Chat = {
  chatId: 'chat-007-task2-reply1',
  taskId: 'SD202504101001000002',
  parentChatId: 'chat-006-task2', // 부모: chatTask2_Root1
  chatContent: '좋은 의견입니다. 보안성 측면에서 유리할 것 같아요. 검토해보겠습니다.',
  user: user1,
  createdAt: new Date('2024-07-22T11:15:00Z'),
  likedUserIds: [user2.id],
  // attachments: [],
  // replies: [],
};

// chatTask2_Root1의 두 번째 답글
const chatTask2_Reply2: Chat = {
  chatId: 'chat-008-task2-reply2',
  taskId: 'SD202504101001000002',
  parentChatId: 'chat-006-task2', // 부모: chatTask2_Root1
  chatContent: '관련해서 참고 자료 있으면 공유 부탁드립니다!',
  user: user4,
  createdAt: new Date('2024-07-22T11:20:00Z'),
  likedUserIds: [],
  // attachments: [],
  // replies: [],
};

// Task 2의 첫 번째 최상위 채팅
export const chatTask2_Root1: Chat = {
  chatId: 'chat-006-task2',
  taskId: 'SD202504101001000002',
  parentChatId: null, // 최상위 채팅
  chatContent: 'API 개발 관련 논의입니다. 인증 방식은 OAuth2.0으로 진행하는게 어떨까요?',
  user: user2,
  createdAt: new Date('2024-07-22T11:00:00Z'),
  likedUserIds: [user1.id, user4.id],
  attachments: [exampleAttachments[1]],
  replies: [chatTask2_Reply1, chatTask2_Reply2],
};

// chatTask2_Root2의 첫 번째 답글
const chatTask2_Root2_Reply1: Chat = {
  chatId: 'chat-010-task2-reply1',
  taskId: 'SD202504101001000002',
  parentChatId: 'chat-009-task2', // 부모: chatTask2_Root2
  chatContent: '다음 주 금요일까지입니다. PM님께 최종 확인해보겠습니다.',
  user: user1,
  createdAt: new Date('2024-07-23T09:05:00Z'),
  likedUserIds: [user3.id],
  // attachments: [],
  // replies: [],
};

// Task 2의 두 번째 최상위 채팅
export const chatTask2_Root2: Chat = {
  chatId: 'chat-009-task2',
  taskId: 'SD202504101001000002',
  parentChatId: null, // 최상위 채팅
  chatContent: '이 태스크 마감일이 언제인가요? 일정 확인 부탁드립니다.',
  user: user3,
  createdAt: new Date('2024-07-23T09:00:00Z'),
  likedUserIds: [],
  // attachments: [],
  replies: [chatTask2_Root2_Reply1],
};

export const chatlist = [
  chatTask1_Root1, chatTask1_Root2,
  chatTask2_Root1, chatTask2_Root2,
]
import { Chat, Email, FileAttachment, NumericField, UrlData } from "../types/type";
import { user1, user2, user3, user5, user6, user8 } from "./user-mock";

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
    faviconUrl: "https://s.pstatic.net/static/www/u/2014/0328/mma_204243574.png",
    requestedUrl: "https://www.naver.com/",
    order: 0,
  },
  {
    urlId: "google-url",
    title: "google",
    faviconUrl: null,
    requestedUrl: "https://www.google.co.kr/",
    order: 1,
  },
  {
    urlId: "papago-url",
    title: "papago",
    faviconUrl: "https://papago.naver.com/favicon.ico",
    requestedUrl: "https://papago.naver.com/",
    order: 2,
  },
  {
    urlId: "Works-url",
    title: "Works",
    faviconUrl: "https://works.bizbee.co.kr/favicon.png",
    requestedUrl: "https://works.bizbee.co.kr/",
    order: 3,
  },
  {
    urlId: "Yahoo-url",
    title: "Yahoo | Mail, Weather, Search, Politics, News, Finance, Sports &amp; Videos",
    faviconUrl: "https://s.yimg.com/rz/l/favicon.ico",
    requestedUrl: "https://www.yahoo.com/?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAANl7hC1bby97pbeUJk6URue8_CKwGu4Jd7yyEr04B0i4El_riP_ScXCiHMg9oWTgBwqXmLf-3J70WCzGIhRhLk3dibyTEMStUNGvLRG84IawcshmDY4WQAlrt_KxbhH4eV662bxXYSq2-a-KnQ0SsX1hL6tsKKQKWcRSWlioVjrU",
    order: 4,
  },
  {
    urlId: "kakao-url",
    title: "kakao",
    faviconUrl: "https://www.kakaocorp.com/page/favicon.ico",
    requestedUrl: "https://www.kakaocorp.com/page/",
    order: 4,
  },
  {
    urlId: "유튜브-url",
    title: "유튜브",
    faviconUrl: "https://www.youtube.com/s/desktop/849f7a94/img/logos/favicon_32x32.png",
    requestedUrl: "https://www.youtube.com/",
    order: 5,
  },
]

export type MeasurementUnit =
  | '%' | 'cm' | 'm' | 'mm' | 'inch'
  | 'kg' | 'g' | 'lb'
  | '$' | '₩' | '€' | '¥'
  | 's' | 'min' | 'hr'
  | '°C' | '°F'
  | 'ml' | 'l';

export const numericExamples: NumericField[] = [
  { value: 3.4567, unit: '%', decimalPlaces: 2 },
  { value: 180.25, unit: 'cm', decimalPlaces: 1 },
  { value: 75.123, unit: '$', decimalPlaces: 1 },
  { value: 12999.99, unit: '₩', decimalPlaces: 0 },
  { value: 36.689, unit: '°C', decimalPlaces: 1 },
  { value: 1.23456, unit: 'l', decimalPlaces: 3 }
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

// -> Chat 예시 데이터
export const chatlists: Chat[] = [
  {
    chatId: 'chat-001',
    taskId: 'SD202504101001000001',
    chatContent: '안녕하세요! 프로젝트 관련해서 첫 미팅 일정을 잡아볼까요?',
    chatReplies: [
      {
        refChatId: 'chat-001',
        chatId: 'chat-004',
        taskId: 'SD202504101001000001',
        chatContent: '백엔드 API 명세서 초안 나왔습니다. 검토 부탁드립니다.',
        chatReplies: [],
        user: user8, // 백엔드개발D
        createdAt: new Date('2023-10-27T11:00:00Z'),
        likedUserIds: [user1.id],
        attachments: [
          exampleAttachments[0],
        ],
      },
    ],
    user: user1,
    createdAt: new Date('2023-10-27T10:00:00Z'), // UTC 기준 시간
    likedUserIds: [user1.id, user2.id, user3.id],
    attachments: [
      exampleAttachments[1],
      exampleAttachments[3],
    ],
  },
  {
    chatId: 'chat-002',
    taskId: 'SD202504101001000001',
    chatContent: '네, 좋습니다. 저는 다음 주 월요일 오후가 괜찮습니다.',
    chatReplies: [],
    user: user5, // 기획자A
    createdAt: new Date('2023-10-27T10:05:15Z'),
    likedUserIds: [user1.id],
    attachments: [
      exampleAttachments[6]
    ],
  },
  {
    chatId: 'chat-003',
    taskId: 'SD202504101001000001',
    chatContent: '디자인 시안 작업 중입니다. 내일 오전 중으로 공유드릴게요!',
    chatReplies: [],
    user: user6, // 디자이너B
    createdAt: new Date('2023-10-27T10:10:30Z'),
    likedUserIds: [],
    attachments: [
      exampleAttachments[5]
    ],
  },
  {
    chatId: 'chat-004',
    taskId: 'SD202504101001000002',
    chatContent: '디자인 시안 작업 중입니다. 내일 오전 중으로 공유드릴게요!',
    chatReplies: [],
    user: user6, // 디자이너B
    createdAt: new Date('2023-10-27T10:10:30Z'),
    likedUserIds: [],
    attachments: [],
  }
]
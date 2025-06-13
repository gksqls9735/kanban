import { User } from "../types/type";

export const user1: User = {
  id: 'test01',
  username: '김철수',
  icon: '/files/favicon.ico',
  team: '퓨처 솔루션즈/전략 기획 본부/시장 분석 팀', // 회사/본부/팀
  tagline: '데이터 기반의 통찰력으로 시장을 분석합니다.',
  phoneNumber: '010-1234-5678',
  userEmail: 'kim.cs@example.com'
};

export const user2: User = {
  id: 'test02',
  username: '이영희',
  icon: null,
  team: '퓨처 솔루션즈/전략 기획 본부/신사업 개발 팀', // 같은 본부 내 다른 팀
  tagline: '혁신적인 아이디어로 새로운 가치를 창출합니다.',
  phoneNumber: '010-9876-5432',
  userEmail: 'lee.yh@example.com'
};

export const user3: User = {
  id: 'test03',
  username: '박지훈',
  icon: 'FL202504011705053391',
  team: '퓨처 솔루션즈/전략 기획 본부/시장 분석 팀', // user1과 같은 팀
  tagline: '트렌드를 읽고 기회를 포착합니다.',
  phoneNumber: '010-5555-1234',
  userEmail: 'park.jh@example.com'
};

export const user4: User = {
  id: 'test04',
  username: '최유리',
  icon: 'FL202504011705053392',
  team: '퓨처 솔루션즈/글로벌 사업 본부/해외 영업 1팀', // 다른 본부, 다른 팀
  tagline: '글로벌 시장을 개척하는 열정적인 영업 전문가입니다.',
  phoneNumber: '010-7777-8888',
  userEmail: 'choi.yr@example.com'
};

export const user5: User = {
  id: 'test05',
  username: '한기획',
  icon: null,
  team: '퓨처 솔루션즈/기술 개발 본부/플랫폼 개발 팀', // 기술 개발 본부
  tagline: '견고하고 확장 가능한 플랫폼을 설계합니다.',
};

export const user6: User = {
  id: 'test06',
  username: '정디자인',
  icon: '/files/profile1.jpg',
  team: '퓨처 솔루션즈/기술 개발 본부/플랫폼 개발 팀/프론트엔드 파트', // 더 깊은 계층
  tagline: '사용자 친화적인 인터페이스를 디자인합니다.',
  phoneNumber: '010-4444-5555',
  userEmail: 'jung.ds@example.com'
};

export const user7: User = {
  id: 'test07',
  username: '신프론트',
  icon: null,
  team: '퓨처 솔루션즈/기술 개발 본부/플랫폼 개발 팀/프론트엔드 파트', // 같은 파트
  tagline: '최고의 웹 경험을 구현합니다.',
  phoneNumber: '010-6666-7777',
  userEmail: 'shin.fe@example.com'
};

export const user8: User = {
  id: 'test08',
  username: '오백엔드',
  icon: '/files/profile2.jpg',
  team: '퓨처 솔루션즈/기술 개발 본부/플랫폼 개발 팀/백엔드 파트', // 같은 팀, 다른 파트
  tagline: '안정적인 시스템 백본을 구축합니다.',
  phoneNumber: '010-9999-0000',
  userEmail: 'oh.be@example.com'
};

export const user9: User = {
  id: 'test09',
  username: '강연구원',
  icon: 'FL202504011705053395',
  team: '미래기술 연구소/AI 연구팀', // 독립적인 최상위 조직
  tagline: '인공지능 기술의 미래를 연구합니다.',
  phoneNumber: '010-1111-2222',
  userEmail: 'kang.ri@example.com'
};

export const user10: User = {
  id: 'test10',
  username: '윤마케터',
  icon: null,
  team: '퓨처 솔루션즈/글로벌 사업 본부/해외 마케팅 팀',
  tagline: '혁신적인 전략으로 해외 시장을 공략합니다.',
  phoneNumber: '010-3333-4444',
  userEmail: 'yoon.mk@example.com'
};
export const userlist: User[] = [
  user1, user2, user3, user4, user5, user6, user7, user8, user9, user10
]



// export const user1: User = { id: 'test01', username: '유저01', icon: 'FL202504011705053390', team: 'Test Team' };
// export const user2: User = { id: 'test02', username: '유저02', icon: null, team: 'Test Team' };
// export const user3: User = { id: 'test03', username: '유저03', icon: 'FL202504011705053391', team: 'Test Team' };
// export const user4: User = { id: 'test04', username: '유저04', icon: 'FL202504011705053392', team: 'Test Team' };
// export const user5: User = { id: 'test05', username: '기획자A', icon: null, team: 'Product Team' };
// export const user6: User = { id: 'test06', username: '디자이너B', icon: 'FL202504011705053393', team: 'Product Team' };
// export const user7: User = { id: 'test07', username: '프론트개발C', icon: null, team: 'Product Team' };
// export const user8: User = { id: 'test08', username: '백엔드개발D', icon: 'FL202504011705053394', team: 'Product Team' };

// export const user9: User = { id: 'test09', username: '외부개발자', icon: 'FL202504011705053395', team: 'External Developer' };

// export const userlist: User[] = [
//   user1, user2, user3, user4, user5, user6, user7, user8, user9
// ]
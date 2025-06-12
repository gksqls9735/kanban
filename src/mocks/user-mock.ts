import { User } from "../types/type";

export const user1: User = { 
  id: 'test01', 
  username: '유저01', 
  icon: '/files/favicon.ico', 
  team: 'Test Team',
  tagline: '팀의 든든한 일꾼, 유저01입니다!' // tagline 추가
};

export const user2: User = { 
  id: 'test02', 
  username: '유저02', 
  icon: null, 
  team: 'Test Team',
  tagline: '항상 새로운 것을 배우는 유저02' // tagline 추가
};

export const user3: User = { 
  id: 'test03', 
  username: '유저03', 
  icon: 'FL202504011705053391', 
  team: 'Test Team',
  tagline: '효율적인 협업을 추구합니다.' // tagline 추가
};

export const user4: User = { 
  id: 'test04', 
  username: '유저04', 
  icon: 'FL202504011705053392', 
  team: 'Test Team',
  tagline: '문제 해결에 열정적인 유저04입니다.' // tagline 추가
};

export const user5: User = { 
  id: 'test05', 
  username: '기획자A', 
  icon: null, 
  team: 'Product Team',
  tagline: '사용자 경험을 최우선으로 생각하는 기획자입니다. 사용자 경험을 최우선으로 생각하는 기획자입니다. 사용자 경험을 최우선으로 생각하는 기획자입니다.' // tagline 추가
};

export const user6: User = { 
  id: 'test06', 
  username: '디자이너B', 
  icon: '/files/profile1.jpg', 
  team: 'Product Team',
  tagline: '아름다움과 실용성을 겸비한 디자인을 만듭니다.' // tagline 추가
};

export const user7: User = { 
  id: 'test07', 
  username: '프론트개발C', 
  icon: null, 
  team: 'Product Team',
  tagline: '사용자에게 최고의 인터페이스를 제공합니다.' // tagline 추가
};

export const user8: User = { 
  id: 'test08', 
  username: '백엔드개발D', 
  icon: '/files/profile2.jpg', 
  team: 'Product Team',
  tagline: '안정적이고 확장성 있는 서버를 구축합니다.' // tagline 추가
};

export const user9: User = { 
  id: 'test09', 
  username: '외부개발자', 
  icon: 'FL202504011705053395', 
  team: 'External Developer',
  tagline: '다양한 프로젝트 경험을 가진 외부 개발자입니다.' // tagline 추가
};
export const userlist: User[] = [
  user1, user2, user3, user4, user5, user6, user7, user8, user9
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
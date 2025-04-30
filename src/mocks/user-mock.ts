import { User } from "../types/type";

export const user1: User = { id: 'test01', username: '유저01', icon: 'FL202504011705053398', team: 'Test Team' };
export const user2: User = { id: 'test02', username: '유저02', icon: null, team: 'Test Team' };
export const user3: User = { id: 'test03', username: '유저03', icon: 'FL202504011705053398', team: 'Test Team' };
export const user4: User = { id: 'test04', username: '유저04', icon: 'FL202504011705053398', team: 'Test Team' };
export const user5: User = { id: 'test05', username: '기획자A', icon: null, team: 'Product Team' };
export const user6: User = { id: 'test06', username: '디자이너B', icon: 'FL202504011705053398', team: 'Product Team' };
export const user7: User = { id: 'test07', username: '프론트개발C', icon: null, team: 'Product Team' };
export const user8: User = { id: 'test08', username: '백엔드개발D', icon: 'FL202504011705053398', team: 'Product Team' };

export const userlist: User[] = [
  user1, user2, user3, user4, user5, user6, user7, user8
]
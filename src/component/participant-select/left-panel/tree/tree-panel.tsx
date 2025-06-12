import { ReactNode, useMemo, useState } from "react";
import { User } from "../../../../types/type";
import AvatarItem from "../../../common/avatar/avatar";
import { getInitial } from "../../../../utils/text-function";

const ICON_ARROW_DOWN = "https://works.bizbee.co.kr/assets/doc-arrow-down.8bd3b059.svg";
const ICON_ARROW_RIGHT = "https://works.bizbee.co.kr/assets/doc-arrow-right.a8f55779.svg";
const ICON_FOLDER = "https://works.bizbee.co.kr/assets/doc-folder-grey.0c6e4658.svg";

/** 
 * 트리의 각 노드를 위한 타입
 */
// 모든 노드가 공통으로 가지는 기본 속성
interface BaseNode {
  id: string; // 각 노드의 고유 ID
  name: string; // 화면에 표시될 이름
  depth: number;  // 트리의 깊이
}

interface GroupNode extends BaseNode {
  type: 'group';  // 노드 타입: 그룹
  children: TreeNode[]; // 자식 노드들(다른 그룹 또는 사용자)
  childrenCount: number; // 이 그룹의 직접적인 자식 노드 수
}

interface UserTreeNode extends BaseNode {
  type: 'user';   // 노트 타입: 사용자
  originalUser: User; // 이 노드에 해당하는 원본 User 데이터
}

type TreeNode = GroupNode | UserTreeNode;

/**
 * 사용자 목록으로부터 계층적 트리 데이터를 생성하는 함수
 * @param users - 모든 사용자 목록
 * @param rootDepth - 루트 노드의 시작 깊이 (기본값 0)
 * @returns 계층적으로 구성된 최상위 그룹 노드들의 배열
 */
export const buildOrganizationalTree = (users: User[], rootDepth: number = 0): GroupNode[] => {
  // 트리를 만들기 위한 임시 루트 헬퍼 노드
  const rootHelper: GroupNode = {
    id: 'root', // 임시 루트 ID
    name: 'Organizations', // 이름 (실제 렌더링에는 사용되지 않음)
    type: 'group',
    depth: rootDepth - 1, // 실제 최상위 그룹보다 한 단계 위 (들여쓰기 계산 편의)
    children: [], // 최상위 그룹 노드들이 여기에 추가
    childrenCount: 0,
  };

  // 모든 사용자를 순회하며 트리 구조에 추가
  users.forEach(u => {
    // 슬래시를 기준으로 분리
    const pathSegments = u.team.split('/');
    let currentNode: GroupNode = rootHelper;  // 현재 처리 중인 부모 노트


    // 경로의 각 세그먼트를 순회하며 그룹 노드를 찾거나 생성
    pathSegments.forEach(segName => {
      // 현재 세그먼트의 고유 ID (부보 ID + 세그먼트 이름)
      const segtId = `${currentNode.id === 'root' ? '' : currentNode.id + '/'}${segName}`;

      // 현재 노드의 자식들 중 해당 세그먼트 이름과 일치하는 그룹 노드 탐색
      let childGroupNode = currentNode.children.find(child =>
        child.type === 'group' && child.name === segName
      ) as GroupNode | undefined;

      // 만약 해당 그룹 노드가 없으면 새로 생성하여 현재 노드의 자식으로 추가
      if (!childGroupNode) {
        childGroupNode = {
          id: segtId,
          name: segName,
          type: 'group',
          depth: currentNode.depth + 1, // 깊이 증가
          children: [], // 새로운 그룹이므로 자식 배열 초기화
          childrenCount: 0,
        };
        currentNode.children.push(childGroupNode); // 현재 부모 노드의 자식으로 추가
      }
      currentNode = childGroupNode;
    });

    // 모든 팀/조직 경로를 따라가서 마지막 그룹(팀) 노드에 사용자 추가
    currentNode.children.push({
      id: `user-${u.id}`, // 사용자 노드의 고유 ID (충돌 방지를 위해 "user-" 접두사)
      name: u.username, // 사용자 이름
      type: 'user', // 노드 타입: 사용자
      depth: currentNode.depth + 1, // 사용자 노드의 깊이
      originalUser: u, // 원본 User 객체 저장
    });
  });

  // 각 그룹 노드의 childrenCount 속성을 업데이트하는 내부 함수(재귀적)
  const updateChildrenCounts = (node: TreeNode) => {
    if (node.type === 'group') {
      node.childrenCount = node.children.length;  // 직접적인 자식 노드의 개수
      node.children.forEach(updateChildrenCounts);  // 자식 노드들에 대해서도 재귀적으로 호출
    }
  };

  // 임시 루드 헬퍼의 자식들 (실제 최상위 조직 그룹들)에 대해 childCount 업데이트
  rootHelper.children.forEach(updateChildrenCounts);

  // 실제 최상위 조직 목록(GroupNode 배열)을 반환
  return rootHelper.children as GroupNode[];
}

const TreePanel: React.FC<{
  users: User[];
  selectedParticipantIds: Set<string | number>; // 현재 선택된 참가자들의 ID Set (빠른 조회용)
  onSelectUser: (userId: string | number, select: boolean) => void;
}> = ({ users, selectedParticipantIds, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 확장된 그룹 노드들의 ID를 관리하는 Set
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.team && u.team.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // 필터링된 사용자 목록으로부터 트리 데이터를 메모이제이션
  const treeData = useMemo(() => {
    return buildOrganizationalTree(filteredUsers);
  }, [filteredUsers]);

  // 그룹 노드의 확장/축소 상태를 토글하는 함수
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);

      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);  // 이미 확장되어 있으면 축소
      } else {
        newSet.add(nodeId) // 축소되어 있으면 확장
      }
      return newSet;
    });
  };

  /**
 * 트리의 개별 노드를 재귀적으로 렌더링하는 함수
 * @param node - 렌더링할 TreeNode 객체 (GroupNode 또는 UserTreeNode)
 * @returns 렌더링된 ReactNode 또는 null
 */
  const renderTreeNode = (node: TreeNode): ReactNode | null => {
    const basePadding = 10;
    const depthPadding = 28;
    const paddingLeft = basePadding + node.depth * depthPadding;

    if (node.type === 'group') {
      const isExpanded = expandedNodes.has(node.id);  // 현재 그룹이 확장되어 있는지 확인
      return (
        <div key={node.id}>
          <div
            className="participant-modal__tree-node--group"
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => toggleNodeExpansion(node.id)}
          >
            {node.children && node.children.length > 0 && (
              <img
                src={isExpanded ? ICON_ARROW_DOWN : ICON_ARROW_RIGHT} // 확장 상태에 따라 아이콘 변경
                className="participant-modal__group-toggle-icon"
                alt={isExpanded ? "축소" : "확장"}
              />
            )}
            {!(node.children && node.children.length > 0) && (
              <div className="participant-modal__group-toggle-icon" />
            )}
            <img src={ICON_FOLDER} className="participant-modal__group-folder-icon" alt="폴더" />
            <span>{node.name} ({node.childrenCount})</span>
          </div>
          {isExpanded && node.children.map(childNode => renderTreeNode(childNode))}
        </div>
      );
    } else if (node.type === 'user') {
      const user = node.originalUser;
      const isSelected = selectedParticipantIds.has(user.id);

      return (
        <div
          key={user.id}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onSelectUser(user.id, !isSelected)}
          className={`participant-modal__tree-node--user ${isSelected ? 'participant-modal__tree-node--user-selected' : ''}`}
        >
          <AvatarItem size={24} src={user.icon}>{getInitial(user.username)}</AvatarItem >
          <span>{user.username}</span>
        </div>
      )
    }

    return null;
  };

  return (
    <div className="participant-modal__left-panel">
      <div className="participant-modal__search-container">
        <div className="participant-modal__search-bar">
          <input
            className="participant-modal__search-input"
            placeholder="이름, 직위로 찾기"
            type="text"
            onChange={e => setSearchTerm(e.target.value)}
          />
          <svg className="participant-modal__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" id="Search--Streamline-Lucide" height="16" width="16">
            <desc>Search Streamline Icon: https://streamlinehq.com</desc>
            <path d="M1.875 6.875a5 5 0 1 0 10 0 5 5 0 1 0 -10 0" strokeWidth="1"></path><path d="m13.125 13.125 -2.6875 -2.6875" strokeWidth="1"></path>
          </svg>
        </div>
      </div>
      <div className="participant-modal__user-list kanban-scrollbar-y">
        {treeData.length > 0 ? treeData.map(rootNode => renderTreeNode(rootNode)) : (
          <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: '#888' }}>
            {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreePanel;
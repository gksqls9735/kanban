// TreePanel.tsx
import React, { ReactNode, useMemo, useState } from "react";
import { User } from "../../../../types/type";
import AvatarItem from "../../../avatar/avatar";
import { getInitial } from "../../../../utils/text-function";

// 아이콘 URL 정의
const ICON_ARROW_DOWN = "https://works.bizbee.co.kr/assets/doc-arrow-down.8bd3b059.svg";
const ICON_ARROW_RIGHT = "https://works.bizbee.co.kr/assets/doc-arrow-right.a8f55779.svg";
const ICON_FOLDER = "https://works.bizbee.co.kr/assets/doc-folder-grey.0c6e4658.svg";

const TreePanel: React.FC<{
  users: User[];
  selectedParticipantIds: Set<string | number>;
  onSelectUser: (userId: string | number, select: boolean) => void;
}> = ({
  users,
  selectedParticipantIds,
  onSelectUser,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const filteredUsers = useMemo(() => {
      if (!searchTerm) return users;
      return users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.team && u.team.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }, [users, searchTerm]);

    const treeData = useMemo(() => {
      return buildOrganizationalTree(filteredUsers);
    }, [filteredUsers]);

    const toggleNodeExpansion = (nodeId: string) => {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    };


    const renderTreeNode = (node: TreeNode): ReactNode | null => {
      const basePadding = 10;
      const depthPadding = 28;
      const paddingLeft = basePadding + node.depth * depthPadding;

      if (node.type === 'group') {
        const isExpanded = expandedNodes.has(node.id);
        return (
          <div key={node.id}>
            <div
              className="participant-modal__tree-node--group"
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={() => toggleNodeExpansion(node.id)}
            >
              {node.children && node.children.length > 0 && (
                <img
                  src={isExpanded ? ICON_ARROW_DOWN : ICON_ARROW_RIGHT}
                  className="participant-modal__group-toggle-icon"
                  alt={isExpanded ? "축소" : "확장"}
                />
              )}
              {!(node.children && node.children.length > 0) && ( /* 자식이 없으면 빈 공간 차지 */
                <div className="participant-modal__group-toggle-icon"></div>
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
        );
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
        <div className="participant-modal__user-list gantt-scrollbar-y">
          {treeData.length > 0 ? treeData.map(rootNode => renderTreeNode(rootNode)) : (
            <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: '#888' }}>
              {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    )
  };

export default TreePanel;



// 트리의 각 노드를 위한 타입
interface BaseNode {
  id: string; // 각 노드의 고유 ID (예: "회사A", "회사A/본부B", "user_123")
  name: string; // 화면에 표시될 이름
  depth: number; // 트리의 깊이 (스타일링에 사용)
}

export interface GroupNode extends BaseNode {
  type: 'group'; // 회사, 본부, 팀과 같은 그룹 노드
  children: TreeNode[]; // 자식 노드들 (다른 그룹 또는 사용자)
  // '하위조직개수'는 자식 노드의 수로 표현하거나, 모든 하위 사용자 수로 계산할 수 있습니다.
  // 여기서는 직접적인 자식 노드의 수로 간단히 표현합니다.
  childrenCount: number;
}

export interface UserTreeNode extends BaseNode {
  type: 'user';
  originalUser: User; // 원본 User 데이터
}

export type TreeNode = GroupNode | UserTreeNode;

// TreePanel.tsx 또는 helpers.ts

// 사용자 목록으로부터 계층적 트리 데이터를 생성하는 함수
export function buildOrganizationalTree(users: User[], rootDepth: number = 0): GroupNode[] {
  const rootHelper: GroupNode = { // 임시 루트 노드 (계층 생성을 돕기 위함)
    id: 'root',
    name: 'Organizations',
    type: 'group',
    depth: rootDepth - 1, // 실제 루트보다 한 단계 위
    children: [],
    childrenCount: 0,
  };

  users.forEach(user => {
    // user.team이 "회사/본부/팀" 형식의 경로라고 가정합니다.
    // 만약 user.team이 단순 팀 이름이라면, pathSegments는 [user.team]이 됩니다.
    const pathSegments = user.team.split('/');
    let currentNode = rootHelper;

    pathSegments.forEach((segmentName, index) => {
      const segmentId = `${currentNode.id === 'root' ? '' : currentNode.id + '/'}${segmentName}`;
      let childGroupNode = currentNode.children.find(
        child => child.type === 'group' && child.name === segmentName
      ) as GroupNode | undefined;

      if (!childGroupNode) {
        childGroupNode = {
          id: segmentId,
          name: segmentName,
          type: 'group',
          depth: currentNode.depth + 1,
          children: [],
          childrenCount: 0, // 나중에 업데이트 또는 동적 계산
        };
        currentNode.children.push(childGroupNode);
      }
      currentNode = childGroupNode;
    });

    // 사용자를 마지막 그룹(팀) 노드에 추가
    currentNode.children.push({
      id: `user-${user.id}`,
      name: user.username,
      type: 'user',
      depth: currentNode.depth + 1,
      originalUser: user,
    });
  });

  // 각 그룹 노드의 childrenCount 업데이트 (직접적인 자식 수 기준)
  function updateChildrenCounts(node: TreeNode): void {
    if (node.type === 'group') {
      node.childrenCount = node.children.length;
      node.children.forEach(updateChildrenCounts); // 재귀적으로 모든 하위 그룹 업데이트
    }
  }
  rootHelper.children.forEach(updateChildrenCounts);

  return rootHelper.children as GroupNode[]; // 실제 최상위 조직 목록 반환
}
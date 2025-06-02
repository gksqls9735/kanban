import ReactDOM from "react-dom/client";
import { Chat, Section, SelectOption, Task, User } from "../types/type";
import React from "react";
import { ShadowRootContext } from "../context/shadowroot-context";
import { StyleSheetManager } from "styled-components";
import Kanban from "../main-page/kanban";

import kanbanCssText from "../styles/kanban.css?raw";
import DatePickerText from "../styles/datetimepicker.css?raw";
import participantSelectorCssText from "../styles/participant-selector.css?raw";
import taskDetailCssText from "../styles/task-detail.css?raw";
import KanbanActionsContext, { KanbanActionsContextType } from "../context/task-action-context";

class KanbanWebComponent extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private container: HTMLDivElement | null = null;
  private componentShadowRoot: ShadowRoot | null = null;
  props: {   // 현재 props를 저장할 객체
    tasks: Task[];
    sections: Section[];
    statusList: SelectOption[];
    currentUser: User | null;
    userlist: User[];
    isSideMenuOpen: "expanded" | "collapsed" | "hidden";
    chatlist: Chat[];
  } = {
      tasks: [],
      sections: [],
      statusList: [],
      currentUser: null,
      userlist: [],
      isSideMenuOpen: "hidden",
      chatlist: [],
    };

  constructor() {
    super();
  }
  //https://cdn-minio.bizbee.co.kr/common/kanban/

  static get observedAttributes() {
    return ['tasks', 'sections', 'statuslist', 'currentuser', 'userlist', 'issidemenuopen', 'chatlist'];
  }

  async connectedCallback() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.componentShadowRoot = this.attachShadow({ mode: 'open' });

      try {
        const localCssPromises = [
          kanbanCssText, DatePickerText, participantSelectorCssText, taskDetailCssText
        ].map(cssText => {
          const sheet = new CSSStyleSheet();
          return sheet.replace(cssText).then(() => sheet);
        });

        const cdnCssPromise = fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css")
          .then(res => res.text())
          .then(text => {
            const sheet = new CSSStyleSheet();
            return sheet.replace(text).then(() => sheet);
          });

        const allSheets = await Promise.all([...localCssPromises, cdnCssPromise]);
        this.componentShadowRoot.adoptedStyleSheets = allSheets;
      } catch (error) {
        console.error("Failed to load stylesheet: ", error);
      }
      this.componentShadowRoot.appendChild(this.container);
    }
    this._updateProps();
    this._render();
  }

  // attribute 변경 시 호출될 콜백
  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    this._updateProps();
    this._render();
  }

  dispatchUpdateEvent(eventName: string, data: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: data,
        bubbles: true,
        composed: true,
      })
    );
  }

  // props 파싱 및 업데이트 로직
  _updateProps() {
    this.props.tasks = JSON.parse(this.getAttribute("tasks") || "[]");
    this.props.sections = JSON.parse(this.getAttribute("sections") || "[]");
    this.props.statusList = JSON.parse(this.getAttribute("statuslist") || "[]");
    this.props.userlist = JSON.parse(this.getAttribute("userlist") || "[]");
    this.props.chatlist = JSON.parse(this.getAttribute("chatlist") || "[]");

    const currentUserAttr = this.getAttribute("currentuser");
    if (currentUserAttr && currentUserAttr !== "{}") {
      try {
        this.props.currentUser = JSON.parse(currentUserAttr) as User;
      } catch (e) {
        console.error("Failed to parse currentUser attribute: ", e);
        this.props.currentUser = null;
      }
    } else {
      this.props.currentUser = null;
    }

    const sideMenuAttr = this.getAttribute("issidemenuopen");
    if (sideMenuAttr === "expanded" || sideMenuAttr === "collapsed" || sideMenuAttr === "hidden") {
      this.props.isSideMenuOpen = sideMenuAttr;
    } else {
      this.props.isSideMenuOpen = "hidden";
    }
  }

  // React 컴포넌트 랜더링 로직
  _render() {
    // 아직 container나 shadowRoot가 준비되지 않았음
    if (!this.container || !this.componentShadowRoot) return;

    const sectionTasksWithDates = this.props.tasks.map((t: Task) => ({
      ...t,
      start: new Date(t.start),
      end: new Date(t.end),
    }));

    const chatListWithDates = this.props.chatlist.map((chat: Chat) => ({
      ...chat, createdAt: new Date(chat.createdAt),
    }));

    if (!this.root) this.root = ReactDOM.createRoot(this.container);

    const taskActionContextValue: KanbanActionsContextType = {
      onTaskAdd: (data: Task) => this.dispatchUpdateEvent("kanban-task-added", { task: data }), // 페이로드 구조에 맞게
      onTasksChange: (data: Task[]) => this.dispatchUpdateEvent("kanban-task-updated", { tasks: data }),
      onTasksDelete: (data: string) => this.dispatchUpdateEvent("kanban-task-deleted", { taskId: data }), // string[] 예상
      onSectionsChange: (data: Section[]) => this.dispatchUpdateEvent("kanban-sections-updated", { sections: data }),
      onSectionDelete: (data: string) => this.dispatchUpdateEvent("kanban-section-deleted", { sectionId: data }), // alsoDeletedTaskIds는 예시
      onStatusesChange: (data: SelectOption[]) => this.dispatchUpdateEvent("kanban-status-definitions-updated", { statusOptions: data }),
      onChatlistChange: (data: Chat[]) => this.dispatchUpdateEvent("kanban-task-chats-updated", { chats: data }), // taskId와 chats를 함께 전달
      onSelectTaskId: (data: string | null) => this.dispatchUpdateEvent("kanban-task-selected", { taskId: data }),
    };


    this.root.render(
      React.createElement(
        ShadowRootContext.Provider,
        { value: this.componentShadowRoot },
        React.createElement(
          StyleSheetManager,
          { target: this.componentShadowRoot },
          React.createElement(KanbanActionsContext.Provider, { value: taskActionContextValue },
            React.createElement(Kanban, {
              tasks: sectionTasksWithDates,
              sections: this.props.sections,
              statusList: this.props.statusList,
              currentUser: this.props.currentUser,
              userlist: this.props.userlist,
              isSideMenuOpen: this.props.isSideMenuOpen,
              chatlist: chatListWithDates,
            })
          )
        )
      )
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

customElements.define("kanban-board", KanbanWebComponent);

export { };
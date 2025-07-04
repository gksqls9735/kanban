import ReactDOM from "react-dom/client";
import { Chat, Section, SelectOption, Task, User } from "../types/type";
import React from "react";
import { ShadowRootContext } from "../context/shadowroot-context";
import { StyleSheetManager } from "styled-components";
import Kanban from "../main-page/kanban";
import isEqual from 'lodash.isequal';

import kanbanCssText from "../styles/kanban.css?raw";
import DatePickerText from "../styles/datetimepicker.css?raw";
import participantSelectorCssText from "../styles/participant-selector.css?raw";
import taskDetailCssText from "../styles/task-detail.css?raw";
import KanbanActionsContext, { KanbanActionsContextType } from "../context/task-action-context";

class KanbanWebComponent extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private container: HTMLDivElement | null = null;
  private componentShadowRoot: ShadowRoot | null = null;

  _props: {   // 현재 _props를 저장할 객체
    currentUser: User | null;
    userlist: User[];
    tasks: Task[];
    sections: Section[];
    statusList: SelectOption[];
    chatlist: Chat[];
    detailModalTopPx: number;
  } = {
      tasks: [],
      sections: [],
      statusList: [],
      currentUser: null,
      userlist: [],
      chatlist: [],
      detailModalTopPx: 0,
    };

  constructor() {
    super();
  }
  //https://cdn-minio.bizbee.co.kr/common/kanban/

  static get observedAttributes() {
    return ['detailmodaltoppx'];
  }

  set currentUser(value: User | null) {
    if (this._props.currentUser === null && value === null) return;

    if (!isEqual(this._props.currentUser, value)) {
      this._props.currentUser = value;
      this._render();
    }
  }
  get currentUser(): User | null { return this._props.currentUser; }

  set userlist(value: User[]) {
    if (!isEqual(this._props.userlist, value)) {
      this._props.userlist = value;
      this._render();
    }
  }
  get userlist(): User[] { return this._props.userlist; }

  set tasks(value: Task[]) {
    if (!isEqual(this._props.tasks, value)) {
      this._props.tasks = value;
      this._render();
    }
  }
  get tasks(): Task[] { return this._props.tasks; }

  set sections(value: Section[]) {
    if (!isEqual(this._props.sections, value)) {
      this._props.sections = value;
      this._render();
    }
  }
  get sections(): Section[] { return this._props.sections; }

  set statusList(value: SelectOption[]) {
    if (!isEqual(this._props.statusList, value)) {
      this._props.statusList = value;
      this._render();
    }
  }
  get statusList(): SelectOption[] { return this._props.statusList; }

  set chatlist(value: Chat[]) {
    if (!isEqual(this._props.chatlist, value)) {
      this._props.chatlist = value;
      this._render();
    }
  }
  get chatlist(): Chat[] { return this._props.chatlist; }


  async connectedCallback() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.componentShadowRoot = this.attachShadow({ mode: 'open' });
      this.componentShadowRoot.appendChild(this.container);

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
    this._updatePropsFromAttributes();
    this._render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    if (name === 'detailmodaltoppx') {
      const parsedValue = newValue ? parseInt(newValue, 10) : 0;
      this._props.detailModalTopPx = isNaN(parsedValue) ? 0 : parsedValue;
      if (isNaN(parsedValue) && newValue !== null && newValue !== "") {
        console.warn(`Invalid detailmodaltoppx value: '${newValue}'. Defaulting to 0.`);
      }
    }

    this._render();
  }

  _updatePropsFromAttributes() {
    const topPx = this.getAttribute("detailmodaltoppx");
    const parsedTopPx = topPx ? parseInt(topPx, 10) : 0;
    this._props.detailModalTopPx = isNaN(parsedTopPx) ? 0 : parsedTopPx;
    if (isNaN(parsedTopPx) && topPx !== null && topPx !== "") {
      console.warn(`Invalid initial detailmodaltoppx value: '${topPx}'. Defaulting to 0.`);
    }
  }

  _parseAttr(attr: string, defaultValue: any) {
    try {
      const value = this.getAttribute(attr);
      const parsedValue = value ? JSON.parse(value) : defaultValue;
      return parsedValue;
    } catch (error) {
      console.error(`_parseAttr: Failed to parse attribute '${attr}':`, error);
      return defaultValue;
    }
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

  // React 컴포넌트 랜더링 로직
  _render() {
    // 아직 container나 shadowRoot가 준비되지 않았음
    if (!this.container || !this.componentShadowRoot) return;
    const sectionTasksWithDates = this._props.tasks.map((t: Task) => ({
      ...t,
      start: t.start instanceof Date ? t.start : new Date(t.start),
      end: t.end instanceof Date ? t.end : new Date(t.end),
    }));

    const chatListWithDates = this._props.chatlist.map((chat: Chat) => ({
      ...chat,
      createdAt: chat.createdAt instanceof Date ? chat.createdAt : new Date(chat.createdAt),
    }));

    console.log('KanbanWebComponent: _render called with _props:', this._props);
    console.log('KanbanWebComponent: sectionTasksWithDates (final check before render):', sectionTasksWithDates);
    console.log('KanbanWebComponent: chatListWithDates (final check before render):', chatListWithDates);
    console.log('KanbanWebComponent: sectionTasksWithDates.length:', sectionTasksWithDates.length);


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
      React.createElement(ShadowRootContext.Provider, { value: this.componentShadowRoot },
        React.createElement(StyleSheetManager, { target: this.componentShadowRoot },
          React.createElement(KanbanActionsContext.Provider, { value: taskActionContextValue },
            React.createElement(Kanban, {
              currentUser: this._props.currentUser,
              userlist: this._props.userlist,
              tasks: sectionTasksWithDates,
              sections: this._props.sections,
              statusList: this._props.statusList,
              chatlist: chatListWithDates,
              detailModalTopPx: this._props.detailModalTopPx,
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
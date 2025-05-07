import ReactDOM from "react-dom/client";
import { Section, SelectOption, Task, User } from "../types/type";
import React from "react";
import { ShadowRootContext } from "../context/shadowroot-context";
import { StyleSheetManager } from "styled-components";
import Kanban from "../main-page/kanban";

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
  } = {
      tasks: [],
      sections: [],
      statusList: [],
      currentUser: null,
      userlist: [],
      isSideMenuOpen: "hidden",
    };


  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['tasks', 'sections', 'statuslist', 'currentuser', 'userlist', 'issidemenuopen'];
  }

  async connectedCallback() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.componentShadowRoot = this.attachShadow({ mode: 'open' });

      try {
        const mainResponse = await fetch("/kanban.css");
        const mainCssText = await mainResponse.text();
        const mainSheet = new CSSStyleSheet();
        await mainSheet.replace(mainCssText);

        const pickerResponse = await fetch("/datetimepicker.css");
        const pickerCssText = await pickerResponse.text();
        const pickerSheet = new CSSStyleSheet();
        await pickerSheet.replace(pickerCssText);

        const selectorResponse = await fetch("/participant-selector.css");
        const selectorCssText = await selectorResponse.text();
        const selectorSheet = new CSSStyleSheet();
        await selectorSheet.replace(selectorCssText);

        const pretendardResponse = await fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
        const pretendardText = await pretendardResponse.text();
        const pretendardSheet = new CSSStyleSheet();
        await pretendardSheet.replace(pretendardText);

        this.componentShadowRoot.adoptedStyleSheets = [mainSheet, pickerSheet, selectorSheet, pretendardSheet];
      } catch (error) {
        console.error("Failed to load stylesheet: ", error);
      }
      this.componentShadowRoot.appendChild(this.container);
    }
    this._updateProps();
    this._render();
  }

  // attribute 변경 시 호출될 콜백
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    this._updateProps();
    this._render();
  }

  // props 파싱 및 업데이트 로직직
  _updateProps() {
    this.props.tasks = JSON.parse(this.getAttribute("tasks") || "[]");
    this.props.sections = JSON.parse(this.getAttribute("sections") || "[]");
    this.props.statusList = JSON.parse(this.getAttribute("statuslist") || "[]");
    this.props.userlist = JSON.parse(this.getAttribute("userlist") || "[]");

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

    if (!this.root) this.root = ReactDOM.createRoot(this.container);

    this.root.render(
      React.createElement(
        ShadowRootContext.Provider,
        { value: this.componentShadowRoot },
        React.createElement(
          StyleSheetManager,
          { target: this.componentShadowRoot },
          React.createElement(Kanban, {
            tasks: sectionTasksWithDates,
            sections: this.props.sections,
            statusList: this.props.statusList,
            currentUser: this.props.currentUser,
            userlist: this.props.userlist,
            isSideMenuOpen: this.props.isSideMenuOpen,
          })
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
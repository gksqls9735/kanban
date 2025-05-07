import React from "react";
import ReactDOM from "react-dom/client";
import { ShadowRootContext } from "../context/shadowroot-context";
import Kanban from "../main-page/kanban";
import { StyleSheetManager } from 'styled-components';

class KanbanWebComponent extends HTMLElement {
  root = null;
  container = null;
  componentShadowRoot = null;
  props = {};

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['tasks', 'sections', 'statuslist', 'currentuser', 'userlist', 'issidemenuopen'];
  }

  async connectedCallback() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.componentShadowRoot = this.attachShadow({ mode: "open" });

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
        console.error("Failed to load stylesheet:", error);
      }
      this.componentShadowRoot.appendChild(this.container);
    }
    this._updateProps();
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._updateProps();
    this._render();
  }

  _updateProps() {
    this.props.tasks = JSON.parse(this.getAttribute("tasks") || "[]");
    this.props.sections = JSON.parse(this.getAttribute("sections") || "[]");
    this.props.statusList = JSON.parse(this.getAttribute("statuslist") || "[]");
    this.props.currentUser = JSON.parse(this.getAttribute("currentuser") || "{}");
    this.props.userlist = JSON.parse(this.getAttribute("userlist") || "[]");

    const isSideMenuOpenAttr = this.getAttribute("issidemenuopen");
    this.props.isSideMenuOpen = isSideMenuOpenAttr === "true";
  }

  _render() {
    if (!this.container || !this.componentShadowRoot) return;

    const sectionTasksWithDates = this.props.tasks.map(t => ({
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

customElements.define("js-kanban-board", KanbanWebComponent);

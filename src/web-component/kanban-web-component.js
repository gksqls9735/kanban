import React from "react";
import ReactDOM from "react-dom/client";
import { ShadowRootContext } from "../context/shadowroot-context";
import Kanban from "../main-page/kanban";
import { StyleSheetManager } from 'styled-components';

class KanbanWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.container = null;
    this.componentShadowRoot = null;
  }

  async connectedCallback() {
    let shadowRoot;
    if (!this.container) {
      this.container = document.createElement("div");
      shadowRoot = this.attachShadow({ mode: "open" });
      this.componentShadowRoot = shadowRoot;

      try {
        const response = await fetch("/kanban.css");
        const cssText = await response.text();
        const sheet = new CSSStyleSheet();
        await sheet.replace(cssText);

        const pretendardResponse = await fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
        const pretendardText = await pretendardResponse.text();
        const pretendardSheet = new CSSStyleSheet();
        await pretendardSheet.replace(pretendardText);

        shadowRoot.adoptedStyleSheets = [sheet, pretendardSheet];
      } catch (error) {
        console.error("Failed to load stylesheet:", error);
      }
      shadowRoot.appendChild(this.container);
    }

    if (!shadowRoot) {
      console.error("Shadow root is not available.");
      return;
    }

    const tasks = JSON.parse(this.getAttribute("tasks") || "[]");
    const sections = JSON.parse(this.getAttribute("sections") || "[]");
    const statusList = JSON.parse(this.getAttribute("statuslist") || "[]");

    const sectionTasksWithDates = tasks.map((task) => ({
      ...task,
      start: new Date(task.start),
      end: new Date(task.end),
    }));

    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      React.createElement(
        ShadowRootContext.Provider,
        { value: shadowRoot },
        React.createElement(
          StyleSheetManager,
          { target: shadowRoot },
          React.createElement(Kanban, {
            tasks: sectionTasksWithDates,
            sections,
            statusList
          })
        )
      )
    )
  }

  disconnectedCallback() {
    if (this.root) this.root.unmount();
  }
}

customElements.define("kanban-board", KanbanWebComponent);
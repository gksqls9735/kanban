import React from "react";
import ReactDOM from "react-dom/client";
import { ShadowRootContext } from "../context/shadowroot-context";
import Kanban from "../main-page/kanban";

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

        shadowRoot.adoptedStyleSheets = [sheet];
      } catch (error) {
        console.error("Failed to load stylesheet:", error);
      }
      shadowRoot.appendChild(this.container);
    }

    if (!shadowRoot) {
      console.error("Shadow root is not available.");
      return;
    }

    const test = this.getAttribute("test"); // 타입 단언 제거

    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      React.createElement(
        ShadowRootContext.Provider,
        {value: shadowRoot},
        React.createElement(Kanban, {
          test
        })
      )
    )
  }

  disconnectedCallback() {
    if (this.root) this.root.unmount();
  }
}

customElements.define("kanban-board", KanbanWebComponent);
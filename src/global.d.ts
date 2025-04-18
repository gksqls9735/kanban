declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanban-board": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          tasks: string;
          sections: string;
        },
        HTMLElement
      >;
    }
  }
}
export {};

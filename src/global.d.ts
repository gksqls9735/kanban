declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanban-board": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          test: string;
        },
        HTMLElement
      >;
    }
  }
}
export {};

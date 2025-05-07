declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanban-board": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          tasks: string;
          sections: string;
          statuslist: string;
          currentUser: string;
          userlist: string;
          isSideMenuOpen: string;
        },
        HTMLElement
      >;
    }
  }
}
export { };

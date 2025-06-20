import { Section, SelectOption, Task, User } from "./types/type";

declare interface KanbanWebComponentElement extends HTMLElement {
  currentUser: User | null;
  userlist: User[];
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
  isSideMenuOpen: "expanded" | "collapsed" | "hidden";
  chatlist: Chat[];
  detailModalTopPx: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanban-board": React.DetailedHTMLProps<
        React.HTMLAttributes<KanbanWebComponentElement> & {
          isSideMenuOpen?: "expanded" | "collapsed" | "hidden";
          detailModalTopPx?: string | number;
        },
        KanbanWebComponentElement
      >;
    }
  }
}

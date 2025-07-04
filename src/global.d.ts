import { Section, SelectOption, Task, User } from "./types/type";

declare interface KanbanWebComponentElement extends HTMLElement {
  currentUser: User | null;
  userlist: User[];
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
  chatlist: Chat[];
  detailModalTopPx: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanban-board": React.DetailedHTMLProps<
        React.HTMLAttributes<KanbanWebComponentElement> & {
          detailModalTopPx?: string | number;
        },
        KanbanWebComponentElement
      >;
    }
  }
}

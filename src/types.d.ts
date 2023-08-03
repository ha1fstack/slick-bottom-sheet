import { Point } from "framer-motion";

interface VisualElementDragControls extends object {
  isDragging: boolean;
  currentDirection: DragDirection | null;
  panSession?: {
    end(): void;
  };
}
declare module "framer-motion" {
  export interface DragControls {
    componentControls: Set<VisualElementDragControls>;
  }
}

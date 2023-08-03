interface VisualElementDragControls {
  isDragging: boolean;
  panSession?: {
    end(): void;
  };
}
export interface _DragControls {
  componentControls: Set<VisualElementDragControls>;
}

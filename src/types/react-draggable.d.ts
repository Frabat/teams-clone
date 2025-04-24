declare module 'react-draggable' {
  import * as React from 'react';

  export interface DraggableData {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
  }

  export interface DraggableProps {
    allowAnyClick?: boolean;
    axis?: 'both' | 'x' | 'y' | 'none';
    bounds?: { left?: number; top?: number; right?: number; bottom?: number } | string | false;
    defaultClassName?: string;
    defaultClassNameDragging?: string;
    defaultClassNameDragged?: string;
    defaultPosition?: { x: number; y: number };
    disabled?: boolean;
    grid?: [number, number];
    handle?: string;
    offsetParent?: HTMLElement;
    onMouseDown?: (e: MouseEvent) => void;
    onStart?: (e: MouseEvent, data: DraggableData) => void | false;
    onDrag?: (e: MouseEvent, data: DraggableData) => void | false;
    onStop?: (e: MouseEvent, data: DraggableData) => void;
    position?: { x: number; y: number };
    positionOffset?: { x: number | string; y: number | string };
    scale?: number;
  }

  export default class Draggable extends React.Component<DraggableProps> {}
} 
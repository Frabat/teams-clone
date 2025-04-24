import React, { useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface AutoPTOEventProps {
  name: string;
  startTime: string;
  duration: number;
  style?: React.CSSProperties;
  onPositionChange?: (newPosition: { x: number; y: number }) => void;
  onResizeStop?: (size: { width: number; height: number }) => void;
}

const EventContainer = styled(Box)({
  position: 'absolute',
  backgroundColor: '#FEF6F5',
  border: '1px solid #F3C6C3',
  borderLeft: '3px solid #D74638',
  borderRadius: '3px',
  padding: '4px 8px',
  cursor: 'move',
  zIndex: 100,
  width: '100%',
  boxSizing: 'border-box',
  '&:hover': {
    backgroundColor: '#FEE4E2',
  },
  '.react-resizable-handle': {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(215, 70, 56, 0.1)',
    },
    '&.react-resizable-handle-s': {
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      cursor: 'ns-resize',
      height: '4px',
      width: '100%',
    },
    '&.react-resizable-handle-e': {
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'ew-resize',
      width: '4px',
      height: '100%',
    },
    '&.react-resizable-handle-se': {
      bottom: '0',
      right: '0',
      cursor: 'nwse-resize',
      width: '12px',
      height: '12px',
    },
  },
});

const AutoPTOEvent: React.FC<AutoPTOEventProps> = ({
  name,
  startTime,
  duration,
  style,
  onPositionChange,
  onResizeStop,
}) => {
  const [size, setSize] = useState({
    width: 200,
    height: duration * 60, // 60px per hour
  });

  const handleResize = (e: React.SyntheticEvent, { size: newSize }: { size: { width: number; height: number } }) => {
    // Snap height to hour grid
    const snappedHeight = Math.round(newSize.height / 60) * 60;
    // Snap width to 50px increments
    const snappedWidth = Math.round(newSize.width / 50) * 50;
    
    const finalSize = {
      width: snappedWidth,
      height: snappedHeight,
    };
    
    setSize(finalSize);
    onResizeStop?.(finalSize);
  };

  return (
    <Draggable
      bounds="parent"
      grid={[0, 60]} // Snap to hour grid (y-axis only)
      onStop={(e, data) => onPositionChange?.(data)}
      axis="y" // Only allow vertical dragging
    >
      <Box position="absolute" style={style}>
        <Resizable
          height={size.height}
          width={size.width}
          resizeHandles={['s', 'e', 'se']}
          minConstraints={[150, 60]} // Minimum width 150px, height 1 hour
          maxConstraints={[400, 720]} // Maximum width 400px, height 12 hours
          onResizeStop={handleResize}
          draggableOpts={{ grid: [50, 60] }} // Snap to 50px horizontally, 60px vertically
        >
          <EventContainer style={{ height: `${size.height}px`, width: `${size.width}px` }}>
            <Typography variant="body2" sx={{ color: '#D74638', fontWeight: 500, fontSize: '13px' }}>
              {name} - (Auto)
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '12px', display: 'block', mt: 0.5 }}>
              {startTime}
            </Typography>
          </EventContainer>
        </Resizable>
      </Box>
    </Draggable>
  );
};

export default AutoPTOEvent; 
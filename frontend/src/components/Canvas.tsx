import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onAddElement: (type: 'text' | 'image' | 'shape' | 'drawing') => void;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'drawing';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    opacity?: number;
    rotation?: number;
  };
  zIndex: number;
}

const Canvas: React.FC<CanvasProps> = ({ elements, onElementsChange, onAddElement }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);

  const handleMouseDown = (e: React.MouseEvent, elementId?: string) => {
    if (elementId) {
      setSelectedElement(elementId);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      onElementsChange(elements.map(element => 
        element.id === selectedElement
          ? {
              ...element,
              position: {
                x: element.position.x + dx,
                y: element.position.y + dy
              }
            }
          : element
      ));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDrawingPath([...drawingPath, { x, y }]);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      // Create a new drawing element
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'drawing',
        content: JSON.stringify(drawingPath),
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        style: {
          color: '#000000',
          opacity: 1
        },
        zIndex: elements.length
      };
      onElementsChange([...elements, newElement]);
      setDrawingPath([]);
    }
    setIsDragging(false);
    setIsDrawing(false);
  };

  const handleAddElement = (type: 'text' | 'image' | 'shape' | 'drawing') => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'New Text' : '',
      position: { x: 100, y: 100 },
      size: { width: 200, height: type === 'text' ? 50 : 200 },
      style: {
        color: '#000000',
        backgroundColor: type === 'shape' ? '#ffffff' : undefined,
        fontSize: type === 'text' ? 16 : undefined,
        fontFamily: type === 'text' ? 'Arial' : undefined,
        borderColor: type === 'shape' ? '#000000' : undefined,
        borderWidth: type === 'shape' ? 1 : undefined,
        borderRadius: type === 'shape' ? 0 : undefined,
        opacity: 1
      },
      zIndex: elements.length
    };
    onElementsChange([...elements, newElement]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: 'image',
          content: event.target?.result as string,
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          style: {
            opacity: 1
          },
          zIndex: elements.length
        };
        onElementsChange([...elements, newElement]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-xl shadow-lg p-2 flex space-x-2">
        <button
          onClick={() => handleAddElement('text')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add Text"
        >
          <i className="fas fa-font"></i>
        </button>
        <button
          onClick={() => handleAddElement('shape')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add Shape"
        >
          <i className="fas fa-shapes"></i>
        </button>
        <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <i className="fas fa-image"></i>
        </label>
        <button
          onClick={() => {
            setIsDrawing(true);
            setDrawingPath([]);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isDrawing ? 'bg-primary text-white' : 'hover:bg-gray-100'
          }`}
          title="Draw"
        >
          <i className="fas fa-pen"></i>
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full bg-white rounded-xl shadow-inner overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((element) => (
          <motion.div
            key={element.id}
            initial={false}
            animate={{
              x: element.position.x,
              y: element.position.y,
              width: element.size.width,
              height: element.size.height,
              rotate: element.style.rotation || 0,
              opacity: element.style.opacity || 1
            }}
            style={{
              position: 'absolute',
              zIndex: element.zIndex,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.type === 'text' && (
              <div
                style={{
                  color: element.style.color,
                  fontSize: element.style.fontSize,
                  fontFamily: element.style.fontFamily,
                  backgroundColor: element.style.backgroundColor,
                  padding: '8px',
                  borderRadius: element.style.borderRadius,
                  border: element.style.borderWidth
                    ? `${element.style.borderWidth}px solid ${element.style.borderColor}`
                    : 'none'
                }}
              >
                {element.content}
              </div>
            )}
            {element.type === 'image' && (
              <img
                src={element.content}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: element.style.borderRadius
                }}
              />
            )}
            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style.backgroundColor,
                  border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                  borderRadius: element.style.borderRadius
                }}
              />
            )}
            {element.type === 'drawing' && (
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <path
                  d={JSON.parse(element.content)
                    .map((point: { x: number; y: number }, index: number) =>
                      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
                    )
                    .join(' ')}
                  stroke={element.style.color}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
          </motion.div>
        ))}
        {isDrawing && (
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <path
              d={drawingPath
                .map((point, index) =>
                  index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
                )
                .join(' ')}
              stroke="#000000"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Canvas; 
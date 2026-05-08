import React, { useState, useEffect, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as fabric from "fabric";

export default function DesignEditor({ tempImage, setTempImage, onSave, displayDims, setDisplayDims }) {
  const [isCropping, setIsCropping] = useState(true);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [drawMode, setDrawMode] = useState("select"); // "select" or "free"
  const [brushColor, setBrushColor] = useState("#ff0000");
  
  const imgRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!isCropping && tempImage) {
      const timeout = setTimeout(() => {
        const canvas = new fabric.Canvas("fabric-canvas", {
          width: displayDims.w,
          height: displayDims.h,
          backgroundColor: "transparent",
          isDrawingMode: false,
        });
        
        // Brush settings
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = brushColor;

        fabricCanvasRef.current = canvas;
      }, 200);
      return () => { fabricCanvasRef.current?.dispose(); };
    }
  }, [isCropping, tempImage, displayDims]);

  // Handle Brush Mode Toggle
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = (drawMode === "free");
      fabricCanvasRef.current.freeDrawingBrush.color = brushColor;
    }
  }, [drawMode, brushColor]);

  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!completedCrop || !image) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    
    const screenW = Math.min(window.innerWidth - 60, 350);
    setDisplayDims({ w: screenW, h: screenW * (completedCrop.height / completedCrop.width) });
    setTempImage(canvas.toDataURL('image/png'));
    setIsCropping(false);
  };

  const addShape = (type) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setDrawMode("select"); // Switch to select mode when adding shapes
    
    let obj;
    if (type === 'rect') {
      obj = new fabric.Rect({ width: 80, height: 80, fill: 'transparent', stroke: brushColor, strokeWidth: 4, left: 50, top: 50 });
    } else if (type === 'circle') {
      obj = new fabric.Circle({ radius: 40, fill: 'transparent', stroke: brushColor, strokeWidth: 4, left: 50, top: 50 });
    } else if (type === 'text') {
      obj = new fabric.IText("Double Tap", { fontSize: 20, fill: brushColor, left: 50, top: 50 });
    } else if (type === 'arrow') {
      // Arrow Polygon Points
      const points = [
        { x: 0, y: 5 }, { x: 30, y: 5 }, { x: 30, y: 0 }, 
        { x: 45, y: 10 }, { x: 30, y: 20 }, { x: 30, y: 15 }, { x: 0, y: 15 }
      ];
      obj = new fabric.Polygon(points, { fill: brushColor, left: 50, top: 50, scaleX: 1.5, scaleY: 1.5 });
    }
    
    canvas.add(obj);
    canvas.setActiveObject(obj);
  };

  const undo = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas._objects.length > 0) {
      canvas.remove(canvas._objects[canvas._objects.length - 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-5 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 italic">
            {isCropping ? "1. Crop Area" : "2. Design & Scan"}
          </h3>
          <button onClick={() => setTempImage(null)} className="text-red-500 font-black">✕</button>
        </div>

        {isCropping ? (
          <div className="overflow-auto max-h-[400px] border rounded-2xl">
            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
              <img ref={imgRef} src={tempImage} crossOrigin="anonymous" onLoad={e => setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, undefined, e.currentTarget.width, e.currentTarget.height), e.currentTarget.width, e.currentTarget.height))} />
            </ReactCrop>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-2 rounded-2xl">
              <button onClick={() => setDrawMode(drawMode === "free" ? "select" : "free")} className={`p-2 rounded-lg text-[8px] font-black ${drawMode === 'free' ? 'bg-black text-white' : 'bg-white'}`}>BRUSH</button>
              <button onClick={() => addShape('arrow')} className="p-2 bg-white rounded-lg text-[8px] font-black">ARROW</button>
              <button onClick={() => addShape('rect')} className="p-2 bg-white rounded-lg text-[8px] font-black">RECT</button>
              <button onClick={() => addShape('circle')} className="p-2 bg-white rounded-lg text-[8px] font-black">CIRCLE</button>
              <button onClick={() => addShape('text')} className="p-2 bg-white rounded-lg text-[8px] font-black">TEXT</button>
              <button onClick={undo} className="p-2 bg-white rounded-lg text-[8px] font-black">UNDO</button>
              <button onClick={() => fabricCanvasRef.current?.remove(fabricCanvasRef.current.getActiveObject())} className="p-2 bg-red-50 text-red-500 rounded-lg text-[8px] font-black">DEL</button>
              <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-full rounded-md border-none cursor-pointer" />
            </div>

            {/* Canvas Area */}
            <div className="relative border rounded-3xl overflow-hidden mx-auto shadow-inner bg-gray-50" style={{ width: displayDims.w, height: displayDims.h }}>
               <img src={tempImage} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
               <canvas id="fabric-canvas" className="relative z-10" />
            </div>
          </div>
        )}

        <button 
          onClick={isCropping ? getCroppedImg : () => onSave(fabricCanvasRef.current)}
          className="w-full mt-6 bg-black text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-transform"
        >
          {isCropping ? "Next: Design" : "Save & Scan Text"}
        </button>
      </div>
    </div>
  );
}
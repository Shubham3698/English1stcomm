import React, { useState, useEffect, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as fabric from "fabric";

export default function DesignEditor({ tempImage, setTempImage, onSave, displayDims, setDisplayDims }) {
  const [isCropping, setIsCropping] = useState(true);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [drawMode, setDrawMode] = useState("select"); 
  const [brushColor, setBrushColor] = useState("#3b82f6"); 
  
  const imgRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    if (!isCropping && tempImage) {
      const timeout = setTimeout(() => {
        const canvas = new fabric.Canvas("fabric-canvas", {
          width: displayDims.w,
          height: displayDims.h,
          backgroundColor: "transparent",
          isDrawingMode: false,
        });
        
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 4;
        canvas.freeDrawingBrush.color = brushColor;
        fabricCanvasRef.current = canvas;
      }, 200);
      return () => { fabricCanvasRef.current?.dispose(); };
    }
  }, [isCropping, tempImage, displayDims]);

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
    setDrawMode("select");
    
    let obj;
    const common = { fill: 'transparent', stroke: brushColor, strokeWidth: 3, left: 50, top: 50 };
    if (type === 'rect') obj = new fabric.Rect({ ...common, width: 60, height: 60 });
    else if (type === 'circle') obj = new fabric.Circle({ ...common, radius: 30 });
    else if (type === 'text') obj = new fabric.IText("EDIT_TEXT", { fontSize: 18, fill: brushColor, left: 50, top: 50, fontWeight: '900', fontStyle: 'italic' });
    else if (type === 'arrow') {
      const points = [{ x: 0, y: 5 }, { x: 25, y: 5 }, { x: 25, y: 0 }, { x: 35, y: 10 }, { x: 25, y: 20 }, { x: 25, y: 15 }, { x: 0, y: 15 }];
      obj = new fabric.Polygon(points, { fill: brushColor, left: 50, top: 50 });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#08080a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="bg-[#0d0d0f] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[95vh] relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[11px] font-black uppercase text-blue-500 tracking-[0.2em] italic">
              {isCropping ? "Unit_Calibration" : "Neural_Design_Interface"}
            </h3>
            <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">Step {isCropping ? "01" : "02"} of Processing</p>
          </div>
          <button onClick={() => setTempImage(null)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all">✕</button>
        </div>

        {isCropping ? (
          <div className="relative border border-white/5 rounded-xl overflow-hidden bg-black shadow-inner">
            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
              <img ref={imgRef} src={tempImage} className="max-h-[400px] object-contain" crossOrigin="anonymous" onLoad={e => setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, undefined, e.currentTarget.width, e.currentTarget.height), e.currentTarget.width, e.currentTarget.height))} />
            </ReactCrop>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Pro Toolbar */}
            <div className="grid grid-cols-4 gap-2 bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
              <button onClick={() => setDrawMode(drawMode === "free" ? "select" : "free")} className={`p-2.5 rounded-lg text-[8px] font-black tracking-tighter border transition-all ${drawMode === 'free' ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/40 text-gray-500 border-white/5'}`}>BRUSH</button>
              <button onClick={() => addShape('arrow')} className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 hover:text-white transition-all">ARROW</button>
              <button onClick={() => addShape('rect')} className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 hover:text-white transition-all">RECT</button>
              <button onClick={() => addShape('circle')} className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 hover:text-white transition-all">CIRCLE</button>
              <button onClick={() => addShape('text')} className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 hover:text-white transition-all">TEXT</button>
              <button onClick={() => fabricCanvasRef.current?.remove(fabricCanvasRef.current.getActiveObject())} className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[8px] font-black hover:bg-red-500 hover:text-white transition-all">DEL</button>
              <button onClick={() => { const c = fabricCanvasRef.current; if(c && c._objects.length > 0) c.remove(c._objects[c._objects.length - 1]); }} className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 transition-all">UNDO</button>
              <div className="relative">
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-full absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-full h-full rounded-lg border border-white/20" style={{ backgroundColor: brushColor }}></div>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="relative border border-blue-500/20 rounded-2xl overflow-hidden mx-auto shadow-2xl bg-black" style={{ width: displayDims.w, height: displayDims.h }}>
               <img src={tempImage} className="absolute inset-0 w-full h-full object-contain opacity-50 grayscale pointer-events-none" />
               <canvas id="fabric-canvas" className="relative z-10" />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={isCropping ? getCroppedImg : () => onSave(fabricCanvasRef.current)}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
        >
          {/* 🔥 FIX: Changed button text to remove 'Scan Signal' 🔥 */}
          {isCropping ? "Initialize_Design" : "Finalize_Design"}
        </button>
      </div>
      
      <style jsx>{`
        .canvas-container { margin: 0 auto !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
import React from 'react';

export default function CanvasPreview({
  canvasRef,
  imageLoaded,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
}) {
  return (
    <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">👁️ Live Preview</h2>
      <p className="text-sm text-gray-600 mb-4">💡 Drag text elements on the canvas to reposition them</p>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border-4 border-purple-400">
        {imageLoaded ? (
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-move"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        ) : (
          <div className="py-40 text-center">
            <div className="text-9xl mb-6 opacity-30">🎨</div>
            <p className="text-gray-400 text-xl font-semibold">No Image Loaded</p>
            <p className="text-gray-500 text-sm">Upload an image to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}

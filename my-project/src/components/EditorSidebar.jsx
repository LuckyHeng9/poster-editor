import React from 'react';

export default function EditorSidebar({
  loading,
  imageLoaded,
  fileInputRef,
  handleImageUpload,
  downloadImage,
  buyingRate,
  setBuyingRate,
  sellingRate,
  setSellingRate,
  time,
  setTime,
  englishTime,
  setEnglishTime,
  khmerPeriod,
  setKhmerPeriod,
  currency,
  setCurrency,
  khmerColor,
  setKhmerColor,
  englishColor,
  setEnglishColor,
  rateColor,
  setRateColor,
  fontFamily,
  setFontFamily,
  daySize,
  setDaySize,
  monthSize,
  setMonthSize,
  yearSize,
  setYearSize,
  englishDateSize,
  setEnglishDateSize,
  timeSize,
  setTimeSize,
  englishTimeSize,
  setEnglishTimeSize,
  khmerPeriodSize,
  setKhmerPeriodSize,
  currencySize,
  setCurrencySize,
  buyingSize,
  setBuyingSize,
  sellingSize,
  setSellingSize,
  dayPos,
  setDayPos,
  monthPos,
  setMonthPos,
  yearPos,
  setYearPos,
  englishDatePos,
  setEnglishDatePos,
  timePos,
  setTimePos,
  englishTimePos,
  setEnglishTimePos,
  khmerPeriodPos,
  setKhmerPeriodPos,
  buyingPos,
  setBuyingPos,
  sellingPos,
  setSellingPos,
  draggingElement,
  currentPos,
  day,
  setDay,
  month,
  setMonth,
  year,
  setYear,
  englishDay,
  setEnglishDay,
  englishMonth,
  setEnglishMonth,
  englishYear,
  setEnglishYear,
}) {
  return (
    <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-screen pr-2">
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📁 Upload Image</h2>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-xl p-6 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:scale-105'
            }`}
          >
            {loading ? '⏳ Loading...' : imageLoaded ? '✅ Image Loaded' : '📁 Choose Image'}
          </button>
        </div>
        {imageLoaded && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-900 font-semibold">
              ✅ Image loaded! Drag on canvas or use sliders.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={downloadImage}
        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
      >
        💾 Download as PNG
      </button>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Other Values</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Buying Rate</label>
            <input
              type="text"
              value={buyingRate}
              onChange={(e) => setBuyingRate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none"
              placeholder="Buying Rate"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Selling Rate</label>
            <input
              type="text"
              value={sellingRate}
              onChange={(e) => setSellingRate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:border-red-500 outline-none"
              placeholder="Selling Rate"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Time (Khmer)</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Time (Khmer)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Time (English)</label>
            <input
              type="text"
              value={englishTime}
              onChange={(e) => setEnglishTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Time (English)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Period (Khmer)</label>
            <input
              type="text"
              value={khmerPeriod}
              onChange={(e) => setKhmerPeriod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Khmer Period"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Currency"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Text Colors</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Khmer Texts Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={khmerColor}
                onChange={(e) => setKhmerColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={khmerColor}
                onChange={(e) => setKhmerColor(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">English Texts Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={englishColor}
                onChange={(e) => setEnglishColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={englishColor}
                onChange={(e) => setEnglishColor(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono"
                placeholder="#eece69"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Rates Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={rateColor}
                onChange={(e) => setRateColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={rateColor}
                onChange={(e) => setRateColor(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
            >
              <option value="Kantumruy Pro">Kantumruy Pro</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Coordinate Positions (%)</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {[
            { label: 'Day (Khmer)', pos: dayPos, setPos: setDayPos },
            { label: 'Month (Khmer)', pos: monthPos, setPos: setMonthPos },
            { label: 'Year (Khmer)', pos: yearPos, setPos: setYearPos },
            { label: 'English Date', pos: englishDatePos, setPos: setEnglishDatePos },
            { label: 'Time (Khmer)', pos: timePos, setPos: setTimePos },
            { label: 'Time (English)', pos: englishTimePos, setPos: setEnglishTimePos },
            { label: 'Period (Khmer)', pos: khmerPeriodPos, setPos: setKhmerPeriodPos },
            { label: 'Buying Rate', pos: buyingPos, setPos: setBuyingPos },
            { label: 'Selling Rate', pos: sellingPos, setPos: setSellingPos },
          ].map((item, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="block text-xs font-bold text-gray-700 mb-1">{item.label}</span>
              <div className="flex gap-2">
                <div className="flex items-center flex-1 bg-gray-50 rounded-lg px-2 border border-gray-200">
                  <span className="text-xs text-gray-400 font-mono mr-1">X:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.pos.x}
                    onChange={(e) =>
                      item.setPos({ ...item.pos, x: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-transparent border-0 outline-none text-xs font-mono py-1"
                  />
                </div>
                <div className="flex items-center flex-1 bg-gray-50 rounded-lg px-2 border border-gray-200">
                  <span className="text-xs text-gray-400 font-mono mr-1">Y:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.pos.y}
                    onChange={(e) =>
                      item.setPos({ ...item.pos, y: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-transparent border-0 outline-none text-xs font-mono py-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📏 Font Sizes</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Day: {daySize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={daySize}
              onChange={(e) => setDaySize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Month: {monthSize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={monthSize}
              onChange={(e) => setMonthSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Year: {yearSize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={yearSize}
              onChange={(e) => setYearSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              English Date: {englishDateSize}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={englishDateSize}
              onChange={(e) => setEnglishDateSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Time (Khmer): {timeSize}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={timeSize}
              onChange={(e) => setTimeSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Time (English): {englishTimeSize}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={englishTimeSize}
              onChange={(e) => setEnglishTimeSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Khmer Period: {khmerPeriodSize}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={khmerPeriodSize}
              onChange={(e) => setKhmerPeriodSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Currency: {currencySize}px
            </label>
            <input
              type="range"
              min="10"
              max="150"
              value={currencySize}
              onChange={(e) => setCurrencySize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Buying Rate: {buyingSize}px
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={buyingSize}
              onChange={(e) => setBuyingSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Selling Rate: {sellingSize}px
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={sellingSize}
              onChange={(e) => setSellingSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Current Dragged Position</h2>
        {draggingElement && currentPos ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">Dragging: {draggingElement}</p>
            <p className="text-sm text-blue-800 font-mono">X: {currentPos.x.toFixed(2)}%</p>
            <p className="text-sm text-blue-800 font-mono">Y: {currentPos.y.toFixed(2)}%</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Drag an element on the canvas to see active coordinates here
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Khmer Date</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Day</label>
            <input
              type="text"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Day"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Month"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Year"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ International Date</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Day</label>
            <input
              type="text"
              value={englishDay}
              onChange={(e) => setEnglishDay(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Day"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Month</label>
            <input
              type="text"
              value={englishMonth}
              onChange={(e) => setEnglishMonth(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Month"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
            <input
              type="text"
              value={englishYear}
              onChange={(e) => setEnglishYear(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Year"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

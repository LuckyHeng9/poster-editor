import React, { useState, useRef, useEffect } from 'react';

export default function DynamicPosterUI() {
  const formatNumber = (num) => {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const convertToKhmer = (num) => {
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).split('').map(digit => khmerNumbers[parseInt(digit)]).join('');
  };

  const getKhmerTimePeriod = (hours) => {
    if (hours >= 5 && hours < 12) return 'ព្រឹក';
    if (hours >= 12 && hours < 17) return 'រសៀល';
    if (hours >= 17 && hours < 21) return 'ល្ងាច';
    return 'យប់';
  };

  const getLocalDateTime = () => {
    const now = new Date();
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = now.getDate();
    const month = khmerMonths[now.getMonth()];
    const englishMonth = englishMonths[now.getMonth()];
    const year = now.getFullYear();
    const englishYear = now.getFullYear();
    const hours24 = now.getHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const khmerTimePeriod = getKhmerTimePeriod(hours24);
    
    return {
      day: convertToKhmer(day),
      month: month,
      year: convertToKhmer(year),
      englishDay: day.toString(),
      englishMonth: englishMonth,
      englishYear: englishYear.toString(),
      time: `${convertToKhmer(hours12)}:${convertToKhmer(minutes)}`,
      englishTime: `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`
    };
  };

  const localDateTime = getLocalDateTime();
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(localDateTime.day);
  const [month, setMonth] = useState(localDateTime.month);
  const [year, setYear] = useState('');
  const [englishDay, setEnglishDay] = useState(localDateTime.englishDay);
  const [englishMonth, setEnglishMonth] = useState(localDateTime.englishMonth);
  const [englishYear, setEnglishYear] = useState(localDateTime.englishYear);
  const [time, setTime] = useState(localDateTime.time);
  const [englishTime, setEnglishTime] = useState(localDateTime.englishTime);
  const [khmerPeriod, setKhmerPeriod] = useState(getKhmerTimePeriod(new Date().getHours()));
  const [currency, setCurrency] = useState(''); 
  const [buyingRate, setBuyingRate] = useState('4,021');
  const [sellingRate, setSellingRate] = useState('4,030');
  const [textColor, setTextColor] = useState('#eece69');
  const [fontFamily, setFontFamily] = useState('Kantumruy Pro');
  const [daySize, setDaySize] = useState(32);
  const [monthSize, setMonthSize] = useState(32);
  const [yearSize, setYearSize] = useState(32);
  const [englishDateSize, setEnglishDateSize] = useState(32);
  const [timeSize, setTimeSize] = useState(30);
  const [englishTimeSize, setEnglishTimeSize] = useState(32);
  const [khmerPeriodSize, setKhmerPeriodSize] = useState(32);
  const [currencySize, setCurrencySize] = useState(48);
  const [buyingSize, setBuyingSize] = useState(100);
  const [sellingSize, setSellingSize] = useState(100);
  const [dayPos, setDayPos] = useState({ x: 23.94, y: 38.80 });
  const [monthPos, setMonthPos] = useState({ x: 34.24, y: 39.13 });
  const [yearPos, setYearPos] = useState({ x: 50, y: 48 });
  const [englishDatePos, setEnglishDatePos] = useState({ x: 32.58, y: 42.45 });
  const [englishTimePos, setEnglishTimePos] = useState({ x:80.65, y: 42.34 });
  const [timePos, setTimePos] = useState({ x: 78.19, y: 39.06 });
  const [khmerPeriodPos, setKhmerPeriodPos] = useState({ x: 88.86, y: 38.83 });
  const [currencyPos, setCurrencyPos] = useState({ x: 18, y: 62 });
  const [buyingPos, setBuyingPos] = useState({ x: 48.70, y: 65.06 });
  const [sellingPos, setSellingPos] = useState({ x: 79.45, y: 64.56 });
  const [draggingElement, setDraggingElement] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours24 = now.getHours();
      const hours12 = hours24 % 12 || 12;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const khmerTimePeriod = getKhmerTimePeriod(hours24);
      
      setTime(`${convertToKhmer(hours12)}:${convertToKhmer(minutes)}`);
      setEnglishTime(`${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`);
      setKhmerPeriod(khmerTimePeriod);
    };
    
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const localDT = getLocalDateTime();
      setDay(localDT.day);
      setMonth(localDT.month);
      setYear(localDT.year);
      setEnglishDay(localDT.englishDay);
      setEnglishMonth(localDT.englishMonth);
      setEnglishYear(localDT.englishYear);
      setKhmerPeriod(getKhmerTimePeriod(new Date().getHours()));
    };
    
    const interval = setInterval(updateDate, 86400000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
      setImageLoaded(true);
      setLoading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const elements = [
      { name: 'day', pos: dayPos },
      { name: 'month', pos: monthPos },
      { name: 'year', pos: yearPos },
      { name: 'englishDate', pos: englishDatePos },
      {name: 'englishTime', pos: englishTimePos},
      { name: 'time', pos: timePos },
      { name: 'khmerPeriod', pos: khmerPeriodPos },
      { name: 'currency', pos: currencyPos },
      { name: 'buying', pos: buyingPos },
      { name: 'selling', pos: sellingPos }
    ];
    for (let el of elements) {
      if (Math.abs(el.pos.x - x) < 5 && Math.abs(el.pos.y - y) < 5) {
        setDraggingElement(el.name);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggingElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCurrentPos({ x, y });
    const posUpdates = {
      day: () => setDayPos({ x, y }),
      month: () => setMonthPos({ x, y }),
      year: () => setYearPos({ x, y }),
      englishDate: () => setEnglishDatePos({ x, y }),
      englishTime: () => setEnglishTimePos({x,y}),
      time: () => setTimePos({ x, y }),
      khmerPeriod: () => setKhmerPeriodPos({ x, y }),
      currency: () => setCurrencyPos({ x, y }),
      buying: () => setBuyingPos({ x, y }),
      selling: () => setSellingPos({ x, y })
    };
    posUpdates[draggingElement]?.();
  };

  const handleCanvasMouseUp = () => {
    setDraggingElement(null);
    setCurrentPos(null);
  };


  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !previewImage) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      const drawText = (text, pos, fontSize) => {
        ctx.font = `600 ${fontSize}px ${fontFamily}`;
        ctx.fillText(text, (pos.x / 100) * img.width, (pos.y / 100) * img.height);
      };
      drawText(day, dayPos, daySize);
      drawText(month, monthPos, monthSize);
      drawText(year, yearPos, yearSize);
      drawText(`${englishMonth}, ${englishDay}, ${englishYear}`, englishDatePos, englishDateSize);
      drawText(englishTime, englishTimePos, englishTimeSize);
      drawText(time, timePos, timeSize);
      drawText(khmerPeriod, khmerPeriodPos, khmerPeriodSize);
      drawText(currency, currencyPos, currencySize);
      drawText(formatNumber(buyingRate), buyingPos, buyingSize);
      drawText(formatNumber(sellingRate), sellingPos, sellingSize);
      if (draggingElement) {
        const posMap = {
          day: dayPos,
          month: monthPos,
          year: yearPos,
          englishDate: englishDatePos,
          englishTime: englishTimePos,
          time: timePos,
          khmerPeriod: khmerPeriodPos,
          currency: currencyPos,
          buying: buyingPos,
          selling: sellingPos
        };
        const currentPosData = posMap[draggingElement];
        if (currentPosData) {
          const px = (currentPosData.x / 100) * img.width;
          const py = (currentPosData.y / 100) * img.height;
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px, img.height);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(img.width, py);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#FF0000';
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    img.src = previewImage;
  };

  useEffect(() => {
    renderCanvas();
  }, [day, month, year, englishDay, englishMonth, englishYear, time, englishTime, khmerPeriod, currency, buyingRate, sellingRate, dayPos, monthPos, yearPos, englishDatePos, englishTimePos, timePos, khmerPeriodPos, currencyPos, buyingPos, sellingPos, previewImage, draggingElement, textColor, fontFamily, daySize, monthSize, yearSize, englishDateSize, timeSize, englishTimeSize, khmerPeriodSize, currencySize, buyingSize, sellingSize]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Please upload an image first!');
      return;
    }
    const link = document.createElement('a');
    link.download = `exchange-rate-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-screen pr-2">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📁 Upload Image</h2>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-xl p-6 mb-4">
                <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={loading} className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:scale-105'}`}>
                  {loading ? '⏳ Loading...' : imageLoaded ? '✅ Image Loaded' : '📁 Choose Image'}
                </button>
              </div>
              {imageLoaded && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-sm text-green-900 font-semibold">✅ Image loaded! Drag on canvas or use sliders.</p>
                </div>
              )}
            </div>


             <button onClick={downloadImage} className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
              💾 Download as PNG
            </button>
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Other Values</h2>
              <div className="space-y-4">
                 <input type="text" value={buyingRate} onChange={(e) => setBuyingRate(e.target.value)} className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none" placeholder="Buying Rate" />
                <input type="text" value={sellingRate} onChange={(e) => setSellingRate(e.target.value)} className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:border-red-500 outline-none" placeholder="Selling Rate" />
                <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Time (Khmer)" />
                <input type="text" value={englishTime} onChange={(e) => setEnglishTime(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Time (English)" />
                <input type="text" value={khmerPeriod} onChange={(e) => setKhmerPeriod(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Khmer Period (ព្រឹក/រសៀល/ល្ងាច/យប់)" />
                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Currency" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Text Colors</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300" />
                    <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono" placeholder="#FFD700" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Font Family</label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📏 Font Sizes</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Day: {daySize}px</label>
                  <input type="range" min="10" max="100" value={daySize} onChange={(e) => setDaySize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Month: {monthSize}px</label>
                  <input type="range" min="10" max="100" value={monthSize} onChange={(e) => setMonthSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Year: {yearSize}px</label>
                  <input type="range" min="10" max="100" value={yearSize} onChange={(e) => setYearSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">English Date: {englishDateSize}px</label>
                  <input type="range" min="10" max="100" value={englishDateSize} onChange={(e) => setEnglishDateSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Time (Khmer): {timeSize}px</label>
                  <input type="range" min="10" max="100" value={timeSize} onChange={(e) => setTimeSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Time (English): {englishTimeSize}px</label>
                  <input type="range" min="10" max="100" value={englishTimeSize} onChange={(e) => setEnglishTimeSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Khmer Period: {khmerPeriodSize}px</label>
                  <input type="range" min="10" max="100" value={khmerPeriodSize} onChange={(e) => setKhmerPeriodSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Currency: {currencySize}px</label>
                  <input type="range" min="10" max="150" value={currencySize} onChange={(e) => setCurrencySize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Buying Rate: {buyingSize}px</label>
                  <input type="range" min="20" max="200" value={buyingSize} onChange={(e) => setBuyingSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Selling Rate: {sellingSize}px</label>
                  <input type="range" min="20" max="200" value={sellingSize} onChange={(e) => setSellingSize(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Current Position</h2>
              {draggingElement && currentPos ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 mb-2">Dragging: {draggingElement}</p>
                  <p className="text-sm text-blue-800 font-mono">X: {currentPos.x.toFixed(2)}%</p>
                  <p className="text-sm text-blue-800 font-mono">Y: {currentPos.y.toFixed(2)}%</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Drag an element to see position</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Khmer Date</h2>
              <div className="space-y-4">
                <input type="text" value={day} onChange={(e) => setDay(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Day" />
                <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Month" />
                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Year" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ International Date</h2>
              <div className="space-y-4">
                <input type="text" value={englishDay} onChange={(e) => setEnglishDay(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Day" />
                <input type="text" value={englishMonth} onChange={(e) => setEnglishMonth(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Month" />
                <input type="text" value={englishYear} onChange={(e) => setEnglishYear(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none" placeholder="Year" />
              </div>
            </div>

            
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👁️ Live Preview</h2>
            <p className="text-sm text-gray-600 mb-4">💡 Drag text elements on the canvas to reposition them</p>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border-4 border-purple-400">
              {imageLoaded ? (
                <canvas ref={canvasRef} className="w-full h-auto cursor-move" onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onMouseLeave={handleCanvasMouseUp} />
              ) : (
                <div className="py-40 text-center">
                  <div className="text-9xl mb-6 opacity-30">🎨</div>
                  <p className="text-gray-400 text-xl font-semibold">No Image Loaded</p>
                  <p className="text-gray-500 text-sm">Upload an image to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

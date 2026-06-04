import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toKh = (num) => {
  const k = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  return String(num).split('').map(d => (/\d/.test(d) ? k[+d] : d)).join('');
};
const khPeriod = (h) => {
  if (h >= 5  && h < 12) return 'ព្រឹក';
  if (h >= 12 && h < 17) return 'រសៀល';
  if (h >= 17 && h < 21) return 'ល្ងាច';
  return 'យប់';
};
const KH_MONTHS = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const EN_MONTHS = ['Jan','Feb','Mar','Aprl','May','June','July','Aug','Sep','Oct','Nov','Dec'];

const getSnapshot = () => {
  const d = new Date();
  const h24 = d.getHours(), h12 = h24 % 12 || 12;
  const min  = String(d.getMinutes()).padStart(2,'0');
  const day  = String(d.getDate()).padStart(2,'0');
  return {
    khDay:    toKh(day),
    khMonth:  KH_MONTHS[d.getMonth()],
    khYear:   toKh(d.getFullYear()),
    enDate:   `${EN_MONTHS[d.getMonth()]}, ${day}, ${d.getFullYear()}`,
    khTime:   `${toKh(String(h12).padStart(2,'0'))}:${toKh(min)}`,
    enTime:   `${String(h12).padStart(2,'0')}:${min} ${h24 >= 12 ? 'PM' : 'AM'}`,
    khPeriod: khPeriod(h24),
  };
};

// ─── Field layout (Figma coordinates at 1×) ──────────────────────────────────
// x/y  = centre point as % of the image
// fs   = font-size as % of container width  (cqw units)
// maxW = max element width as % of container
const FIELDS = [
  { key:'khDay',    x:25.78, y:33.03, color:'#ffffff', fs:2.9,  fw:'600', maxW:11, label:'ថ្ងៃ'         },
  { key:'khMonth',  x:36.00, y:33.03, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ខែ'           },
  { key:'khYear',   x:47.89, y:32.89, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ឆ្នាំ'         },
  { key:'enDate',   x:29.92, y:37.09, color:'#E6D600', fs:2.7,  fw:'500', maxW:26, label:'English Date' },
  { key:'khTime',   x:75.50, y:32.91, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ម៉ោង'         },
  { key:'khPeriod', x:90.50, y:32.95, color:'#ffffff', fs:2.9,  fw:'600', maxW:9,  label:'នាទី'         },
  { key:'enTime',   x:79.19, y:36.98, color:'#E6D600', fs:2.7,  fw:'500', maxW:18, label:'English Time' },
  { key:'buying',   x:47.27, y:60.37, color:'#ffffff', fs:7.5,  fw:'800', maxW:28, label:'Buying'       },
  { key:'selling',  x:79.49, y:60.22, color:'#ffffff', fs:7.5,  fw:'800', maxW:28, label:'Selling'      },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function DynamicPosterUI() {
  const snap = getSnapshot();
  const [vals, setVals]         = useState({ ...snap, buying:'4,025', selling:'4,032' });
  const [tmpl, setTmpl]         = useState('/x3.png');
  const [active, setActive]     = useState(null);   // key of field being edited
  const [draft, setDraft]       = useState('');      // working copy in bottom sheet
  const [exporting, setExp]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);  // data: URL for preview modal
  const sheetInputRef           = useRef(null);
  const fileRef                 = useRef(null);

  // ── Clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const s = getSnapshot();
      setVals(v => ({ ...v, khTime: s.khTime, enTime: s.enTime, khPeriod: s.khPeriod }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const posterRef = useRef(null);
  const [posterW, setPosterW] = useState(0);

  useEffect(() => {
    if (!posterRef.current) return;
    const ro = new ResizeObserver(entries => {
      setPosterW(entries[0].contentRect.width);
    });
    ro.observe(posterRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Open bottom sheet for a field ────────────────────────────────────
  const openField = useCallback((key) => {
    setDraft(vals[key] ?? '');
    setActive(key);
  }, [vals]);

  // ── Confirm edit ─────────────────────────────────────────────────────
  const confirm = useCallback(() => {
    if (active) setVals(v => ({ ...v, [active]: draft }));
    setActive(null);
  }, [active, draft]);

  // ── Preload Fonts on Mount ───────────────────────────────────────────
  useEffect(() => {
    const preloadFonts = async () => {
      try {
        await Promise.all([
          document.fonts.load("normal 500 12px 'Kantumruy Pro'"),
          document.fonts.load("normal 600 12px 'Kantumruy Pro'"),
          document.fonts.load("normal 700 12px 'Kantumruy Pro'"),
          document.fonts.load("normal 800 12px 'Kantumruy Pro'")
        ]);
        await document.fonts.ready;
      } catch (err) {
        console.warn('Failed to preload fonts on mount:', err);
      }
    };
    preloadFonts();
  }, []);

  // ── Focus bottom-sheet input whenever sheet opens ─────────────────────
  useEffect(() => {
    if (active && sheetInputRef.current) {
      // small delay so DOM is rendered
      setTimeout(() => sheetInputRef.current?.focus(), 60);
    }
  }, [active]);

  // ── Upload template ───────────────────────────────────────────────────
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTmpl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Cached base64 font data for SVG embedding ────────────────────────
  const fontCacheRef = useRef(null);

  const getFontBase64 = async () => {
    if (fontCacheRef.current) return fontCacheRef.current;

    const toBase64 = async (url) => {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const [f600, f700] = await Promise.all([
      toBase64('/fonts/kantumruy-pro-600.woff2'),
      toBase64('/fonts/kantumruy-pro-700.woff2'),
    ]);

    fontCacheRef.current = { f600, f700 };
    return fontCacheRef.current;
  };

  // ── Build SVG text overlay using foreignObject (iOS-safe) ───────────
  const buildTextOverlaySVG = async (w, h) => {
    const { f600, f700 } = await getFontBase64();

    // Build CSS @font-face declarations with embedded base64 fonts
    const fontCSS = `
      @font-face {
        font-family: 'Kantumruy Pro';
        font-weight: 500;
        font-style: normal;
        src: url(data:font/woff2;base64,${f600}) format('woff2');
      }
      @font-face {
        font-family: 'Kantumruy Pro';
        font-weight: 600;
        font-style: normal;
        src: url(data:font/woff2;base64,${f600}) format('woff2');
      }
      @font-face {
        font-family: 'Kantumruy Pro';
        font-weight: 700;
        font-style: normal;
        src: url(data:font/woff2;base64,${f700}) format('woff2');
      }
      @font-face {
        font-family: 'Kantumruy Pro';
        font-weight: 800;
        font-style: normal;
        src: url(data:font/woff2;base64,${f700}) format('woff2');
      }
    `;

    // Build positioned text divs for each field
    const textDivs = FIELDS.map(({ key, x, y, color, fs, fw }) => {
      const fontSize = (fs / 100) * w;
      const text = (vals[key] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div style="
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: ${fontSize}px;
        font-weight: ${fw};
        font-family: 'Kantumruy Pro', sans-serif;
        white-space: nowrap;
        text-align: center;
        line-height: 1;
      ">${text}</div>`;
    }).join('\n');

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><style>${fontCSS}</style></defs>
      <foreignObject width="${w}" height="${h}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          position: relative;
          width: ${w}px;
          height: ${h}px;
          margin: 0;
          padding: 0;
        ">
          ${textDivs}
        </div>
      </foreignObject>
    </svg>`;

    return svgStr;
  };

  // ── Draw SVG string as image onto canvas ────────────────────────────
  const drawSVGOnCanvas = (ctx, svgStr, w, h) =>
    new Promise((resolve, reject) => {
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const svgImg = new Image();
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve();
      };
      svgImg.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG overlay failed to load: ' + e));
      };
      svgImg.src = url;
    });

  const buildBlob = () =>
    new Promise(async (resolve, reject) => {
      const img = new Image();
      if (!tmpl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = async () => {
        let canvas = null;
        try {
          canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw text using SVG foreignObject (proper text shaping on iOS)
          const svgStr = await buildTextOverlaySVG(canvas.width, canvas.height);
          await drawSVGOnCanvas(ctx, svgStr, canvas.width, canvas.height);

          // iOS: toBlob can fail silently — use dataURL as fallback
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                const dataURL = canvas.toDataURL('image/png', 1.0);
                const [header, base64] = dataURL.split(',');
                const mime = header.match(/:(.*?);/)[1];
                const bytes = atob(base64);
                const arr = new Uint8Array(bytes.length);
                for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                resolve(new Blob([arr], { type: mime }));
              }
            },
            'image/png',
            1.0
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (e) => reject(new Error('Image failed to load: ' + e));
      img.src = tmpl;
    });

  const buildDataURL = () =>
    new Promise(async (resolve, reject) => {
      const img = new Image();
      if (!tmpl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Draw text using SVG foreignObject (proper text shaping on iOS)
          const svgStr = await buildTextOverlaySVG(canvas.width, canvas.height);
          await drawSVGOnCanvas(ctx, svgStr, canvas.width, canvas.height);

          resolve(canvas.toDataURL('image/png', 1.0));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = tmpl;
    });

  // ── Export PNG — desktop download ─────────────────────────────────────
  const exportPNG = async () => {
    setExp(true);
    try {
      const blob = await buildBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.download = `exchange-rate-${Date.now()}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally { setExp(false); }
  };

  // ── Save to Gallery — iOS-safe share ──────────────────────────────────
  const saveToGallery = async () => {
    setSaving(true);
    try {
      const blob = await buildBlob();
      const file = new File([blob], 'exchange-rate.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Exchange Rate' });
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // user cancelled
          // fall through to download
        }
      }

      // Android / desktop fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exchange-rate-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('saveToGallery error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Preview — uses dataURL (reliable on iOS) ───────────────────────────
  const previewImage = async () => {
    setExp(true);
    try {
      const dataURL = await buildDataURL();
      setPreview(dataURL); // store as dataURL string, not blob URL
    } catch (err) {
      console.error('previewImage error:', err);
    } finally {
      setExp(false);
    }
  };

  const activeField = FIELDS.find(f => f.key === active);

  return (
    <div className="page">
        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="toolbar">
          <span className="toolbar-title">📊 Poster Editor</span>


          <button className="btn-export" disabled={exporting} onClick={previewImage}>
            {exporting ? '⏳…' : '📸 Preview & Save'}
          </button>

          <button className="btn-export" disabled={exporting} onClick={exportPNG}
            style={{ background:'rgba(16,185,129,.5)', boxShadow:'none', border:'1.5px solid rgba(16,185,129,.5)' }}>
            {exporting ? '⏳…' : '💾 Download'}
          </button>

          {/* Mobile save to Gallery — uses native share sheet */}
          <button
            disabled={saving}
            onClick={saveToGallery}
            style={{
              padding: '9px 16px', borderRadius: 12, border: '1.5px solid rgba(52,211,153,.5)',
              background: saving ? 'rgba(255,255,255,.06)' : 'rgba(16,185,129,.18)',
              color: '#34d399', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}
          >
            {saving ? '⏳…' : '📲 Save to Gallery'}
          </button>
          
          <button className="btn-upload" onClick={() => fileRef.current?.click()}>
            📁 Upload
          </button>

          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg"
            onChange={handleUpload} style={{ display:'none' }} />
        </div>

        {/* ── Poster + tappable overlays ──────────────────────────── */}
        <div className="poster-wrap" style={{ maxWidth: 560 }} ref={posterRef}>
          {/* Template image — non-interactive */}
          <img
            src={tmpl}
            alt="Exchange rate template"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                     objectFit:'cover', pointerEvents:'none', userSelect:'none' }}
            draggable={false}
          />

          {/* Tappable text labels */}
          {FIELDS.map(({ key, x, y, color, fs, fw, maxW }) => (
            <div
              key={key}
              className="overlay-label"
              role="button"
              tabIndex={0}
              aria-label={`Edit ${key}`}
              onPointerDown={(e) => { e.preventDefault(); openField(key); }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openField(key)}
              style={{
                left:       `${x}%`,
                top:        `${y}%`,
                color:      color,
                fontSize:   posterW ? `${(fs / 100) * posterW}px` : `${fs * 0.56}vw`,
                fontWeight: fw,
                width:      `${maxW}%`,
                minWidth:   '1em',
              }}
            >
              {vals[key] ?? ''}
            </div>
          ))}

          {/* Hint pill — inside poster */}
          {/* {!active && <div className="hint-pill">✏️ Tap any text to edit</div>} */}
        </div>

        {/* ── Bottom edit sheet (portal-like, fixed) ──────────────── */}
        {active && (
          <div className="edit-sheet-backdrop" onPointerDown={(e) => {
            // dismiss if tapping the dark backdrop (not the sheet itself)
            if (e.target === e.currentTarget) confirm();
          }}>
            <div className="edit-sheet">
              <div className="edit-sheet-handle" />
              <div className="edit-sheet-label">
                Editing · {activeField?.label}
              </div>
              <input
                ref={sheetInputRef}
                className="edit-sheet-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirm()}
                placeholder="Type a value…"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <div className="edit-sheet-actions">
                <button className="btn-cancel" onPointerDown={e => { e.preventDefault(); setActive(null); }}>
                  Cancel
                </button>
                <button className="btn-confirm" onPointerDown={e => { e.preventDefault(); confirm(); }}>
                  ✓ Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Preview modal ──────────────────────────────────────── */}
        {preview && (
          <div className="preview-backdrop" onClick={() => {
            setPreview(null);
          }}>
            <img
              className="preview-img"
              src={preview}
              alt="Preview"
              onClick={e => e.stopPropagation()}
              onContextMenu={e => e.stopPropagation()}
            />
            <div className="preview-hint">
              📱 <strong>iOS / Android:</strong> Long-press the image → Save Image<br />
              💻 <strong>Desktop:</strong> Right-click → Save image as
            </div>
            <button className="preview-close" onClick={() => { setPreview(null); }}>
              ✕ Close
            </button>
          </div>
        )}
      </div>
  );
}

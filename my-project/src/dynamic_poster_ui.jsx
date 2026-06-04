import React, { useState, useRef, useEffect, useCallback } from 'react';

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
          document.fonts.load("500 12px KantumruyPro"),
          document.fonts.load("600 12px KantumruyPro"),
          document.fonts.load("700 12px KantumruyPro"),
          document.fonts.load("800 12px KantumruyPro")
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

  const buildBlob = () =>
    new Promise(async (resolve, reject) => {
      try {
        await Promise.all([
          document.fonts.load("500 12px KantumruyPro"),
          document.fonts.load("600 12px KantumruyPro"),
          document.fonts.load("700 12px KantumruyPro"),
          document.fonts.load("800 12px KantumruyPro")
        ]);
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font load warning:', e);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // iOS needs longer delay after image load before canvas draw
        setTimeout(() => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            // iOS Safari fix: clear first, then draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            FIELDS.forEach(({ key, x, y, color, fs, fw }) => {
              const px = (x / 100) * canvas.width;
              const py = (y / 100) * canvas.height;
              const fontSize = (fs / 100) * canvas.width;
              ctx.save();
              ctx.fillStyle    = color;
              ctx.font         = `${fw} ${fontSize}px KantumruyPro, sans-serif`;
              ctx.textAlign    = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(vals[key] ?? '', px, py);
              ctx.restore();
            });

            // iOS: toBlob can fail silently — use dataURL as fallback
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size > 0) {
                  resolve(blob);
                } else {
                  // Fallback: convert dataURL → blob manually
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
        }, 150); // iOS needs ~100-150ms after img.onload
      };

      img.onerror = (e) => reject(new Error('Image failed to load: ' + e));
      img.src = tmpl;
    });

  const buildDataURL = () =>
    new Promise(async (resolve, reject) => {
      try {
        await Promise.all([
          document.fonts.load("500 12px KantumruyPro"),
          document.fonts.load("600 12px KantumruyPro"),
          document.fonts.load("700 12px KantumruyPro"),
          document.fonts.load("800 12px KantumruyPro")
        ]);
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font load warning:', e);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setTimeout(() => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            FIELDS.forEach(({ key, x, y, color, fs, fw }) => {
              const px = (x / 100) * canvas.width;
              const py = (y / 100) * canvas.height;
              const fontSize = (fs / 100) * canvas.width;
              ctx.save();
              ctx.fillStyle = color;
              ctx.font = `${fw} ${fontSize}px KantumruyPro, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(vals[key] ?? '', px, py);
              ctx.restore();
            });
            resolve(canvas.toDataURL('image/png', 1.0));
          } catch (err) {
            reject(err);
          }
        }, 150);
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
    <>
      {/* ── Global styles ──────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; font-family: 'KantumruyPro', sans-serif; }

        body { margin: 0; background: #030712; }

        /* poster container — enables cqw font-size units */
        .poster-wrap {
          container-type: inline-size;
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,.6);
          outline: 2px solid rgba(255,255,255,.08);
        }

        /* tappable text label overlaid on poster */
        .overlay-label {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background .15s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .overlay-label:hover,
        .overlay-label:active {
          background: rgba(255,255,255,.15);
          outline: 2px solid rgba(255,255,255,.4);
        }

        /* ── bottom edit sheet ──────────────────────────────────────── */
        .edit-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 0 env(safe-area-inset-bottom, 0);
          animation: fadeIn .15s ease;
        }
        .edit-sheet {
          width: 100%;
          max-width: 520px;
          background: #111827;
          border-radius: 20px 20px 0 0;
          padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0));
          animation: slideUp .2s cubic-bezier(.22,1,.36,1);
        }
        .edit-sheet-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,.2);
          border-radius: 2px;
          margin: 0 auto 16px;
        }
        .edit-sheet-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.4);
          margin-bottom: 10px;
        }
        .edit-sheet-input {
          width: 100%;
          background: rgba(255,255,255,.08);
          border: 1.5px solid rgba(255,255,255,.18);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
        }
        .edit-sheet-input:focus {
          border-color: #34d399;
          box-shadow: 0 0 0 3px rgba(52,211,153,.2);
        }
        .edit-sheet-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        .btn-cancel {
          flex: 1;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.7);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }
        .btn-cancel:active { background: rgba(255,255,255,.14); }
        .btn-confirm {
          flex: 2;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: #10b981;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, transform .1s;
        }
        .btn-confirm:active { background: #059669; transform: scale(.97); }

        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0 } to { transform: none; opacity: 1 } }

        /* ── responsive toolbar ─────────────────────────────────────── */
        .toolbar {
          width: 100%;
          max-width: 560px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .toolbar-title {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          margin-right: auto;
          white-space: nowrap;
        }
        .btn-upload {
          padding: 9px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.08);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background .15s;
        }
        .btn-upload:active { background: rgba(255,255,255,.15); }
        .btn-export {
          padding: 9px 18px;
          border-radius: 12px;
          border: none;
          background: #10b981;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background .15s, opacity .15s;
          box-shadow: 0 4px 14px rgba(16,185,129,.35);
        }
        .btn-export:disabled { opacity: .5; cursor: not-allowed; }
        .btn-export:not(:disabled):active { background: #059669; }

        /* page wrapper */
        .page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 16px 12px;
          background: #030712;
        }

        /* hint pill inside poster */
        .hint-pill {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(6px);
          color: rgba(255,255,255,.75);
          font-size: 11px;
          padding: 5px 14px;
          border-radius: 999px;
          pointer-events: none;
          white-space: nowrap;
        }

        /* ── Preview modal ───────────────────────────────────────────── */
        .preview-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.93);
          z-index: 300;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          gap: 16px;
          animation: fadeIn .2s ease;
        }
        .preview-img {
          max-width: 100%;
          max-height: 72dvh;
          border-radius: 8px;
          box-shadow: 0 8px 40px rgba(0,0,0,.7);
          -webkit-user-drag: none;
          user-drag: none;
          display: block;
        }
        .preview-hint {
          color: rgba(255,255,255,.75);
          font-size: 13px;
          text-align: center;
          line-height: 1.6;
        }
        .preview-close {
          padding: 11px 36px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.1);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background .15s;
        }
        .preview-close:active { background: rgba(255,255,255,.2); }
      `}</style>

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
        <div className="poster-wrap" style={{ maxWidth: 560 }}>
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
                fontSize:   `${fs}cqw`,
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
    </>
  );
}

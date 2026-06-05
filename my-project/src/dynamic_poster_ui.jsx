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
    enDate:   `${EN_MONTHS[d.getMonth()]} ${day} ${d.getFullYear()}`,
    khTime:   `${toKh(String(h12).padStart(2,'0'))}:${toKh(min)}`,
    enTime:   `${String(h12).padStart(2,'0')}:${min} ${h24 >= 12 ? 'PM' : 'AM'}`,
    khPeriod: khPeriod(h24),
  };
};

/** Escape XML special characters */
const escXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─── Field layout (Figma coordinates at 1×) ──────────────────────────────────
// x/y  = centre point as % of the image
// fs   = font-size as % of container width
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
  const [active, setActive]     = useState(null);
  const [draft, setDraft]       = useState('');
  const [error, setError]       = useState('');
  const [exporting, setExp]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [posting, setPosting]   = useState(false);
  const [preview, setPreview]   = useState(null);
  const sheetInputRef           = useRef(null);
  const fileRef                 = useRef(null);
  const posterRef               = useRef(null);
  const fontCacheRef            = useRef(null);
  const [posterW, setPosterW]   = useState(0);

  // ── Validation effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!active) {
      setError('');
      return;
    }
    if (active === 'buying' || active === 'selling') {
      if (!/^\d,\d{3}$/.test(draft)) {
        setError('Must be a 4-digit number formatted as X,XXX (e.g., 4,032)');
      } else {
        setError('');
      }
    } else if (active === 'enDate') {
      if (/,/.test(draft)) {
        setError('Commas are not allowed in the date');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [draft, active]);

  const handleDraftChange = (val) => {
    if (active === 'buying' || active === 'selling') {
      let cleaned = val.replace(/[^\d,]/g, '');
      if (/^\d{4}$/.test(cleaned)) {
        cleaned = cleaned.replace(/^(\d)(\d{3})$/, '$1,$2');
      }
      setDraft(cleaned);
    } else if (active === 'enDate') {
      setDraft(val.replace(/,/g, ''));
    } else {
      setDraft(val);
    }
  };

  // ── Clock — update time fields every minute ────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const s = getSnapshot();
      setVals(v => ({ ...v, khTime: s.khTime, enTime: s.enTime, khPeriod: s.khPeriod }));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Measure poster width for responsive font sizing ────────────────
  useEffect(() => {
    if (!posterRef.current) return;
    const ro = new ResizeObserver(entries => {
      setPosterW(entries[0].contentRect.width);
    });
    ro.observe(posterRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Open / confirm bottom sheet ────────────────────────────────────
  const openField = useCallback((key) => {
    setDraft(vals[key] ?? '');
    setActive(key);
  }, [vals]);

  const confirm = useCallback(() => {
    if (active) setVals(v => ({ ...v, [active]: draft }));
    setActive(null);
  }, [active, draft]);

  // ── Focus input when bottom sheet opens ────────────────────────────
  useEffect(() => {
    if (active && sheetInputRef.current) {
      setTimeout(() => sheetInputRef.current?.focus(), 60);
    }
  }, [active]);

  // ── Upload custom template ─────────────────────────────────────────
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTmpl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ─── Font embedding for SVG export ─────────────────────────────────
  // Fonts are fetched once, converted to base64, and cached in a ref.
  // They are embedded directly inside the SVG so iOS Safari can render
  // them without needing access to external font files.

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

  // ─── Build SVG text overlay ────────────────────────────────────────
  // Uses pure SVG <text> elements (NOT foreignObject) so the canvas
  // doesn't get tainted. Fonts are embedded as base64 data-URIs inside
  // the SVG <style> block so they work even in sandboxed image contexts.

  const buildTextOverlaySVG = async (w, h) => {
    const { f600, f700 } = await getFontBase64();

    const fontCSS = `
      @font-face { font-family:'KantumruyProEmbed'; font-weight:500; font-style:normal; src:url(data:font/woff2;base64,${f600}) format('woff2'); }
      @font-face { font-family:'KantumruyProEmbed'; font-weight:600; font-style:normal; src:url(data:font/woff2;base64,${f600}) format('woff2'); }
      @font-face { font-family:'KantumruyProEmbed'; font-weight:700; font-style:normal; src:url(data:font/woff2;base64,${f700}) format('woff2'); }
      @font-face { font-family:'KantumruyProEmbed'; font-weight:800; font-style:normal; src:url(data:font/woff2;base64,${f700}) format('woff2'); }
    `;

    const textEls = FIELDS.map(({ key, x, y, color, fs, fw }) => {
      const fontSize = (fs / 100) * w;
      const px = (x / 100) * w;
      const py = (y / 100) * h;
      const text = escXml(vals[key] ?? '');
      return `<text x="${px}" y="${py}" fill="${color}" font-size="${fontSize}" font-weight="${fw}" font-family="'KantumruyProEmbed', sans-serif" text-anchor="middle" dominant-baseline="central">${text}</text>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><style>${fontCSS}</style></defs>
      ${textEls}
    </svg>`;
  };

  // ─── Draw SVG text overlay onto a canvas context ───────────────────

  const drawSVGOnCanvas = (ctx, svgStr, w, h) =>
    new Promise((resolve, reject) => {
      const svgImg = new Image();
      svgImg.onload = () => { ctx.drawImage(svgImg, 0, 0, w, h); resolve(); };
      svgImg.onerror = (e) => reject(new Error('SVG overlay failed: ' + e));
      svgImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    });

  // ─── Shared render pipeline ────────────────────────────────────────
  // Loads the template image, draws it on a canvas, then overlays the
  // SVG text. Returns the canvas so callers can extract a blob or URL.

  const renderPoster = () =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if (!tmpl.startsWith('data:')) img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Overlay text via SVG (proper text shaping for Khmer on iOS)
          const svgStr = await buildTextOverlaySVG(canvas.width, canvas.height);
          await drawSVGOnCanvas(ctx, svgStr, canvas.width, canvas.height);

          resolve(canvas);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (e) => reject(new Error('Image failed to load: ' + e));
      img.src = tmpl;
    });

  // ─── Export helpers (all use renderPoster) ──────────────────────────

  /** Convert canvas → Blob (with iOS fallback) */
  const canvasToBlob = (canvas) =>
    new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            // iOS fallback: toBlob can return null — convert dataURL instead
            const dataURL = canvas.toDataURL('image/png', 1.0);
            const [header, b64] = dataURL.split(',');
            const mime = header.match(/:(.*?);/)[1];
            const raw = atob(b64);
            const arr = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
            resolve(new Blob([arr], { type: mime }));
          }
        },
        'image/png',
        1.0,
      );
    });

  // ── Download PNG ───────────────────────────────────────────────────
  const exportPNG = async () => {
    setExp(true);
    try {
      const canvas = await renderPoster();
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `exchange-rate-${Date.now()}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setExp(false);
    }
  };

  // ── Save to Gallery (native share sheet on mobile) ─────────────────
  const saveToGallery = async () => {
    setSaving(true);
    try {
      const canvas = await renderPoster();
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'exchange-rate.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Exchange Rate' });
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      // Desktop / Android fallback — trigger download
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

  // ── Post to Telegram ────────────────────────────────────────────────
  const postToTelegram = async () => {
    setPosting(true);
    try {
      const canvas = await renderPoster();
      const blob = await canvasToBlob(canvas);
      
      const formData = new FormData();
      formData.append('image', blob, 'poster.png');
      formData.append('buying', vals.buying);
      formData.append('selling', vals.selling);

      const response = await fetch('/api/post-telegram', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ Error: ' + (data.message || 'Failed to post'));
      }
    } catch (err) {
      console.error('postToTelegram error:', err);
      alert('❌ An error occurred while posting to Telegram.');
    } finally {
      setPosting(false);
    }
  };

  // ── Preview (data URL — reliable on iOS) ───────────────────────────
  const previewImage = async () => {
    setExp(true);
    try {
      const canvas = await renderPoster();
      setPreview(canvas.toDataURL('image/png', 1.0));
    } catch (err) {
      console.error('previewImage error:', err);
    } finally {
      setExp(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────
  const activeField = FIELDS.find(f => f.key === active);

  return (
    <div className="page">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="toolbar">
        <span className="toolbar-title flex items-center"><img src="logo.png" className="h-[20px] mr-2" alt="" /> Poster Editor</span>


        <button className="btn-export" disabled={exporting} onClick={previewImage}>
          {exporting ? '⏳…' : '📸 Preview & Save'}
        </button>

        <button
          className="btn-export" disabled={posting || exporting} onClick={postToTelegram}
          style={{ background: 'rgba(59,130,246,.5)', boxShadow: 'none', border: '1.5px solid rgba(59,130,246,.5)', marginLeft: '8px' }}
        >
          {posting ? '⏳…' : '🚀 Post to Telegram'}
        </button>

        <button
          className="btn-export" disabled={exporting} onClick={exportPNG}
          style={{ background: 'rgba(16,185,129,.5)', boxShadow: 'none', border: '1.5px solid rgba(16,185,129,.5)' }}
        >
          {exporting ? '⏳…' : '💾 Download'}
        </button>

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
        <img
          src={tmpl}
          alt="Exchange rate template"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                   objectFit:'cover', pointerEvents:'none', userSelect:'none' }}
          draggable={false}
        />

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
              color,
              fontSize:   posterW ? `${(fs / 100) * posterW}px` : `${fs * 0.56}vw`,
              fontWeight: fw,
              width:      `${maxW}%`,
              minWidth:   '1em',
            }}
          >
            {vals[key] ?? ''}
          </div>
        ))}
      </div>

      {/* ── Bottom edit sheet ──────────────────────────────────── */}
      {active && (
        <div className="edit-sheet-backdrop" onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            if (error) {
              setActive(null);
            } else {
              confirm();
            }
          }
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
              onChange={e => handleDraftChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !error && confirm()}
              placeholder="Type a value…"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {error && (
              <div className="edit-sheet-error">
                ⚠️ {error}
              </div>
            )}
            <div className="edit-sheet-actions">
              <button className="btn-cancel" onPointerDown={e => { e.preventDefault(); setActive(null); }}>
                Cancel
              </button>
              <button
                className="btn-confirm"
                disabled={!!error}
                onPointerDown={e => { e.preventDefault(); if (!error) confirm(); }}
              >
                ✓ Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ──────────────────────────────────────── */}
      {preview && (
        <div className="preview-backdrop" onClick={() => setPreview(null)}>
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
          <button className="preview-close" onClick={() => setPreview(null)}>
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}

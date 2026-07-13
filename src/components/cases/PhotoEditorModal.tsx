"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function PhotoEditorModal({
  open,
  src,
  onClose,
  onSave,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);

  const draw = useCallback((img: HTMLImageElement, rot: number, bright: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.filter = `brightness(${bright}%)`;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!open || !src) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      draw(img, rotation, brightness);
    };
    img.src = src;
  }, [open, src, rotation, brightness, draw]);

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/jpeg", 0.85));
    onClose();
  }

  return (
    <Modal open={open} title="تحرير الصورة" onClose={onClose}>
      <div className="modal-body">
        <canvas ref={canvasRef} className="w-full max-h-[60vh] rounded-lg border border-border" />
        <div className="mt-4 space-y-3">
          <label className="field">
            <span>الدوران ({rotation}°)</span>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>السطوع ({brightness}%)</span>
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          إلغاء
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>
          حفظ
        </button>
      </div>
    </Modal>
  );
}

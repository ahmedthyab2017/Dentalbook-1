"use client";

import { useEffect, useRef } from "react";
import { useDbStore } from "@/stores/useDbStore";

function drawChart(canvas: HTMLCanvasElement, payments: { date?: string; amount?: number }[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const days: { date: string; total: number; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const total = payments
      .filter((p) => p.date === ds)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    days.push({ date: ds, total, label: `${d.getDate()}/${d.getMonth() + 1}` });
  }

  const max = Math.max(1, ...days.map((d) => d.total));
  const padX = 30;
  const padTop = 18;
  const padBot = 26;
  const n = days.length;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBot;
  const xAt = (i: number) => padX + (plotW / Math.max(n - 1, 1)) * i;
  const yAt = (v: number) => padTop + plotH - (v / max) * plotH;

  ctx.strokeStyle = "rgba(100,116,139,0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padTop + (plotH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(W - padX, y);
    ctx.stroke();
  }

  const pts = days.map((d, i) => ({ x: xAt(i), y: yAt(d.total) }));
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H - padBot);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[n - 1].x, H - padBot);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, padTop, 0, H - padBot);
  g.addColorStop(0, "rgba(37,99,235,0.28)");
  g.addColorStop(1, "rgba(37,99,235,0.02)");
  ctx.fillStyle = g;
  ctx.fill();

  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.font = "11px Inter, Tajawal, sans-serif";
  ctx.textAlign = "center";
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2563EB";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#64748B";
    ctx.fillText(days[i].label, p.x, H - 8);
  });
}

export function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const payments = useDbStore((s) => s.db.payments);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function render() {
      const el = canvasRef.current;
      if (!el) return;
      const width = el.parentElement?.clientWidth || el.offsetWidth || 640;
      el.width = Math.max(width, 320);
      el.height = 200;
      drawChart(el, payments);
    }

    render();
    const ro = new ResizeObserver(render);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", render);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", render);
    };
  }, [payments]);

  return <canvas ref={canvasRef} className="dantal-chart-canvas" aria-label="رسم الإيرادات" />;
}

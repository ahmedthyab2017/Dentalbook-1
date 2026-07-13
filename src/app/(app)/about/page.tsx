"use client";

import { DantalPage } from "@/components/layout/DantalPage";

export default function AboutPage() {
  return (
    <DantalPage title="عن التطبيق">
        <div className="page-head">
          <h1 className="page-title">عن التطبيق</h1>
        </div>
        <div id="about-body" className="about-body">
          <div className="about-logo">M</div>
          <h2>المختصر دنتال — Mukhtasar Dental</h2>
          <p className="muted">v2.10.0 • Next.js Edition</p>
          <p className="mt-3">
            نظام إدارة عيادة أسنان متكامل — مواعيد، مرضى، خطط علاج، مالية، ومتابعة.
            البيانات محفوظة محلياً على جهازك لضمان الخصوصية.
          </p>
          <p className="muted mt-3">تطوير: Digital Innovation Foundation</p>
          <a
            className="btn btn-primary mt-3"
            href="https://wa.me/9647810151042"
            target="_blank"
            rel="noreferrer"
          >
            💬 تواصل عبر واتساب
          </a>
        </div>
      </DantalPage>
  );
}

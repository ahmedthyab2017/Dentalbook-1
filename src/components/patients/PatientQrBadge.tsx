"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function PatientQrBadge({ url, size = 96 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: size, margin: 1 }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [url, size]);

  if (!dataUrl) return null;
  return <img src={dataUrl} alt="QR" width={size} height={size} style={{ borderRadius: 8 }} />;
}

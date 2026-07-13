// Ported from app/app.js:2629-2634 (_waPhone).

export function waPhone(phone: string): string {
  let p = (phone || "").replace(/\D/g, "");
  if (p.startsWith("0")) p = "964" + p.slice(1);
  else if (!p.startsWith("964")) p = "964" + p;
  return p;
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(text)}`;
}

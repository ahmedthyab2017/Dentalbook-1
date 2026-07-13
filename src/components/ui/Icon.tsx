// Ported from app/app.js:1727-1754 (ICO() wrapper + ICON path table).
// Kept as raw path data + dangerouslySetInnerHTML for a 1:1 visual match
// with the legacy hand-rolled icon set (see plan: no icon library in Phase 0/1).

const PATHS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M15.5 5.2a3.2 3.2 0 0 1 0 6.2"/><path d="M17 14.7c2.4.5 4 2.4 4 5.3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clipboard:
    '<rect x="5" y="4.5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="3" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
  camera:
    '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.4"/>',
  pill: '<rect x="4.5" y="9.5" width="15" height="7" rx="3.5" transform="rotate(-45 12 13)"/><path d="M9.6 10.4 13.6 14.4" stroke-width="1.6"/>',
  wallet:
    '<rect x="3" y="6.5" width="18" height="12" rx="2.2"/><path d="M3 10h18"/><circle cx="16.6" cy="14.2" r="1.1" fill="currentColor" stroke="none"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M20.5 20H3.5"/>',
  trending: '<path d="M3.5 16 9 10.5l4 4 7-7"/><path d="M16.5 7.5H20V11"/>',
  bell: '<path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.3 5.3 1.8 6H4.2c.5-.7 1.8-2 1.8-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  stethoscope:
    '<path d="M6 4v6a4 4 0 0 0 8 0V4"/><path d="M6 4H4.5M14 4h1.5"/><path d="M18 11v2.5a6 6 0 0 1-12 0V11"/><circle cx="19" cy="10" r="1.6"/>',
  tooth:
    '<path d="M8 4c-2.6 0-4.2 1.9-4.2 4.5 0 2.7 1 4.6 1.5 7.4.3 1.7.7 3.1 1.9 3.1 1.4 0 1.4-2.6 2-4.3.3-.9.5-1.5.8-1.5s.5.6.8 1.5c.6 1.7.6 4.3 2 4.3 1.2 0 1.6-1.4 1.9-3.1.5-2.8 1.5-4.7 1.5-7.4C16.2 5.9 14.6 4 12 4c-1 0-1.6.4-2 .8-.4-.4-1-.8-2-.8Z"/>',
  box: '<path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z"/><path d="M3.5 8v9L12 21.5 20.5 17V8"/><path d="M12 12.5V21.5"/>',
  building:
    '<rect x="4" y="3.5" width="10" height="17" rx="1"/><path d="M14 9h6v11.5H14M7 7h.01M11 7h.01M7 10.5h.01M11 10.5h.01M7 14h.01M11 14h.01" stroke-width="2.2"/>',
  save: '<path d="M5 4h11l3 3v13H5Z"/><path d="M8 4v5h8V4M8 14h8v6H8Z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6" stroke-width="2.2"/><circle cx="12" cy="7.7" r="1.1" fill="currentColor" stroke="none"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20c0-3.6 3-6.5 7.5-6.5s7.5 2.9 7.5 6.5"/>',
  logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.5-4.5"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  undo: '<path d="M8 7 4 11l4 4"/><path d="M4 11h11a5 5 0 0 1 0 10h-2"/>',
  finish: '<path d="M5 12.5 9.5 17 19 6.5"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "ico" }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

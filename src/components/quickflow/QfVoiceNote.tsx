"use client";

import { useRef, useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { IconButton } from "@/components/ds";
import { cn } from "@/lib/cn";

interface SpeechRecInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor; SpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function QfVoiceNote({
  noteText,
  onNoteChange,
  dictating,
  onDictatingChange,
}: {
  noteText: string;
  onNoteChange: (v: string) => void;
  dictating: boolean;
  onDictatingChange: (v: boolean) => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const [dictLangCode, setDictLangCode] = useState<"ar-SA" | "en-US">("ar-SA");
  const dictLang = useRef<"ar-SA" | "en-US">("ar-SA");
  const recRef = useRef<SpeechRecInstance | null>(null);
  const committedRef = useRef(noteText);

  useEffect(() => {
    committedRef.current = noteText;
  }, [noteText]);

  useEffect(() => {
    return () => {
      recRef.current?.stop();
    };
  }, []);

  function toggleDictLang() {
    if (dictating) return;
    const next = dictLangCode === "ar-SA" ? "en-US" : "ar-SA";
    dictLang.current = next;
    setDictLangCode(next);
  }

  function toggle() {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert(L("استخدم Chrome للإملاء الصوتي", "Use Chrome for voice dictation", lang));
      return;
    }
    if (dictating) {
      recRef.current?.stop();
      onDictatingChange(false);
      return;
    }
    const rec = new SR();
    rec.lang = dictLang.current;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) committedRef.current += (committedRef.current ? " " : "") + r[0].transcript.trim();
        else interim += r[0].transcript;
      }
      onNoteChange(committedRef.current + (interim ? (committedRef.current ? " " : "") + interim : ""));
    };
    rec.onerror = () => onDictatingChange(false);
    rec.onend = () => onDictatingChange(false);
    recRef.current = rec;
    onDictatingChange(true);
    rec.start();
  }

  return (
    <div className="qf-voice-toolbar">
      <button
        type="button"
        className={cn("qf-voice-lang", dictating && "disabled")}
        onClick={toggleDictLang}
        disabled={dictating}
        aria-label={L("تبديل لغة الإملاء", "Toggle dictation language", lang)}
      >
        {dictLangCode === "ar-SA" ? "ع" : "En"}
      </button>

      <IconButton
        label={dictating ? L("إيقاف الإملاء", "Stop dictation", lang) : L("بدء الإملاء", "Start dictation", lang)}
        onClick={toggle}
        className={cn("qf-voice-mic", dictating && "qf-voice-mic-active")}
      >
        {dictating ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </IconButton>

      {dictating && (
        <span className="qf-voice-status">
          <span className="qf-voice-dot" aria-hidden />
          {L("يستمع…", "Listening…", lang)}
        </span>
      )}
    </div>
  );
}

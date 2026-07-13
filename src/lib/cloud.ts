import type { CloudSyncConfig } from "@/types/db";
import { STORAGE_KEY } from "@/types/db";

const ACCESS_KEY = "mx_access";
const REFRESH_KEY = "mx_refresh";
const DEVICE_KEY = "mx_device_id";
const SYNC_VERSION_KEY = "mx_sync_version";

function b64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode.apply(null, [...arr]));
}

function unb64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

async function deriveKey(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const bk = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  const saltBuf = new Uint8Array(salt);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuf, iterations: 210000, hash: "SHA-256" },
    bk,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export type CloudMeta = CloudSyncConfig;

export const Cloud = {
  cfg(): CloudMeta {
    if (typeof window === "undefined") return { apiUrl: "", email: "", passphrase: "", autoSync: false };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { apiUrl: "", email: "", passphrase: "", autoSync: false };
      const db = JSON.parse(raw);
      return db.meta?.cloud || { apiUrl: "", email: "", passphrase: "", autoSync: false };
    } catch {
      return { apiUrl: "", email: "", passphrase: "", autoSync: false };
    }
  },

  base(): string {
    const envUrl =
      typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL?.trim() : "";
    if (envUrl) return envUrl.replace(/\/+$/, "");
    return (this.cfg().apiUrl || "").trim().replace(/\/+$/, "");
  },

  v1(): string {
    return this.base() + "/v1";
  },

  configured(): boolean {
    return !!this.base();
  },

  loggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(ACCESS_KEY);
  },

  deviceId(): string {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || "d" + Date.now() + Math.random().toString(36).slice(2);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  },

  headers(auth = true, extra: Record<string, string> = {}): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Device-Id": this.deviceId(),
      "X-App-Version": "2.0.0",
      ...extra,
    };
    if (auth && typeof window !== "undefined") {
      const t = localStorage.getItem(ACCESS_KEY);
      if (t) h.Authorization = "Bearer " + t;
    }
    return h;
  },

  saveTokens(t: { access?: string; refresh?: string }) {
    if (typeof window === "undefined") return;
    if (t?.access) localStorage.setItem(ACCESS_KEY, t.access);
    if (t?.refresh) localStorage.setItem(REFRESH_KEY, t.refresh);
  },

  async register(clinicName: string, email: string, password: string) {
    const r = await fetch(this.v1() + "/auth/register", {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({ clinicName, email, password, deviceName: navigator.userAgent }),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    this.saveTokens(d.tokens);
    return d;
  },

  async login(email: string, password: string) {
    const r = await fetch(this.v1() + "/auth/login", {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({ email, password, deviceName: navigator.userAgent }),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    this.saveTokens(d.tokens);
    return d;
  },

  async me() {
    const r = await this.apiFetch(this.v1() + "/auth/me", { headers: this.headers(true) });
    const d = await r.json();
    if (!r.ok) throw d;
    return d.data as {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      clinicId?: string | null;
      roles: string[];
    };
  },

  isSuperAdmin(roles: string[] | string | undefined): boolean {
    if (!roles) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.some((r) => String(r) === "SUPER_ADMIN");
  },

  async refresh() {
    const r = await fetch(this.v1() + "/auth/refresh", {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({ refreshToken: localStorage.getItem(REFRESH_KEY) }),
    });
    if (!r.ok) {
      this.logout();
      throw await r.json();
    }
    const { tokens } = await r.json();
    this.saveTokens(tokens);
    return tokens;
  },

  async apiFetch(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
    const res = await fetch(url, options);
    if (res.status === 401 && retry) {
      try {
        await this.refresh();
      } catch {
        return res;
      }
      const headers = new Headers(options.headers);
      headers.set("Authorization", "Bearer " + localStorage.getItem(ACCESS_KEY));
      return this.apiFetch(url, { ...options, headers }, false);
    }
    return res;
  },

  logout() {
    try {
      fetch(this.v1() + "/auth/logout", {
        method: "POST",
        headers: this.headers(true),
        body: JSON.stringify({ refreshToken: localStorage.getItem(REFRESH_KEY) }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  },

  async encrypt(pass: string) {
    const pt = localStorage.getItem(STORAGE_KEY) || "{}";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, salt);
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(pt));
    return {
      ciphertext: b64(ct),
      iv: b64(iv),
      salt: b64(salt),
      alg: "AES-256-GCM",
      kdf: { name: "PBKDF2", iterations: 210000, hash: "SHA-256" },
    };
  },

  async decrypt(env: { salt: string; iv: string; ciphertext: string }, pass: string): Promise<string> {
    const key = await deriveKey(pass, new Uint8Array(unb64(env.salt)));
    const iv = new Uint8Array(unb64(env.iv));
    const ct = new Uint8Array(unb64(env.ciphertext));
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(pt);
  },

  async activateLicense(key: string) {
    const r = await this.apiFetch(this.v1() + "/license/activate", {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({ key }),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    return d;
  },

  async syncNow(passphrase: string): Promise<{ conflict?: boolean; upToDate?: boolean }> {
    const since = localStorage.getItem(SYNC_VERSION_KEY) || "0";
    const pullRes = await this.apiFetch(this.v1() + "/sync/pull?sinceVersion=" + since, {
      headers: this.headers(true),
    });

    if (pullRes.status === 204) {
      /* up to date on server side for pull */
    } else if (pullRes.ok) {
      const env = await pullRes.json();
      const json = await this.decrypt(env, passphrase);
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(SYNC_VERSION_KEY, String(env.version));
    } else if (pullRes.status !== 204) {
      const err = await pullRes.json().catch(() => ({}));
      throw err;
    }

    const env = await this.encrypt(passphrase);
    const baseVersion = Number(localStorage.getItem(SYNC_VERSION_KEY) || 0);
    const pushRes = await this.apiFetch(this.v1() + "/sync/push", {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({ ...env, baseVersion, clientUpdatedAt: new Date().toISOString() }),
    });

    if (pushRes.status === 409) {
      const body = await pushRes.json();
      return { conflict: true, ...body };
    }
    const d = await pushRes.json();
    if (!pushRes.ok) throw d;
    localStorage.setItem(SYNC_VERSION_KEY, String(d.version));
    return { upToDate: false };
  },

  async backupNow(passphrase: string) {
    const env = await this.encrypt(passphrase);
    const r = await this.apiFetch(this.v1() + "/backups", {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({ ...env, label: "manual", clientUpdatedAt: new Date().toISOString() }),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    return d;
  },

  getSyncVersion(): number {
    return Number(localStorage.getItem(SYNC_VERSION_KEY) || 0);
  },
};

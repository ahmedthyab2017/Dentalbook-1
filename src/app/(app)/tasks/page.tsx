"use client";

import { useEffect, useState } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Cloud } from "@/lib/cloud";
import { TasksApi, type CloudTask } from "@/lib/tasks-api";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";

export default function TasksPage() {
  const db = useDbStore((s) => s.db);
  const user = useSessionStore((s) => s.user);
  const [tasks, setTasks] = useState<CloudTask[]>([]);
  const configured = Cloud.configured();
  const authed = Cloud.loggedIn();
  const [loading, setLoading] = useState(() => configured && authed);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  async function reloadTasks() {
    if (!configured || !authed) return;
    setLoading(true);
    setError("");
    try {
      setTasks(await TasksApi.list());
    } catch {
      setError("فشل تحميل المهام");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!configured || !authed) return;
    let cancelled = false;
    void TasksApi.list()
      .then((items) => {
        if (!cancelled) {
          setTasks(items);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) setError("فشل تحميل المهام");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [configured, authed]);

  async function createTask() {
    if (!title.trim() || !assigneeId) return;
    const staff = db.staff.find((s) => s.id === assigneeId);
    await TasksApi.create({
      title: title.trim(),
      note: note.trim(),
      assigneeStaffId: assigneeId,
      assigneeName: staff?.name || "",
      assignerName: user?.name || "—",
    });
    setModalOpen(false);
    setTitle("");
    setNote("");
    reloadTasks();
  }

  if (!configured || !authed) {
    return (
      <DantalPage title="المهام">
          <div className="page-head"><h1 className="page-title">المهام</h1></div>
          <EmptyState>
            المهام تتطلب Cloud Sync — فعّله من الإعدادات ← Cloud Sync ثم سجّل الدخول.
          </EmptyState>
        </DantalPage>
    );
  }

  const openTasks = tasks.filter((t) => t.status === "open");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <DantalPage title="المهام">
        <div className="page-head">
          <h1 className="page-title">المهام</h1>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ مهمة</button>
        </div>

        {loading && <p className="muted">جاري التحميل...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="card mt-2">
          <div className="card-head"><h3>مفتوحة ({openTasks.length})</h3></div>
          {openTasks.length === 0 ? (
            <EmptyState>لا مهام مفتوحة</EmptyState>
          ) : (
            openTasks.map((t) => (
              <TaskRow key={t.id} task={t} onDone={() => TasksApi.setStatus(t.id, "done").then(reloadTasks)} onDelete={() => { if (confirm("حذف؟")) TasksApi.remove(t.id).then(reloadTasks); }} />
            ))
          )}
        </div>

        <div className="card mt-3">
          <div className="card-head"><h3>منجزة ({doneTasks.length})</h3></div>
          {doneTasks.map((t) => (
            <TaskRow key={t.id} task={t} onReopen={() => TasksApi.setStatus(t.id, "open").then(reloadTasks)} done />
          ))}
        </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="مهمة جديدة">
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full"><label>العنوان</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="field full"><label>ملاحظة</label><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <div className="field full"><label>مسند إلى</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">—</option>
                {db.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <p className="muted mt-2">لا تضع بيانات حساسة للمرضى في المهام.</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>إلغاء</button>
          <button className="btn btn-primary" onClick={createTask}>حفظ</button>
        </div>
      </Modal>
    </DantalPage>
  );
}

function TaskRow({
  task,
  done,
  onDone,
  onReopen,
  onDelete,
}: {
  task: CloudTask;
  done?: boolean;
  onDone?: () => void;
  onReopen?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="recall-row">
      <div>
        <b>{task.title}</b>
        {task.note && <div className="muted">{task.note}</div>}
        <div className="muted">{task.assigneeName} ← {task.assignerName}</div>
      </div>
      <div className="row gap">
        {!done && onDone && <button className="btn btn-sm btn-primary" onClick={onDone}>✓</button>}
        {done && onReopen && <button className="btn btn-sm" onClick={onReopen}>↩</button>}
        {onDelete && <button className="btn btn-sm btn-danger" onClick={onDelete}>×</button>}
      </div>
    </div>
  );
}

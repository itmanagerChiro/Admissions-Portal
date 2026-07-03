"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  senderRole: "STAFF" | "STUDENT";
  body: string;
  sentAt: string | Date;
};

type ChatThread = {
  id: string;
  messages: ChatMessage[];
};

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(date: string | Date) {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export function StudentChatWidget({ applicationId, thread }: { applicationId: string; thread: ChatThread | null }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setIsLoading(true);

    await fetch(`/api/student/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setBody("");
    setIsLoading(false);
    router.refresh();
  }

  const groups: { label: string; messages: ChatMessage[] }[] = [];
  for (const msg of thread?.messages ?? []) {
    const label = formatDayLabel(msg.sentAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: 560 }}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
        style={{ backgroundColor: "#EFEFEC" }}
      >
        {!thread || thread.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs" style={{ color: "#999" }}>No messages yet.</p>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                <span
                  className="font-semibold uppercase tracking-wide"
                  style={{
                    fontSize: 10,
                    backgroundColor: "rgba(0,0,0,0.06)",
                    color: "#888",
                    padding: "5px 12px",
                    borderRadius: 999,
                    lineHeight: 1,
                  }}
                >
                  {group.label}
                </span>
              </div>
              {group.messages.map((msg, mi) => {
                const isStudent = msg.senderRole === "STUDENT";
                const prev = group.messages[mi - 1];
                const isSameSenderAsPrev = prev && prev.senderRole === msg.senderRole;
                return (
                  <div
                    key={msg.id}
                    className={["flex", isStudent ? "justify-end" : "justify-start"].join(" ")}
                    style={{ marginTop: isSameSenderAsPrev ? 2 : 10 }}
                  >
                    <div
                      className="max-w-[75%] text-sm leading-snug"
                      style={{
                        backgroundColor: isStudent ? "#114E3B" : "#fff",
                        color: isStudent ? "#fff" : "#222",
                        borderRadius: 18,
                        borderBottomRightRadius: isStudent ? 4 : 18,
                        borderBottomLeftRadius: isStudent ? 18 : 4,
                        boxShadow: isStudent ? "none" : "0 1px 1px rgba(0,0,0,0.05)",
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ wordBreak: "break-word" }}>{msg.body}</div>
                      <div
                        style={{ fontSize: 10, marginTop: 4, color: isStudent ? "rgba(255,255,255,0.65)" : "#aaa", textAlign: "right" }}
                      >
                        {formatTime(msg.sentAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSend}
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "12px 16px", flexShrink: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={1}
            placeholder="Message the admissions team…"
            className="text-sm focus:outline-none text-text placeholder:text-text-light resize-none"
            style={{
              flex: 1,
              backgroundColor: "#F2F2F0",
              border: "1.5px solid rgba(0,0,0,0.08)",
              borderRadius: 20,
              padding: "9px 16px",
              lineHeight: "20px",
              maxHeight: 100,
            }}
          />
          <button
            type="submit"
            disabled={!body.trim() || isLoading}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: !body.trim() || isLoading ? "rgba(17,78,59,0.3)" : "#114E3B",
              color: "#fff",
              border: "none",
              cursor: !body.trim() || isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

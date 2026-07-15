"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface AdminSidebarProps {
  isGlobalAdmin: boolean;
  pendingStaffTaskCount: number;
  intlAttentionCount: number;
  unseenSubmissionCount: number;
  userName: string;
  isAdmin: boolean;
  activeIntakeLabel?: string;
}


function HomeIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function PipelineIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
}
function UsersIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function TaskIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function InboxIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 3h6l2-3h4M5 5h14l2 7v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7l2-7z" /></svg>;
}
function GlobeIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ChartIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function StaffIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function SettingsIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

function NavLink({ href, icon, children, badge, exact }: { href: string; icon: React.ReactNode; children: React.ReactNode; badge?: number; exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg mx-2 transition-colors",
        isActive ? "font-semibold" : "hover:bg-white/10",
      ].join(" ")}
      style={
        isActive
          ? { backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }
          : { color: "rgba(255,255,255,0.75)" }
      }
    >
      <span className="flex items-center gap-2.5">
        <span style={{ opacity: isActive ? 1 : 0.7 }}>{icon}</span>
        {children}
      </span>
      {badge ? (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: "#C79A3B", color: "#fff" }}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 mb-1 mt-5 text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
      {children}
    </p>
  );
}

export function AdminSidebar({ isGlobalAdmin, pendingStaffTaskCount, intlAttentionCount, unseenSubmissionCount, userName, activeIntakeLabel }: AdminSidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full" style={{ backgroundColor: "#114E3B" }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Link href="/admin">
          <Image
            src="/nzcc-logo-white.png"
            alt="New Zealand College of Chiropractic"
            width={148}
            height={46}
          />
        </Link>
      </div>

      {/* Intake badge */}
      {activeIntakeLabel && (
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(199,154,59,0.15)", border: "1px solid rgba(199,154,59,0.25)" }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#C79A3B" }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(199,154,59,0.7)" }}>Active Intake</p>
              <p className="text-sm font-bold" style={{ color: "#C79A3B" }}>{activeIntakeLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <SectionLabel>Overview</SectionLabel>
        <NavLink href="/admin" icon={<HomeIcon />} exact>Dashboard</NavLink>
        <NavLink href="/admin/pipeline" icon={<PipelineIcon />}>Pipeline</NavLink>

        <SectionLabel>Applicants</SectionLabel>
        <NavLink href="/admin/applicants" icon={<UsersIcon />}>All Applicants</NavLink>
        <NavLink href="/admin/tasks" icon={<TaskIcon />} badge={pendingStaffTaskCount || undefined} exact>My Tasks</NavLink>
        <NavLink href="/admin/tasks/submissions" icon={<InboxIcon />} badge={unseenSubmissionCount || undefined}>Submissions</NavLink>

        <SectionLabel>Workflows</SectionLabel>
        <NavLink href="/admin/international" icon={<GlobeIcon />} badge={intlAttentionCount || undefined}>International</NavLink>

        <SectionLabel>Reports</SectionLabel>
        <NavLink href="/admin/reports" icon={<ChartIcon />}>Reports</NavLink>

        {isGlobalAdmin && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <NavLink href="/admin/staff" icon={<StaffIcon />}>Staff</NavLink>
            <NavLink href="/admin/settings" icon={<SettingsIcon />}>Settings</NavLink>
          </>
        )}
      </nav>

      {/* User + sign out */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}>
          {userName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{userName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[11px] transition-colors hover:text-white/80"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

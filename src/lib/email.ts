import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { EmailTemplateKey } from "@/generated/prisma/client";

let client: Resend | null = null;

function getClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

function getFromAddress() {
  const address = process.env.EMAIL_FROM_ADDRESS;
  const name = process.env.EMAIL_FROM_NAME;
  if (!address) throw new Error("EMAIL_FROM_ADDRESS is not set");
  return name ? `${name} <${address}>` : address;
}

/** Builds an absolute link to a path on the canonical app URL, for use in emails. */
export function buildAppUrl(path: string) {
  const base = process.env.AUTH_URL;
  if (!base) throw new Error("AUTH_URL is not set");
  return new URL(path, base).toString();
}

function render(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] ?? match);
}

export const DEFAULT_EMAIL_TEMPLATES: Record<
  EmailTemplateKey,
  { name: string; description: string; subject: string; bodyHtml: string }
> = {
  ACCOUNT_VERIFICATION: {
    name: "Account Verification",
    description: "Sent when a student registers, to confirm their email address.",
    subject: "Verify your NZCC Admissions account",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>Welcome to the NZCC Admissions Portal. Please confirm your email address to activate your account:</p>
<p><a href="{{verifyUrl}}">Verify my email</a></p>
<p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`,
  },
  PASSWORD_RESET: {
    name: "Password Reset",
    description: "Sent when a user requests a password reset.",
    subject: "Reset your NZCC Admissions password",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>We received a request to reset your password. Click below to choose a new one:</p>
<p><a href="{{resetUrl}}">Reset my password</a></p>
<p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  },
  STAFF_ACCOUNT_CREATED: {
    name: "Staff Account Created",
    description: "Sent when a global admin creates a new staff account.",
    subject: "Your NZCC Admissions staff account",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>An NZCC Admissions staff account has been created for you.</p>
<p>Email: {{email}}</p>
<p>Please verify your email to activate your account:</p>
<p><a href="{{verifyUrl}}">Verify my email</a></p>`,
  },
  STAGE_CHANGE_NOTIFICATION: {
    name: "Application Stage Changed",
    description: "Sent to a student when their application moves to a new stage.",
    subject: "Your application status has been updated",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>Your application has moved to the <strong>{{stageName}}</strong> stage.</p>
<p><a href="{{portalUrl}}">View your application</a></p>`,
  },
  TASKS_ASSIGNED: {
    name: "New Tasks Assigned",
    description: "Sent to a student when one or more new tasks are assigned to their application.",
    subject: "New tasks assigned to your application",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>Please complete your tasks. The following have been added to your application:</p>
<ul>{{taskList}}</ul>
<p><a href="{{portalUrl}}">View your tasks</a></p>`,
  },
  TASK_REMINDER: {
    name: "Task Reminder",
    description: "Sent on demand by staff to remind a student of outstanding tasks.",
    subject: "Reminder: you have outstanding tasks",
    bodyHtml: `<p>Kia ora {{firstName}},</p>
<p>This is a reminder that you still have outstanding tasks on your application:</p>
<ul>{{taskList}}</ul>
<p>Please complete these as soon as possible.</p>
<p><a href="{{portalUrl}}">View your tasks</a></p>`,
  },
  TASKS_ALL_COMPLETE_ADMIN: {
    name: "Student Completed All Tasks",
    description: "Sent to staff when a student completes all of their required tasks.",
    subject: "{{studentName}} has completed all required tasks",
    bodyHtml: `<p>{{studentName}} has completed all of their required tasks:</p>
<ul>{{taskList}}</ul>
<p><a href="{{applicantUrl}}">View application</a></p>`,
  },
};

async function getTemplate(key: EmailTemplateKey) {
  const row = await prisma.emailTemplate.findUnique({ where: { key } });
  if (row) return { subject: row.subject, bodyHtml: row.bodyHtml };
  return DEFAULT_EMAIL_TEMPLATES[key];
}

export async function sendTemplatedEmail(
  key: EmailTemplateKey,
  to: string,
  variables: Record<string, string>
) {
  const template = await getTemplate(key);
  const subject = render(template.subject, variables);
  const html = render(template.bodyHtml, variables);

  await getClient().emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
  });
}

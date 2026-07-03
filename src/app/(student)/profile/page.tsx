import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { application: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">My Details</p>
      <h1 className="font-serif text-3xl text-text mb-6">My Profile</h1>

      <ProfileForm
        userId={user.id}
        initialData={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.application?.phone ?? "",
          address: user.application?.address ?? "",
          city: user.application?.city ?? "",
          postcode: user.application?.postcode ?? "",
          country: user.application?.country ?? "New Zealand",
          currentSchool: user.application?.currentSchool ?? "",
          guardianName: user.application?.guardianName ?? "",
          guardianEmail: user.application?.guardianEmail ?? "",
          guardianPhone: user.application?.guardianPhone ?? "",
        }}
      />
    </div>
  );
}

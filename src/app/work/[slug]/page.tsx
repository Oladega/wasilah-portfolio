import { DesktopShell } from "@/components/layout/DesktopShell";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { portfolioMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/public/StructuredData";
import { structuredData } from "@/lib/structured-data";
import { projects } from "@/data/projects";
import { Home } from "@/components/home/Home";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return portfolioMetadata({
    title: `${project.title} | Wasilat Atilade`,
    description: project.description,
    path: `/work/${project.slug}`,
  });
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <DesktopShell>
      <StructuredData data={structuredData(`/work/${project.slug}`, project.title, "ItemPage", project)} /><Home key={project.slug} project={project} />
    </DesktopShell>
  );
}

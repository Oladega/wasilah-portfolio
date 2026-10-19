import { navigation, type WindowId } from '@/data/site';
import { AboutWindow } from '@/components/about/AboutWindow';
import { WorkWindow } from '@/components/work/WorkWindow';
import { ResumeWindow } from '@/components/shared/ResumeWindow';
import { ContactWindow } from '@/components/contact/ContactWindow';
import { ProjectPage } from '@/components/work/ProjectPage';
import type { Project } from '@/types/project';
import type { ComponentType } from 'react';
export type WindowContentProps = { onClose: () => void; project?: Project };
function WorkContent({ onClose, project }: WindowContentProps) {
  return project ? <ProjectPage project={project} onClose={onClose} /> : <WorkWindow onClose={onClose} />;
}
export type WindowDefinition = {
  id: WindowId; title: string; controlLabel: string; icon: string; component: ComponentType<WindowContentProps>;
  canMaximize: boolean;
  sizing: 'expanded' | 'default';
  minimumDimensions: null;
  stacking: 'desktop-multiple-mobile-single';
  responsive: { mobileBreakpoint: number; strategy: 'existing-styles' };
};
const components = { about: AboutWindow, work: WorkContent, resume: ResumeWindow, contact: ContactWindow };
export const windowRegistry = Object.fromEntries(navigation.map(item => [item.id, {
  id: item.id, title: item.id === "work" ? "Work" : item.label, icon: item.image, component: components[item.id],
  controlLabel: { about: "About Me", work: "My Work", resume: "Résumé", contact: "Contact Me" }[item.id],
  canMaximize: item.id !== 'contact',
  sizing: item.id === 'contact' ? 'default' : 'expanded', minimumDimensions: null,
  stacking: 'desktop-multiple-mobile-single', responsive: { mobileBreakpoint: 810, strategy: 'existing-styles' },
}])) as Record<WindowId, WindowDefinition>;
export const windowIds = navigation.map(item => item.id);

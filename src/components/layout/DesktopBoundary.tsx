'use client';
import dynamic from 'next/dynamic';
import {usePathname} from 'next/navigation';
const DesktopProvider=dynamic(()=>import('@/components/windows/WindowManager').then(module=>module.WindowManagerProvider));
// Keep one provider across desktop/project navigation, without loading its registry on reading pages.
export function DesktopBoundary({children}:{children:React.ReactNode}){
 const path=usePathname();
 const desktop=path==='/'||path.startsWith('/work/');
 return desktop?<DesktopProvider initialId={path.startsWith('/work/')?'work':undefined}>{children}</DesktopProvider>:children;
}

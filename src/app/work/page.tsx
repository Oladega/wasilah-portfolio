import Link from 'next/link';
import {ResponsiveImage as Image} from '@/components/shared/ResponsiveImage';
import {PublicPage} from '@/components/public/PublicPage';
import {StructuredData} from '@/components/public/StructuredData';
import {SessionProjectList} from '@/components/work/SessionProjectList';
import {projects} from '@/data/projects';
import {portfolioMetadata} from '@/lib/metadata';
import {projectOrderStyle} from '@/lib/project-order';
import {structuredData} from '@/lib/structured-data';

export const metadata = portfolioMetadata({
  title: 'Projects & Work | Wasilat Atilade',
  description: 'Explore Wasilat Atilade’s marketing campaigns, university events and community leadership: Sunbo Collective, Final Year Week, NSASA and Explore 7.0.',
  path: '/work',
});

export default function Page() {
  const items = projects.map((project, index) => ({
    slug: project.slug,
    content: <section key={project.slug} data-project-slug={project.slug} style={projectOrderStyle(project.slug)}>
      <Link prefetch={false} href={`/work/${project.slug}`}>
        <Image
          src={project.thumbnail}
          width={project.photos.find(photo => photo.src === project.thumbnail)?.width ?? 1200}
          height={project.photos.find(photo => photo.src === project.thumbnail)?.height ?? 800}
          style={{width: 420, maxWidth: '100%', height: 'auto'}}
          sizes="(max-width:600px) 85vw, 420px"
          alt={`${project.title} — ${project.category}`}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
        <h2>{project.title}</h2>
      </Link>
      <p>{project.role} · {project.category}{project.year ? ` · ${project.year}` : ''}</p>
      <p>{project.context}</p>
      <p>{project.description}</p>
      <Link prefetch={false} href={`/work/${project.slug}`}>Read the {project.title} case study →</Link>
    </section>,
  }));

  return <PublicPage title="Projects & Work" section="Work">
    <StructuredData data={structuredData('/work', 'Projects & Work', 'CollectionPage')} />
    <p>Selected marketing, events and community leadership projects by Wasilat Atilade.</p>
    <SessionProjectList items={items} />
    <p><a href="/documents/portfolio.pdf" download>Download portfolio PDF</a></p>
  </PublicPage>;
}

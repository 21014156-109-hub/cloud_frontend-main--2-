type Crumb = { name: string; link?: string };

export default function Breadcrumbs({ breadcrumb }: { breadcrumb: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        {breadcrumb.map((b, i) => (
          <li key={i} className={`breadcrumb-item ${i === breadcrumb.length - 1 ? 'active' : ''}`} aria-current={i === breadcrumb.length - 1 ? 'page' : undefined}>
            {i === breadcrumb.length - 1 || !b.link ? b.name : <a href={b.link}>{b.name}</a>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

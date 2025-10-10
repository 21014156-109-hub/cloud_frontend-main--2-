type Crumb = { name: string; link?: string };

export default function Breadcrumbs({ breadcrumb }: { breadcrumb: Crumb[] }) {
  // Remove consecutive duplicate names (e.g., [Dashboard, Dashboard]) before rendering
  const deduped: Crumb[] = [];
  for (const c of breadcrumb) {
    if (deduped.length === 0) deduped.push(c);
    else if (deduped[deduped.length - 1].name !== c.name) deduped.push(c);
    // if same as previous, skip
  }

  return (
    <nav aria-label="breadcrumb">
      <div className="breadcrumb-pill" role="navigation">
        <i className="fa fa-home" aria-hidden="true" />
        {deduped.map((b, i) => (
          <span key={i} className={`breadcrumb-seg ${i === deduped.length - 1 ? 'active' : ''}`}>
            {i > 0 && <span className="sep"> - </span>}
            {i === deduped.length - 1 || !b.link ? b.name : <a href={b.link}>{b.name}</a>}
          </span>
        ))}
      </div>
    </nav>
  );
}

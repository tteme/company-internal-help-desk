function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export default PageHeader;

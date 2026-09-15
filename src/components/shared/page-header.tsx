type PageHeaderProps = { description?: string; title: string };
export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

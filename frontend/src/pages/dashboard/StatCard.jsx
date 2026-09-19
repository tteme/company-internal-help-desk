import Card from "../../components/ui/Card";

function StatCard({ label, value, description, indicator }) {
  return (
    <Card as="section" className="p-5">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>

        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${indicator}`}
        />
      </header>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-text">
        {value}
      </p>

      <p className="mt-2 text-xs text-text-muted">{description}</p>
    </Card>
  );
}

export default StatCard;

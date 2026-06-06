interface ColumnHeaderProps {
  title: string;
  count: number;
}

export default function ColumnHeader({ title, count }: ColumnHeaderProps) {
  return (
    <div className="column-header">
      <span>{title}</span>
      <span className="column-count">{count}</span>
    </div>
  );
}

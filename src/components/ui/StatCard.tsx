import { Icon, type IconName } from "./Icon";

export type StatColor = "teal" | "green" | "amber" | "violet" | "rose" | "brass";

export function StatCard({
  color,
  icon,
  label,
  value,
}: {
  color: StatColor;
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon name={icon} />
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

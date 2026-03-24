type StatCardProps = {
  icon: string;
  value: number | string;
  label: string;
  accentColor: string;
};

export function StatCard({ icon, value, label, accentColor }: StatCardProps) {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;
  return (
    <div
      className="admin-card flex items-start gap-4 transition-all duration-300"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(Math.max(numericValue * 10, 0), 100)}%`,
              backgroundColor: accentColor 
            }}
          />
        </div>
      </div>
    </div>
  );
}

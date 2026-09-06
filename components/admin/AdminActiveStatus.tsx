export type AdminActiveStatusFilter = 'all' | 'active' | 'inactive';

type AdminStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function AdminStatusBadge({ isActive, className = '' }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${
        isActive
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      } ${className}`.trim()}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

type AdminStatusFilterProps = {
  value: AdminActiveStatusFilter;
  onChange: (value: AdminActiveStatusFilter) => void;
  className?: string;
};

export function AdminStatusFilter({ value, onChange, className = '' }: AdminStatusFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AdminActiveStatusFilter)}
      className={`px-3 py-2 border border-foreground/20 rounded-lg bg-primary/60 text-foreground text-sm ${className}`.trim()}
      aria-label="Filter by status"
    >
      <option value="all">All statuses</option>
      <option value="active">Active only</option>
      <option value="inactive">Inactive only</option>
    </select>
  );
}

type AdminStatusToggleButtonProps = {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function AdminStatusToggleButton({ isActive, onToggle, disabled }: AdminStatusToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`text-sm font-semibold transition-colors disabled:opacity-50 ${
        isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
      }`}
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}

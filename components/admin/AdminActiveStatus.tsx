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
      aria-label={isActive ? 'Set inactive' : 'Set active'}
      className="text-xs font-medium text-foreground/60 hover:text-button transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
    >
      {isActive ? 'Set inactive' : 'Set active'}
    </button>
  );
}

type AdminStatusCellProps = {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

/** Badge (current state) + toggle link in one column — keeps Actions for Edit only. */
export function AdminStatusCell({ isActive, onToggle, disabled }: AdminStatusCellProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <AdminStatusBadge isActive={isActive} />
      <AdminStatusToggleButton isActive={isActive} onToggle={onToggle} disabled={disabled} />
    </div>
  );
}

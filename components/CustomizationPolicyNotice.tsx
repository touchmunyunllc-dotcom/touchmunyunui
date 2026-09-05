import { collectCustomizationPolicies } from '@/services/productCustomizationService';

type CustomizationPolicyNoticeProps = {
  items: Array<{
    customizationPolicy?: string | null;
    customNumber?: string | null;
    writingColor?: string | null;
  }>;
  className?: string;
  variant?: 'inline' | 'boxed';
};

export function CustomizationPolicyNotice({
  items,
  className = '',
  variant = 'inline',
}: CustomizationPolicyNoticeProps) {
  const policies = collectCustomizationPolicies(items);
  if (policies.length === 0) return null;

  if (variant === 'boxed') {
    return (
      <>
        {policies.map((policy) => (
          <div key={policy} className={`p-4 bg-primary/40 border border-foreground/20 rounded-lg ${className}`.trim()}>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{policy}</p>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {policies.map((policy) => (
        <p
          key={policy}
          className={`text-xs text-foreground/60 leading-relaxed whitespace-pre-line ${className}`.trim()}
        >
          {policy}
        </p>
      ))}
    </>
  );
}

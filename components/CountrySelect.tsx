import { useEffect, useState } from 'react';
import { countryService, Country } from '@/services/countryService';
import { coerceCountryCode } from '@/lib/shippingCountry';

type CountrySelectProps = {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
};

export function CountrySelect({
  id,
  value,
  onChange,
  className,
  required,
  disabled,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    countryService
      .list()
      .then(setCountries)
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!countries.length || !value || value.length === 2) return;
    const coerced = coerceCountryCode(value, countries);
    if (coerced !== value) onChange(coerced);
  }, [countries, value, onChange]);

  const selected = countries.length ? coerceCountryCode(value, countries) : value || 'US';

  return (
    <select
      id={id}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      required={required}
      disabled={disabled || loading}
    >
      {loading ? (
        <option value="US">Loading countries…</option>
      ) : (
        countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))
      )}
    </select>
  );
}

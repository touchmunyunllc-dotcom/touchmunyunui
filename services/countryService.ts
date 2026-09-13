import publicApiClient from './publicApiClient';

export type Country = {
  code: string;
  name: string;
};

let cached: Country[] | null = null;

export const countryService = {
  async list(): Promise<Country[]> {
    if (cached?.length) {
      return cached;
    }
    const { data } = await publicApiClient.get<Country[]>('/countries');
    cached = data;
    return data;
  },

  countryName(code: string, countries: Country[]): string {
    const match = countries.find((c) => c.code === code);
    return match?.name ?? code;
  },
};

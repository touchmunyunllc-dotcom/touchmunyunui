import { ErrorPage } from '@/components/ErrorPage';

export default function Custom404() {
  return (
    <ErrorPage
      statusCode={404}
      variant="notFound"
      showRetry={false}
    />
  );
}

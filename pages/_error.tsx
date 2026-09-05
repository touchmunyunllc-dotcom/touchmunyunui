import { NextPageContext } from 'next';
import { ErrorPage } from '@/components/ErrorPage';
import { getApiErrorMessage } from '@/lib/apiError';

interface ErrorProps {
  statusCode: number;
  err?: Error & { userMessage?: string };
}

function Error({ statusCode, err }: ErrorProps) {
  const variant = statusCode === 404 ? 'notFound' : statusCode >= 500 ? 'server' : 'client';
  const detail =
    err?.userMessage ||
    (err?.message && !err.message.includes('Invariant') ? getApiErrorMessage(err) : undefined);

  return (
    <ErrorPage
      statusCode={statusCode}
      variant={variant}
      detail={detail && detail !== 'Something went wrong. Please try again.' ? detail : undefined}
      showRetry={statusCode !== 404}
    />
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode, err };
};

export default Error;

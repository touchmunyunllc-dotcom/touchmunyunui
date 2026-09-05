import { useState } from 'react';
import { ErrorPage } from '@/components/ErrorPage';

export default function Custom500() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
    setRetrying(false);
  };

  return (
    <ErrorPage
      statusCode={500}
      variant="server"
      onRetry={handleRetry}
      retrying={retrying}
    />
  );
}

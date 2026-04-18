import React, { useEffect, useState } from 'react';
import { versionService, VersionInfo as VersionInfoData } from '@/services/versionService';

interface VersionInfoProps {
  showDetails?: boolean;
  className?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ 
  showDetails = false,
  className = '' 
}) => {
  const [apiVersion, setApiVersion] = useState<string>('1.0.0');
  const [appVersion] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    }
    return '1.0.0';
  });
  const [versionDetails, setVersionDetails] = useState<VersionInfoData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        setLoading(true);
        const info = await versionService.getApiVersion();
        setApiVersion(info.apiVersion);
        if (showDetails) {
          setVersionDetails(info);
        }
      } catch (error) {
        console.error('Failed to fetch API version:', error);
        // Fallback to default version
        setApiVersion('1.0.0');
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, [showDetails]);

  if (loading && showDetails) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Loading version...
      </div>
    );
  }

  if (showDetails && versionDetails) {
    return (
      <div className={`text-xs text-gray-400 space-y-1 ${className}`}>
        <div>App Version: {appVersion}</div>
        <div>API Version: {apiVersion}</div>
        <div>Environment: {versionDetails.environment}</div>
        <div>Build Date: {new Date(versionDetails.buildDate).toLocaleDateString()}</div>
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      App v{appVersion} | API v{apiVersion}
    </div>
  );
};


import axios from 'axios';
import apiClient from './apiClient';

export interface VersionInfo {
  apiVersion: string;
  assemblyVersion: string;
  environment: string;
  buildDate: string;
  framework: string;
  machineName: string;
}

export interface HealthInfo {
  status: string;
  version: string;
  timestamp: string;
}

export const versionService = {
  /**
   * Get API version information
   */
  async getApiVersion(): Promise<VersionInfo> {
    const response = await apiClient.get<VersionInfo>('/version');
    return response.data;
  },

  /**
   * Get API health check
   */
  async getHealth(): Promise<HealthInfo> {
    const response = await apiClient.get<HealthInfo>('/version/health');
    return response.data;
  },

  /**
   * Get frontend app version from package.json
   */
  getAppVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  },
};


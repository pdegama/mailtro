import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';

type HealthCheckResponse = {
  status: string;
};

async function getHealthCheck() {
  const response = await axiosClient.get<HealthCheckResponse>('/health');
  return response.data;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: getHealthCheck,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { type RegisterDeviceInput, type SubmitReportInput } from '../types';

export const useDevices = () => {
  const queryClient = useQueryClient();

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: apiService.getDevices,
    refetchInterval: 15000, 
  });

  
  const registerMutation = useMutation({
    mutationFn: (newDevice: RegisterDeviceInput) => apiService.registerDevice(newDevice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  return {
    devices: devicesQuery.data || [],
    isLoading: devicesQuery.isLoading,
    isError: devicesQuery.isError,
    registerDevice: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
};

export const useDeviceDetails = (id: string | number) => {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ['device', id],
    queryFn: () => apiService.getDeviceById(id),
    enabled: !!id,
  });

  const historyQuery = useQuery({
    queryKey: ['device-history', id],
    queryFn: () => apiService.getDeviceHistory(id),
    enabled: !!id,
    refetchInterval: 15000, 
  });

  const reportMutation = useMutation({
    mutationFn: (report: SubmitReportInput) => apiService.submitStatusReport(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['device-history', id] });
    },
  });

  return {
    device: detailsQuery.data,
    history: historyQuery.data || [],
    isLoading: detailsQuery.isLoading || historyQuery.isLoading,
    isError: detailsQuery.isError || historyQuery.isError,
    submitReport: reportMutation.mutateAsync,
    isSubmittingReport: reportMutation.isPending,
  };
};

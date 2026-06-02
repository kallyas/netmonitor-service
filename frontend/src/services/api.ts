import type { Device, StatusReport, RegisterDeviceInput, SubmitReportInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiService = {
    
  getDevices: async (): Promise<Device[]> => {
    const res = await fetch(`${API_BASE_URL}/devices/`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },
  

  getDeviceById: async (id: string | number): Promise<Device> => {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/`);
    if (!res.ok) throw new Error(`Failed to fetch device with ID: ${id}`);
    return res.json();
  },


  registerDevice: async (data: RegisterDeviceInput): Promise<Device> => {
    const res = await fetch(`${API_BASE_URL}/devices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register device');
    return res.json();
  },


  submitStatusReport: async (id: string | number, data: SubmitReportInput): Promise<StatusReport> => {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/report/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit status report');
    return res.json();
  },

  getDeviceHistory: async (id: string | number): Promise<StatusReport[]> => {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/history/`);
    if (!res.ok) throw new Error('Failed to fetch historical reports');
    return res.json();
  },
};
import { z } from 'zod';


export const DeviceTypeEnum = z.enum(['CPE', 'ROUTER', 'SWITCH', 'AP', 'FIREWALL', 'ONT']);
export type DeviceType = z.infer<typeof DeviceTypeEnum>;

export const StatusChoiceEnum = z.enum(['ONLINE', 'OFFLINE', 'DEGRADED']);
export type StatusChoice = z.infer<typeof StatusChoiceEnum>;


export const DeviceTypeLabels: Record<DeviceType, string> = {
  CPE: 'Customer Premises Equipment',
  ROUTER: 'Router',
  SWITCH: 'Switch',
  AP: 'Access Point',
  FIREWALL: 'Firewall',
  ONT: 'Optical Network Terminal',
};

const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const ipv6Regex =
  /^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:))$/;

const isValidIp = (value: string) => ipv4Regex.test(value) || ipv6Regex.test(value);

export const RegisterDeviceSchema = z.object({
  name: z.string().min(2, 'Device name must be at least 2 characters'),
  device_type: DeviceTypeEnum,
  ip_address: z
    .string()
    .refine(isValidIp, { message: 'Invalid IPv4 or IPv6 address' }),
  location: z.string().min(2, 'Location/Site placement is required'),
});
export type RegisterDeviceInput = z.infer<typeof RegisterDeviceSchema>;


export const SubmitReportSchema = z.object({
  status: StatusChoiceEnum, 
  message: z.string().optional(), 
});
export type SubmitReportInput = z.infer<typeof SubmitReportSchema>;



export interface StatusReport {
  id: number;
  timestamp: string;
  status: StatusChoice; 
  message: string | null; 
}

export interface Device {
  id: number;
  name: string;
  device_type: DeviceType;
  ip_address: string;
  location: string;
  registered_at: string;
  current_status: StatusChoice;
  last_reported_at: string | null;
  is_stale: boolean;
}
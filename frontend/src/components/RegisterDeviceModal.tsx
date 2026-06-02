import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDeviceSchema, type RegisterDeviceInput, DeviceTypeEnum } from '../types';
import { useDevices } from '../hooks/useDevices';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, MenuItem, Box, Typography
} from '@mui/material';

interface RegisterDeviceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RegisterDeviceModal({ open, onClose }: RegisterDeviceModalProps) {
  const { registerDevice, isRegistering } = useDevices();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterDeviceInput>({
    resolver: zodResolver(RegisterDeviceSchema),
    defaultValues: { name: '', device_type: 'CPE', ip_address: '', location: '' }
  });

  const onSubmit = async (data: RegisterDeviceInput) => {
    try {
      await registerDevice(data);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to register device:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0 }}>
          Register Asset
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add a monitored network device to the inventory.
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ px: 3, py: 2.5, borderColor: '#e5e8ee', backgroundColor: '#fafbfc' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <TextField
              {...register('name')}
              label="Device Name"
              fullWidth
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              {...register('device_type')}
              select
              label="Device Type"
              fullWidth
              size="small"
              defaultValue="CPE"
              error={!!errors.device_type}
              helperText={errors.device_type?.message}
            >
              {DeviceTypeEnum.options.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              {...register('ip_address')}
              label="IP Address or Hostname"
              fullWidth
              size="small"
              placeholder="e.g. 192.168.1.1"
              error={!!errors.ip_address}
              helperText={errors.ip_address?.message}
            />

            <TextField
              {...register('location')}
              label="Physical Location / Site"
              fullWidth
              size="small"
              error={!!errors.location}
              helperText={errors.location?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, backgroundColor: '#ffffff' }}>
          <Button onClick={onClose} color="inherit" disabled={isRegistering}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={isRegistering}>
            {isRegistering ? 'Registering...' : 'Register Asset'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

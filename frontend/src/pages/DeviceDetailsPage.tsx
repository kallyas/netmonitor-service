import { useParams, Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDeviceDetails } from '../hooks/useDevices';
import { SubmitReportSchema, type SubmitReportInput, StatusChoiceEnum, DeviceTypeLabels } from '../types';
import StatusBadge from '../components/StatusBadge';
import { 
  Box, Grid, Paper, Typography, Button, TextField, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function DeviceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { device, history, isLoading, isError, submitReport, isSubmittingReport } = useDeviceDetails(id || '');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SubmitReportInput>({
    resolver: zodResolver(SubmitReportSchema),
    defaultValues: { status: 'ONLINE', message: '' }
  });

  const onReportSubmit = async (data: SubmitReportInput) => {
    try {
      await submitReport(data);
      reset({ status: 'ONLINE', message: '' });
    } catch (err) {
      console.error('Telemetry report submission failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" size={32} />
      </Box>
    );
  }

  if (isError || !device) {
    return (
      <Typography color="error" sx={{ fontWeight: 500, py: 4 }}>
        Failed to load structural device metadata profile.
      </Typography>
    );
  }

  return (
    <Box>
      <Button 
        component={Link} 
        to="/" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back to Inventory Dashboard
      </Button>

      <Grid container spacing={3}>
        {/* LEFT COLUMN: Asset Metadata & Simulation Controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderColor: '#d8dde6' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>
              Node Asset Specs
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>{device.name}</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Hardware Type</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{DeviceTypeLabels[device.device_type]}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Network Address</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{device.ip_address}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Physical Site Location</Typography>
                <Typography variant="body2">{device.location}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Live Health Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={device.current_status} isStale={device.is_stale} />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Device Ingestion Simulation Console */}
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#d8dde6' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 2 }}>
              Simulate Device Telemetry
            </Typography>
            <form onSubmit={handleSubmit(onReportSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Target Status"
                      fullWidth
                      size="small"
                      error={!!errors.status}
                    >
                      {StatusChoiceEnum.options.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="Diagnostic Message (Optional)"
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="e.g. Interface gig0/1 up, link speed steady"
                      error={!!errors.message}
                      helperText={errors.message?.message}
                    />
                  )}
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary" 
                  fullWidth 
                  disableElevation
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? 'Ingesting...' : 'Emit Status Report'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Recent Log Activity Stream Ledger */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#d8dde6' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 2 }}>
              Telemetry Activity Log (Max 20 Records)
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Condition Status</TableCell>
                    <TableCell>Message Logs / Diagnostic Strings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No execution log history records emitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {new Date(report.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={report.status} isStale={false} />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {report.message || <Typography variant="caption" color="text.disabled">None</Typography>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

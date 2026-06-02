import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevices } from '../hooks/useDevices';
import { DeviceTypeLabels, type Device } from '../types';
import StatusBadge from '../components/StatusBadge';
import RegisterDeviceModal from '../components/RegisterDeviceModal';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Button, Box, IconButton, CircularProgress 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';

const csvCell = (value: string | number | boolean | null) => {
  if (value === null) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { devices, isLoading, isError } = useDevices();
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportCSV = () => {
    if (devices.length === 0) return;

    const headers = ['Device Name', 'Type', 'IP Address', 'Location', 'Status', 'Is Stale', 'Last Report'];
    const rows = devices.map((device: Device) => [
      csvCell(device.name),
      csvCell(DeviceTypeLabels[device.device_type]),
      csvCell(device.ip_address),
      csvCell(device.location),
      csvCell(device.current_status),
      csvCell(device.is_stale ? 'YES' : 'NO'),
      csvCell(device.last_reported_at ? new Date(device.last_reported_at).toISOString() : 'Never'),
    ]);

    const csvContent = [headers.map(csvCell).join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `network_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" size={32} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" sx={{ fontWeight: 500, py: 4 }}>
        Error loading network assets. Check backend connectivity.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Infrastructure Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time status monitoring summary across all active structural infrastructure nodes.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={devices.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            disableElevation
          >
            Register Device
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#d8dde6' }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Device Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>IP / Hostname</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Operational Status</TableCell>
              <TableCell>Last Report Timestamp</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No assets currently registered in this sub-system instance.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device: Device) => (
                <TableRow key={device.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{device.name}</TableCell>
                  <TableCell>{DeviceTypeLabels[device.device_type]}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{device.ip_address}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <StatusBadge status={device.current_status} isStale={device.is_stale} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {device.last_reported_at 
                      ? new Date(device.last_reported_at).toLocaleString() 
                      : 'Never Reported'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="secondary"
                      onClick={() => navigate(`/devices/${device.id}`)}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RegisterDeviceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}

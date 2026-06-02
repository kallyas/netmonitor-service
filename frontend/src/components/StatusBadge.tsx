import { Chip, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { StatusChoice } from '../types';

interface StatusBadgeProps {
  status: StatusChoice;
  isStale: boolean;
}

export default function StatusBadge({ status, isStale }: StatusBadgeProps) {
  const colorMap = {
    ONLINE: { bg: '#e6f4ea', text: '#137333', label: 'Online' },
    OFFLINE: { bg: '#fce8e6', text: '#c5221f', label: 'Offline' },
    DEGRADED: { bg: '#fef7e0', text: '#b06000', label: 'Degraded' },
  };

  const current = colorMap[status] || colorMap.OFFLINE;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={current.label}
        size="small"
        sx={{
          backgroundColor: current.bg,
          color: current.text,
          fontWeight: 600,
          borderRadius: '4px',
          border: `1px solid ${current.text}20`,
        }}
      />
      {isStale && (
        <Chip
          icon={<AccessTimeIcon style={{ fontSize: 14, color: '#7c2d12' }} />}
          label="STALE (No signal > 15m)"
          size="small"
          sx={{
            backgroundColor: '#ffedd5',
            color: '#7c2d12',
            fontWeight: 600,
            borderRadius: '4px',
            border: '1px solid #ffedd5',
          }}
        />
      )}
    </Box>
  );
}
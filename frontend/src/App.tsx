import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import Dashboard from './pages/Dashboard';
import DeviceDetailsPage from './pages/DeviceDetailsPage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f6f7f9',
      paper: '#ffffff',
    },
    primary: {
      main: '#223047',
      dark: '#162033',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
      dark: '#115e59',
      contrastText: '#ffffff',
    },
    error: { main: '#b42318' },
    warning: { main: '#b54708' },
    success: { main: '#067647' },
    text: {
      primary: '#172033',
      secondary: '#5d6678',
    },
    divider: '#d8dde6',
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h5: {
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
    },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#223047',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          borderRadius: 6,
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: '#e5e8ee',
        },
        head: {
          backgroundColor: '#eef2f6',
          color: '#38455c',
          fontWeight: 700,
          fontSize: '0.78rem',
          letterSpacing: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: '1px solid #d8dde6',
        },
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: '1px solid #172033' }}>
            <Toolbar variant="dense">
              <img src="/favicon.svg" alt="Logo" style={{ width: 28, height: 28, marginRight: 12 }} />
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, letterSpacing: 0 }}
              >
                NETMONITOR // Service
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/devices/:id" element={<DeviceDetailsPage />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

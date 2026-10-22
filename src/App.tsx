import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import RiftboundScore from './components/riftbound-score/riftbound-score';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#d9a441', contrastText: '#1d1608' },
    background: { default: '#121211', paper: '#1c1b19' },
    text: { primary: '#f2f0ea', secondary: 'rgba(242,240,234,0.6)' },
    divider: 'rgba(255,255,255,0.09)',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RiftboundScore />
    </ThemeProvider>
  );
}

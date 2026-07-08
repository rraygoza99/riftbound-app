import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import RiftboundScore from './components/riftbound-score/riftbound-score';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RiftboundScore />
    </ThemeProvider>
  );
}

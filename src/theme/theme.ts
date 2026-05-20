'use client';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

// Premium Indigo/Slate Theme Definition
const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1', // Indigo 500
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ec4899', // Pink 500
        },
        background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b', // Slate 800
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        },
        divider: 'rgba(148, 163, 184, 0.1)',
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 600 },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    backdropFilter: 'blur(8px)',
                },
            },
        },
    },
};

const theme = createTheme(themeOptions);

export default theme;

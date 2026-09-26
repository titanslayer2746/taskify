
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				paper: {
					DEFAULT: '#F1EEE3',
					deep: '#E6E1CF',
					rule: '#D3CDB7'
				},
				ink: {
					DEFAULT: '#1F3326',
					soft: '#52614F',
					faint: '#86907F'
				},
				clay: {
					DEFAULT: '#B8643C'
				},
				// Swiss instrument (new design)
				shell: {
					DEFAULT: '#E4E4E0',
					light: '#EEEEEB',
					rule: '#C6C6C0'
				},
				graphite: {
					DEFAULT: '#121212',
					soft: '#4E4E49',
					faint: '#86867F'
				},
				signal: '#FF4F12'
			},
			fontFamily: {
				display: ['"Instrument Serif"', 'Georgia', 'serif'],
				paper: ['Geist', 'system-ui', 'sans-serif'],
				ledger: ['"Geist Mono"', 'ui-monospace', 'monospace'],
				grotesk: ['"Inter Tight"', 'system-ui', 'sans-serif'],
				readout: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

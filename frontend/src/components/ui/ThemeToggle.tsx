import { Moon, SunMedium } from 'lucide-react';
import { IconButton } from './IconButton';

type ThemeToggleProps = {
  theme: 'light' | 'dark';
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      icon={theme === 'dark' ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
      onClick={onToggle}
    />
  );
}

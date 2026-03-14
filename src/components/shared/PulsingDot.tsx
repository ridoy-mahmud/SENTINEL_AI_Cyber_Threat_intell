interface PulsingDotProps {
  color?: 'cyan' | 'red' | 'green' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  cyan: 'bg-primary',
  red: 'bg-destructive',
  green: 'bg-success',
  amber: 'bg-warning',
};

const shadowMap = {
  cyan: '0 0 8px hsl(186, 100%, 50%)',
  red: '0 0 8px hsl(345, 100%, 50%)',
  green: '0 0 8px hsl(153, 100%, 50%)',
  amber: '0 0 8px hsl(33, 100%, 50%)',
};

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function PulsingDot({ color = 'cyan', size = 'sm' }: PulsingDotProps) {
  return (
    <span className="relative inline-flex">
      <span
        className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-threat-pulse`}
        style={{ boxShadow: shadowMap[color] }}
      />
    </span>
  );
}

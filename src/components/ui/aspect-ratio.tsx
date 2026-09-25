import * as React from 'react';
import { cn } from '@/lib/utils';

type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & {
  ratio: number;
};

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio, className, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    >
      {children}
    </div>
  ),
);

AspectRatio.displayName = 'AspectRatio';

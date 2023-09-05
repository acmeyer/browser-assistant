import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow hover:bg-zinc-900/90 hover:dark:bg-white/90',
        destructive:
          'bg-red-600 dark:bg-red-500 text-white shadow-sm hover:bg-red-600/90 hover:dark:bg-red-500/90',
        outline:
          'border border-zinc-100 dark:border-zinc-700 border-input bg-white dark:bg-zinc-900 shadow-sm hover:bg-zinc-100 hover:dark:bg-zinc-800 hover:text-zinc-500 dark:text-zinc-100 hover:dark:text-zinc-300',
        secondary:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-secondary/80',
        ghost:
          'hover:bg-zinc-100 hover:dark:bg-zinc-800 hover:text-zinc-700 hover:dark:text-zinc-300',
        link: 'text-zinc-900 dark:text-white underline-offset-4 hover:underline',
        none: 'bg-transparent text-zinc-900 dark:text-white shadow-none hover:bg-transparent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        icon_sm: 'h-4 w-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    fullWidth?: boolean;
    target?: string;
    rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    href,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-primary text-white hover:bg-[#2d2b6b] focus:ring-primary/50',
        secondary: 'bg-secondary text-white hover:bg-[#007ba0] focus:ring-secondary/50',
        outline: 'border border-primary bg-transparent hover:bg-primary/5 text-primary',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} `;

    if (href) {
        return (
            <Link href={href} className={combinedClassName} {...(props as any)}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
};

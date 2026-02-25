import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: boolean;
}

export const Section: React.FC<SectionProps> = ({
    children,
    className = '',
    container = true,
    ...props
}) => {
    const baseClass = 'py-12 md:py-16 lg:py-20';
    const containerClass = container ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : '';

    return (
        <section className={`${baseClass} ${className}`} {...props}>
            <div className={containerClass}>
                {children}
            </div>
        </section>
    );
};

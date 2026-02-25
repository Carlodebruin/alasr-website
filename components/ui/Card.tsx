import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

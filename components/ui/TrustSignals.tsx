import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const TrustSignals = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 border-t border-gray-100">
            <div className="flex items-center text-gray-500 text-sm font-medium">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                Secure Payments Processed by Yoco
            </div>
            <div className="flex items-center space-x-6 opacity-60">
                {/* Simple text labels for payment methods if icons aren't available */}
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Visa</div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Mastercard</div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Instant EFT</div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Apple Pay</div>
            </div>
        </div>
    );
};

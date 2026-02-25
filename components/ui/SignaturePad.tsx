"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface SignaturePadProps {
    onEnd: (dataUrl: string | null) => void;
}

export const SignaturePad = ({ onEnd }: SignaturePadProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    // Setup canvas resolution for high DPI displays
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        // We set the internal resolution to match device pixel ratio
        // But we keep the CSS size fixed (controlled by tailwind classes)
        const rect = canvas.getBoundingClientRect();

        // Set actual size in memory (scaled to account for extra pixel density)
        // We use a fixed base width for consistenct, but could use rect.width
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(ratio, ratio);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2.5;
        }
    }, []);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            // TouchEvent
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // MouseEvent
            clientX = (e as MouseEvent | React.MouseEvent).clientX;
            clientY = (e as MouseEvent | React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Prevent default only for touch to stop scrolling
        if ("touches" in e) {
            // handled by passive listener below, but good practice
        }

        setIsDrawing(true);
        setIsEmpty(false);

        const { x, y } = getCoordinates(e, canvas);
        lastPos.current = { x, y };

        // Draw a single dot in case it's just a tap
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.arc(x, y, 1.25, 0, 2 * Math.PI);
            ctx.fillStyle = "#000000";
            ctx.fill();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !lastPos.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);

        // Quadratic curve for smoother lines
        const p1 = lastPos.current;
        const p2 = { x, y };

        const midPoint = {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2
        };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        lastPos.current = p2;
    };

    const endDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        lastPos.current = null;

        const canvas = canvasRef.current;
        if (canvas) {
            onEnd(canvas.toDataURL("image/png"));
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear using internal dimensions
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        setIsEmpty(true);
        onEnd(null);
    };

    // Handle standard touch actions prevention to stop scrolling while signing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const preventDefault = (e: TouchEvent) => {
            if (e.target === canvas) e.preventDefault();
        };

        // Use passive: false to allow preventDefault
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        return () => {
            document.body.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="relative w-full h-48 bg-white" style={{ touchAction: 'none' }}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                />
            </div>
            <div className="bg-gray-50 p-2 flex justify-between items-center border-t border-gray-200">
                <span className="text-xs text-gray-500 font-medium ml-2">Sign above</span>
                <Button type="button" variant="outline" size="sm" onClick={clear} className="text-xs h-8">
                    Clear Signature
                </Button>
            </div>
        </div>
    );
};

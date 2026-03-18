"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Contact() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [formStartTime] = useState(() => Date.now().toString());

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus("idle");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/contact.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus("success");
                setMessage("Message sent successfully! We will get back to you soon.");
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus("error");
                setMessage(result.error || "Failed to send message.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Section>
            <h1 className="text-4xl font-bold mb-6 text-primary">Contact Us</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <p className="text-lg text-foreground/70 mb-8">
                        We&apos;d love to hear from you. Please fill out the form or reach out to us using the contact details below.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start">
                            <MapPin className="h-6 w-6 text-primary mr-4 mt-1" />
                            <div>
                                <h3 className="font-semibold text-foreground">Address</h3>
                                <p className="text-foreground/70">{siteConfig.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-6 w-6 text-primary mr-4" />
                            <div>
                                <h3 className="font-semibold text-foreground">Phone</h3>
                                <p className="text-foreground/70">{siteConfig.contactPhone}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Mail className="h-6 w-6 text-primary mr-4" />
                            <div>
                                <h3 className="font-semibold text-foreground">Email</h3>
                                <p className="text-foreground/70">{siteConfig.contactEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface/30 p-8 rounded-lg border border-surface">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="hidden" aria-hidden="true">
                            <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                        </div>
                        <input type="hidden" name="form_start_time" value={formStartTime} />

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground/80">Name</label>
                            <input required name="name" type="text" id="name" className="mt-1 block w-full rounded-md border-surface shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-white" placeholder="Your Name" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">Email</label>
                            <input required name="email" type="email" id="email" className="mt-1 block w-full rounded-md border-surface shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-white" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-foreground/80">Message</label>
                            <textarea required name="message" id="message" rows={4} className="mt-1 block w-full rounded-md border-surface shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-white" placeholder="How can we help you?"></textarea>
                        </div>

                        {status === "error" && (
                            <div className="text-red-600 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" /> {message}
                            </div>
                        )}

                        {status === "success" && (
                            <div className="text-green-600 text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> {message}
                            </div>
                        )}

                        <Button type="submit" fullWidth disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Message"}
                        </Button>
                    </form>
                </div>
            </div>
        </Section>
    );
}

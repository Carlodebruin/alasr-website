"use client";

import { Section } from "@/components/ui/Section";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

export default function Admissions() {
    return (
        <Section>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-6 text-primary">Admissions Application</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Welcome to Al-Asr Educational Institute. Please complete the form below to apply for your child's admission.
                    </p>
                </div>

                <ApplicationForm />

                <div className="mt-12 bg-blue-50 p-8 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-gray-600">
                        If you encounter any issues with this form, please contact our admissions office at <a href="mailto:reception@alasr.co.za" className="text-primary hover:underline">reception@alasr.co.za</a>.
                    </p>
                </div>
            </div>
        </Section>
    );
}

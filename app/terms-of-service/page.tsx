import { Section } from "@/components/ui/Section";

export default function TermsOfService() {
    return (
        <Section>
            <div className="max-w-4xl mx-auto prose prose-blue prose-lg">
                <h1 className="text-4xl font-bold mb-8 text-primary">Terms of Service</h1>

                <p className="lead">
                    Welcome to the Al-Asr Educational Institute website. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">1. Acceptance of Terms</h2>
                <p>
                    By using this site, you signify your acceptance of these terms. If you do not agree, please do not use our site.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">2. Use of Site</h2>
                <p>
                    The content on this website is for general information and educational purposes only. It is subject to change without notice.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">3. Intellectual Property</h2>
                <p>
                    This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">4. Limitations of Liability</h2>
                <p>
                    We shall not be liable for any loss or damage arising from your use of this website or reliance on information provided herein.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">5. Governing Law</h2>
                <p>
                    Your use of this website and any dispute arising out of such use is subject to the laws of South Africa.
                </p>

                <p className="mt-12 text-sm text-gray-500">
                    Last updated: January 2026
                </p>
            </div>
        </Section>
    );
}

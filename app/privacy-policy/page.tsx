import { Section } from "@/components/ui/Section";

export default function PrivacyPolicy() {
    return (
        <Section>
            <div className="max-w-4xl mx-auto prose prose-blue prose-lg">
                <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy (POPIA)</h1>

                <p className="lead">
                    This Privacy Policy describes how Al-Asr Educational Institute ("we", "us", or "our") collects, uses, and protects your personal information in compliance with the Protection of Personal Information Act (POPIA) of South Africa.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">1. Information We Collect</h2>
                <p>
                    We collect personal information that you provide to us directly through our website, application forms, and contact inquiries. This may include:
                </p>
                <ul>
                    <li>Names of parents and students</li>
                    <li>Contact details (email, phone number, address)</li>
                    <li>Academic history and identity documents</li>
                    <li>Financial information for fee payments or donations</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">2. Purpose of Collection</h2>
                <p>
                    Your information is collected for legitimate educational and administrative purposes, including:
                </p>
                <ul>
                    <li>Processing admissions and registrations</li>
                    <li>Communicating regarding school activities and academics</li>
                    <li>Managing fee payments and donations</li>
                    <li>Compliance with Department of Education requirements</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">3. Information Security</h2>
                <p>
                    We take reasonable technical and organizational measures to ensure the security of your personal information and to protect it from unauthorized access, loss, or disclosure.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">4. Third-Party Sharing</h2>
                <p>
                    We do not sell your information. We only share information with third parties (such as educational authorities or payment gateways like Yoco) when necessary for operational purposes or as required by law.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">5. Your Rights</h2>
                <p>
                    According to POPIA, you have the right to:
                </p>
                <ul>
                    <li>Access your personal information held by us</li>
                    <li>Request the correction or deletion of your information</li>
                    <li>Object to the processing of your information</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">6. Contact Us</h2>
                <p>
                    For any questions regarding this policy or your personal information, please contact our Information Officer at <strong>admin@alasr.co.za</strong>.
                </p>

                <p className="mt-12 text-sm text-gray-500">
                    Last updated: January 2026
                </p>
            </div>
        </Section>
    );
}

import { Section } from "@/components/ui/Section";

export default function CookiePolicy() {
    return (
        <Section>
            <div className="max-w-4xl mx-auto prose prose-blue prose-lg">
                <h1 className="text-4xl font-bold mb-8 text-primary">Cookie Policy</h1>

                <p className="lead">
                    This Cookie Policy explains how Al-Asr Educational Institute uses cookies and similar technologies to recognize you when you visit our website.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">What are cookies?</h2>
                <p>
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">How we use cookies</h2>
                <p>
                    We use cookies for the following purposes:
                </p>
                <ul>
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                    <li><strong>Analytics Cookies:</strong> To help us understand how visitors interact with our website.</li>
                    <li><strong>Functional Cookies:</strong> To remember your preferences and settings.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">Managing Cookies</h2>
                <p>
                    You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">Updates to this policy</h2>
                <p>
                    We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.
                </p>

                <p className="mt-12 text-sm text-gray-500">
                    Last updated: January 2026
                </p>
            </div>
        </Section>
    );
}

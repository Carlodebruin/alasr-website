import { Section } from "@/components/ui/Section";

export default function About() {
    return (
        <Section>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-primary">About Al-Asr</h1>

                <div className="prose prose-lg text-foreground/80">
                    <p className="lead text-xl text-foreground mb-8">
                        Al-Asr Educational Institute is dedicated to providing a balanced education that integrates academic excellence with Islamic values. Located in Laudium, Pretoria, we serve the community by nurturing students who are confident, responsible, and spiritually aware.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Our Ethos</h2>
                    <p>
                        Our ethos is rooted in the integration of Islamic and secular education to foster holistic development. We aim to prepare students for success in both this life and the hereafter. Key aspects of our ethos include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-8">
                        <li><strong>Integrated Education:</strong> A dynamic blend of the CAPS curriculum and Islamic studies, including Quran and Arabic.</li>
                        <li><strong>Holistic Development:</strong> Nurturing the spirit, intellect, emotions, physical well-being (Tarbiyyah), and Akhlaaq (good character).</li>
                        <li><strong>Moral Values:</strong> Promoting social, moral, and cultural values to raise future leaders with a strong moral compass.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Accreditation</h2>
                    <p>
                        Al-Asr Educational Institute is fully accredited by <strong>UMALUSI</strong>, the Council for Quality Assurance in General and Further Education and Training. We follow the National Curriculum Statement (CAPS) ensuring our learners meet and exceed national standards.
                    </p>
                </div>
            </div>
        </Section>
    );
}

import { Section } from "@/components/ui/Section";

export default function Projects() {
    return (
        <Section>
            <h1 className="text-4xl font-bold mb-6 text-primary">Our Projects</h1>
            <p className="text-lg text-gray-600 mb-8">
                Discover the initiatives we are undertaking to improve our school and community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface rounded-lg overflow-hidden shadow-sm">
                    <div className="h-48 bg-gray-300 w-full"></div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">Masjid Expansion</h3>
                        <p className="text-gray-600 mb-4">Expanding our prayer facilities to accommodate the growing community.</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-sm text-gray-500">45% Funded</p>
                    </div>
                </div>
                <div className="bg-surface rounded-lg overflow-hidden shadow-sm">
                    <div className="h-48 bg-gray-300 w-full"></div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">New Science Lab</h3>
                        <p className="text-gray-600 mb-4">Equipping our students with state-of-the-art scientific equipment.</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-sm text-gray-500">70% Funded</p>
                    </div>
                </div>
            </div>
        </Section>
    );
}

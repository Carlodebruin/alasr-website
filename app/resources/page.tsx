import { Section } from "@/components/ui/Section";

export default function Resources() {
    return (
        <Section>
            <h1 className="text-4xl font-bold mb-6 text-primary">Resources</h1>
            <p className="text-lg text-gray-600 mb-8">
                Access important documents, newsletters, and educational materials.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for resource items */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Resource Title {i}</h3>
                        <p className="text-gray-500 text-sm mb-4">PDF • 2.4 MB</p>
                        <a href="#" className="text-primary hover:underline font-medium">Download</a>
                    </div>
                ))}
            </div>
        </Section>
    );
}

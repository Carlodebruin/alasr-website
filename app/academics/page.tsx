import { Section } from "@/components/ui/Section";
import { Book, CheckCircle } from "lucide-react";

export default function Academics() {
    return (
        <Section>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-primary">Academic Programme</h1>
                <p className="text-lg text-foreground/80 mb-12">
                    We offer a comprehensive curriculum that combines the National Curriculum Statement (CAPS) with a robust Islamic Studies programme, ensuring our students are well-rounded and prepared for the future.
                </p>

                <div className="space-y-16">
                    {/* Islamic Studies - Prominent Feature */}
                    <div className="bg-surface/30 p-8 rounded-3xl border border-surface shadow-sm">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                            <Book className="mr-3 text-secondary h-6 w-6" />
                            Islamic Studies
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ul className="space-y-3">
                                {[
                                    'Quran Reading (Nazra & Tajweed)',
                                    'Arabic Language',
                                    'Islamic History & Personalities',
                                    'Tadhakkur'
                                ].map((subject) => (
                                    <li key={subject} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-foreground/90 font-medium">{subject}</span>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-3">
                                {[
                                    'Quran Subject Matter',
                                    'Fiqh and Akhlaaq',
                                    'Hifz Programme (Optional)'
                                ].map((subject) => (
                                    <li key={subject} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-foreground/90 font-medium">{subject}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* National Curriculum (CAPS) Sections */}
                    <div>
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <h2 className="text-3xl font-bold text-foreground mb-4">National Curriculum (CAPS)</h2>
                            <p className="text-foreground/70">
                                Our comprehensive secular education follows the South African National Curriculum Statement, covering all key phases of development.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Foundation Phase */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4">
                                    Grades RR–3
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Foundation Phase</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start"><span className="mr-2 text-blue-500">•</span> Home Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-blue-500">•</span> First Additional Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-blue-500">•</span> Mathematics</li>
                                    <li className="flex items-start"><span className="mr-2 text-blue-500">•</span> Life Skills <span className="text-gray-400 text-xs ml-1">(Beginning Knowledge, Arts, PE, Personal Well-being)</span></li>
                                </ul>
                            </div>

                            {/* Intermediate Phase */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
                                    Grades 4–6
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Intermediate Phase</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> Home Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> First Additional Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> Mathematics</li>
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> Natural Sciences and Technology</li>
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> Social Sciences</li>
                                    <li className="flex items-start"><span className="mr-2 text-indigo-500">•</span> Life Skills <span className="text-gray-400 text-xs ml-1">(Creative Arts + PE)</span></li>
                                </ul>
                            </div>

                            {/* Senior Phase */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-4">
                                    Grades 7–9
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Senior Phase</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Home Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> First Additional Language</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Mathematics</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Natural Sciences</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Social Sciences</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Technology</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Economic and Management Sciences (EMS)</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Creative Arts</li>
                                    <li className="flex items-start"><span className="mr-2 text-purple-500">•</span> Life Orientation</li>
                                </ul>
                            </div>

                            {/* FET Phase */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mb-4">
                                    Grades 10–12
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">FET Phase</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Compulsory</p>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-start"><span className="mr-2 text-orange-500">•</span> Home Language</li>
                                            <li className="flex items-start"><span className="mr-2 text-orange-500">•</span> First Additional Language</li>
                                            <li className="flex items-start"><span className="mr-2 text-orange-500">•</span> Mathematics <em className="text-gray-400 normal-case mx-1">or</em> Mathematical Literacy</li>
                                            <li className="flex items-start"><span className="mr-2 text-orange-500">•</span> Life Orientation</li>
                                        </ul>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Electives (Choose 3)</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Physical Sciences, History, Geography, Accounting, Life Sciences, Business Studies, Tourism, etc.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}

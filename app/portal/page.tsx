import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function Portal() {
    return (
        <Section className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary">Parent Portal</h1>
                    <p className="text-gray-600 mt-2">Please log in to access your child&apos;s reports and fee statements.</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <Button type="button" fullWidth disabled>
                        Login (Coming Soon)
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <a href="#" className="text-sm text-primary hover:underline">Forgot your password?</a>
                </div>
            </div>
        </Section>
    );
}

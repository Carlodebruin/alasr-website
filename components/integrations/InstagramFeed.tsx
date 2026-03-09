import { Instagram } from "lucide-react";
import { siteConfig } from "@/config/site";

export const InstagramFeed = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                    <Instagram className="mr-2 h-6 w-6 text-pink-600" />
                    Follow us on Instagram
                </h3>
            </div>

            <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="block bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl p-0.5 group overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
                <div className="bg-white rounded-[10px] p-6 flex flex-col items-center text-center h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-orange-50 opacity-50" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[3px] mb-4 group-hover:scale-105 transition-transform">
                            <div className="bg-white w-full h-full rounded-full p-1">
                                {/* Use logo as avatar since we don't have a live profile pic URL */}
                                <img src="/images/logo-dark.png" alt="Profile" className="w-full h-full object-contain rounded-full bg-gray-50" />
                            </div>
                        </div>

                        <h4 className="font-bold text-lg text-gray-900 mb-1">{siteConfig.instagramHandle}</h4>
                        <p className="text-sm text-gray-500 mb-6">Al-Asr Educational Institute</p>

                        <div className="flex gap-8 mb-6 text-center">
                            <div>
                                <span className="block font-bold text-gray-900">254</span>
                                <span className="text-xs text-gray-500">Posts</span>
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">990</span>
                                <span className="text-xs text-gray-500">Followers</span>
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">81</span>
                                <span className="text-xs text-gray-500">Following</span>
                            </div>
                        </div>

                        <span className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full opacity-90 group-hover:opacity-100 transition-opacity">
                            <Instagram className="w-4 h-4 mr-2" />
                            Follow Profile
                        </span>
                    </div>
                </div>
            </a>
        </div>
    );
};

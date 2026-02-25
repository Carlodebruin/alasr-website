"use client";

import { Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";

interface Video {
    id: string;
    title: string;
    thumbnail: string;
}

export const YouTubeGrid = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const CHANNEL_ID = "UCdv01sZQCL34l0n6HBQTBlQ";
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data.items) {
                    const formattedVideos = data.items.slice(0, 10).map((item: any) => ({
                        id: item.guid.split(":")[2], // Extract video ID from "yt:video:VIDEO_ID"
                        title: item.title,
                        thumbnail: `https://i.ytimg.com/vi/${item.guid.split(":")[2]}/mqdefault.jpg`
                    }));
                    setVideos(formattedVideos);
                } else {
                    setVideos([]);
                }
            } catch (error) {
                console.error("Error fetching YouTube videos:", error);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                    <Youtube className="mr-2 h-6 w-6 text-red-600" />
                    Latest Videos
                </h3>
            </div>

            <div className="relative group">
                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {loading ? (
                        // Loading skeletons
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-shrink-0 w-[280px] md:w-[350px] space-y-3 animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-xl"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((video) => (
                            <div
                                key={video.id}
                                className="flex-shrink-0 w-[280px] md:w-[350px] space-y-3 snap-start group/video"
                            >
                                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-lg group-hover/video:shadow-xl transition-all border border-gray-100">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.id}`}
                                        title={video.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                                <h4 className="font-medium text-gray-900 line-clamp-2 leading-snug text-sm md:text-base px-1">
                                    {video.title}
                                </h4>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Youtube className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Check out our YouTube channel for the latest updates.</p>
                            <a href={siteConfig.youtubeChannelUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block font-medium">
                                Go to Channel
                            </a>
                        </div>
                    )}
                </div>

                {/* Optional: Visual hint of more content on the right */}
                <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-white/80 to-transparent pointer-events-none rounded-r-xl hidden md:block"></div>
            </div>

            <div className="flex justify-center md:hidden">
                <p className="text-xs text-gray-400 flex items-center">
                    <span className="w-4 h-0.5 bg-gray-200 mr-2"></span>
                    Swipe to see more
                    <span className="w-4 h-0.5 bg-gray-200 ml-2"></span>
                </p>
            </div>
        </div>
    );
};

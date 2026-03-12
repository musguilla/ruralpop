"use client";

import { useEffect } from "react";

export function ListingDetailAd() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className="mt-8 flex justify-center overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '360px', height: '800px' }}
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="2843527705"
            ></ins>
        </div>
    );
}

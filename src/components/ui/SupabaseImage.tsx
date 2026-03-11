"use client";

import Image, { ImageProps } from "next/image";
import supabaseLoader from "@/utils/supabase-image-loader";

export default function SupabaseImage(props: ImageProps) {
    return <Image loader={supabaseLoader} {...props} />;
}

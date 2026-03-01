import React from "react";
import { Metadata } from "next";
import { MAGAZINE_POSTS } from "@/content/magazine/posts";

export const metadata: Metadata = {
    title: "Ruralpop Magazine | La conexión rural",
    description: "Noticias, guías legales, historias y toda la actualidad del mundo rural, agricultura y ganadería.",
};

import { MagazineClient } from "./MagazineClient";

export default function MagazinePage() {
    return <MagazineClient posts={MAGAZINE_POSTS} />;
}

"use client";

import React, { createContext, useContext } from "react";
import type { CategoryData } from "@/utils/categoriesFetcher";

const CategoriesContext = createContext<CategoryData[]>([]);

export function CategoriesProvider({ children, categories }: { children: React.ReactNode; categories: CategoryData[] }) {
    return (
        <CategoriesContext.Provider value={categories}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    return useContext(CategoriesContext);
}

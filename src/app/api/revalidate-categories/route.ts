import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
    revalidateTag('categories-v6');
    revalidateTag('categories-v6-ruralpop');
    revalidateTag('categories-v6-ruralpop-es');
    return NextResponse.json({ revalidated: true });
}

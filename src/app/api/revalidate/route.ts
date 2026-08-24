import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
    // @ts-ignore - ignore the expected 2 arguments in next 15
    revalidateTag('categories-v6');
    // @ts-ignore
    revalidateTag('categories-v6-ruralpop');
    // @ts-ignore
    revalidateTag('categories-v6-ruralpop-es');
    return NextResponse.json({ revalidated: true });
}

import { NextResponse } from 'next/server';

export async function GET() {
    const data = {
        applinks: {
            apps: [],
            details: [
                {
                    appID: "19145009455.com.ruralpop.ruralpopapp",
                    paths: ["*"]
                }
            ]
        }
    };

    return new NextResponse(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

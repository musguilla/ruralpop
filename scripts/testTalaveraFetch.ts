async function run() {
    const urlsToTest = [
        `https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260902.pdf`
    ];
    for (const url of urlsToTest) {
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const contentType = response.headers.get('content-type');
            console.log("Status:", response.status, "Content-Type:", contentType);
            if (response.ok && contentType?.includes('application/pdf')) {
                const pdfBuffer = await response.arrayBuffer();
                console.log("Got buffer of length", pdfBuffer.byteLength);
            } else {
                console.log("Not a PDF or not OK");
            }
        } catch (fetchErr) {
            console.error("Fetch error:", fetchErr);
        }
    }
}
run();

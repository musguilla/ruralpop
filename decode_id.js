const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_BIGINT = BigInt(62);

function decodeId(shortId) {
    let num = BigInt(0);
    for (let i = 0; i < shortId.length; i++) {
        const char = shortId[i];
        const val = BASE62_CHARS.indexOf(char);
        if (val === -1) throw new Error("Invalid base62 character");
        num = num * BASE62_BIGINT + BigInt(val);
    }

    let hex = num.toString(16).padStart(32, "0");
    const uuid = [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20)
    ].join("-");
    
    return uuid;
}

console.log("Decoded:", decodeId("4mUCINQfy1Vp98eTwtpsPx"));

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: 'sk-ant-api03-fakestring123' });
async function test() {
    try {
        await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
    } catch(e) {
        console.log(e.status, e.error);
    }
}
test();

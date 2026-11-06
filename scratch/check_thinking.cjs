const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/krish/.gemini/antigravity/brain/09e6892a-2bcb-4bf3-b968-20c17f83158c/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const step = parseInt(line.match(/"step_index":(\d+)/)?.[1] || 0);
    if (step >= 11015 && step <= 11027) {
      const obj = JSON.parse(line);
      console.log(`--- STEP ${step} (${obj.source} - ${obj.type}) ---`);
      if (obj.tool_calls) console.log('TOOL CALLS:', JSON.stringify(obj.tool_calls));
      if (obj.content) console.log('CONTENT:', obj.content.substring(0, 300));
    }
  }
}
processLineByLine();

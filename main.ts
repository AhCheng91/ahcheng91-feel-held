import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const entryPath = fileURLToPath(new URL('./entry.txt', import.meta.url));

async function readEntry(): Promise<string> {
  const bytes = await readFile(entryPath);
  const text = bytes.toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(bytes)) {
    throw new Error('entry.txt is not valid UTF-8');
  }
  return text;
}

async function writeEntry(text: string): Promise<string> {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'entry.txt');
  await writeFile(outputPath, Buffer.from(text, 'utf8'));
  return outputPath;
}

function checkEntry(text: string): string | null {
  const codePoints = [...text].length;
  if (codePoints < 1 || codePoints > 280) {
    return `entry must be 1 to 280 code points, got ${codePoints}`;
  }
  if (text.trim().length === 0) {
    return 'entry must not be only white space';
  }
  return null;
}

async function main(): Promise<void> {
  const text = await readEntry();
  await writeEntry(text);

  const codePoints = [...text].length;
  const bytes = Buffer.byteLength(text, 'utf8');
  console.log(`entry: ${codePoints} code points, ${bytes} bytes`);

  const problem = checkEntry(text);
  if (problem !== null) {
    console.error(`entry check failed: ${problem}`);
    process.exitCode = 1;
  }
}

await main();
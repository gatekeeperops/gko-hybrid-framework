/**
 * generate-schemas.ts
 * Hits a live API endpoint and generates a Zod schema from the response shape.
 * Usage: npx tsx scripts/generate-schemas.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || '';
const TEST_USERNAME = process.env.TEST_USERNAME || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

function inferZodType(value: unknown, depth = 0): string {
  if (value === null) return 'z.null()';
  if (value === undefined) return 'z.undefined()';
  if (typeof value === 'boolean') return 'z.boolean()';
  if (typeof value === 'number') return 'z.number()';
  if (typeof value === 'string') return 'z.string()';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())';
    return `z.array(${inferZodType(value[0], depth)})`;
  }
  if (typeof value === 'object') {
    const indent = '  '.repeat(depth + 1);
    const closing = '  '.repeat(depth);
    const fields = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${indent}${k}: ${inferZodType(v, depth + 1)}`)
      .join(',\n');
    return `z.object({\n${fields}\n${closing}})`;
  }
  return 'z.unknown()';
}

async function getToken(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function generateSchema(
  endpointPath: string,
  schemaName: string,
  token?: string
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpointPath}`, { headers });
  const data = await res.json();

  const sample = Array.isArray(data)
    ? (data as unknown[])[0]
    : (data as Record<string, unknown>).data
      ? ((data as Record<string, unknown>).data as unknown[])[0]
      : data;

  const zodSchema = inferZodType(sample);
  const output = `import { z } from 'zod';\n\nexport const ${schemaName} = ${zodSchema};\n\nexport type ${schemaName.replace('Schema', '')} = z.infer<typeof ${schemaName}>;\n`;

  const outPath = path.join(process.cwd(), 'src', 'schemas', `${schemaName}.generated.ts`);
  fs.writeFileSync(outPath, output, 'utf8');
  console.log(`Generated: ${outPath}`);
}

async function main(): Promise<void> {
  console.log('Generating schemas from live API...');
  const token = await getToken();
  await generateSchema('/products', 'ProductSchema', token);
  await generateSchema('/users/me', 'UserSchema', token);
  console.log('Done.');
}

main().catch(console.error);
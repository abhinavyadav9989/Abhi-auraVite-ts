## Integrations API

Source: `src/api/integrationAdapters.ts`, re-exported via `src/api/integrations.ts`.

### Overview
- **Core**: Singleton providing integration methods.
- **InvokeLLM(promptOrOptions, options?)**: Calls Supabase Edge Function `invoke-llm`, falls back to mocked responses in dev.
- **SendEmail(to, subject, body, options?)**: Calls `send-email` edge function.
- **UploadFile({ file, path?, options? })**: Uploads to Supabase Storage bucket `uploads`, returns `{ url, path, size, name }`.
- **GenerateImage(prompt, options?)**: Calls `generate-image` edge function.
- **ExtractDataFromUploadedFile(fileUrl, options?)**: Calls `extract-data` edge function.

### Setup
- Configure `.env` variables for Supabase. See `src/api/supabaseClient.ts`.

### Examples
- Invoke LLM:
```ts
import { InvokeLLM } from '@/api/integrations';

const result = await InvokeLLM('Suggest a price range for 2016 Honda Civic');
console.log(result);
```

- Send Email:
```ts
import { SendEmail } from '@/api/integrations';

await SendEmail('user@example.com', 'Welcome', 'Thanks for joining!', { templateId: 'welcome' });
```

- Upload File:
```ts
import { UploadFile } from '@/api/integrations';

const fileInput = document.querySelector('input[type=file]')!;
const file = fileInput.files![0];
const uploaded = await UploadFile({ file });
console.log(uploaded.url);
```

- Generate Image:
```ts
import { GenerateImage } from '@/api/integrations';

const img = await GenerateImage('a blue electric SUV on a mountain road');
```

- Extract Data:
```ts
import { ExtractDataFromUploadedFile } from '@/api/integrations';

const res = await ExtractDataFromUploadedFile('https://.../invoice.pdf');
```

### Error Handling
- All methods throw on network errors. Wrap calls in try/catch in UI code.

### Notes
- Uploads require the `uploads` storage bucket; it is auto-created if missing.
- Edge functions may not be configured in local dev; methods return sensible fallbacks where possible.
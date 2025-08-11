// Import from Supabase integration adapters instead of Base44
import {
  Core,
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
} from './integrationAdapters';

// Re-export all integrations to maintain the same interface
export {
  Core,
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
};







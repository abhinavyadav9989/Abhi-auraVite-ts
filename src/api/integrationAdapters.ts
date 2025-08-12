import { supabase } from './supabaseClient';

// Core integrations adapter
class CoreAdapter {
  // File upload using Supabase Storage
  async UploadFile({ file, path, options = {} }) {
    try {
      // Do not attempt to create/list buckets from client (RLS will block). Assume bucket exists.
      await this.ensureStorageBucket();
      
      // Generate default path if not provided
      const filePath = path || `uploads/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, options);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        file_url: urlData.publicUrl, // many callers expect file_url
        path: filePath,
        size: file.size,
        name: file.name
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // LLM integration using Supabase Edge Functions
  async InvokeLLM(promptOrOptions: string | any, options?: any) {
    try {
      // Handle both string and object parameters
      let prompt = '';
      let requestOptions = options;
      
      if (typeof promptOrOptions === 'string') {
        prompt = promptOrOptions;
      } else if (typeof promptOrOptions === 'object') {
        prompt = promptOrOptions.prompt || '';
        requestOptions = { ...promptOrOptions, ...options };
      }
      
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt, options: requestOptions }
      });
      
      if (error) {
        console.warn('Edge function invoke-llm not available, using mock response:', error);
        // Return mock data for development
        return this.getMockLLMResponse(prompt, requestOptions);
      }
      
      return data;
    } catch (error) {
      console.warn('Edge function invoke-llm failed, using mock response:', error);
      // Return mock data for development
      return this.getMockLLMResponse(
        typeof promptOrOptions === 'string' ? promptOrOptions : promptOrOptions.prompt || '',
        options
      );
    }
  }

  // Mock LLM response for development
  getMockLLMResponse(prompt: string, options?: any) {
    // Ensure prompt is a string
    const promptStr = typeof prompt === 'string' ? prompt : '';
    
    // Check if prompt contains vehicle registration analysis
    if (promptStr.includes('registration number') || promptStr.includes('vehicle')) {
      return {
        make: 'Honda',
        model: 'Civic',
        variant: 'Type R',
        year: 2016,
        fuel_type: 'petrol',
        transmission: 'manual',
        suggested_categories: ['sedan', 'sports']
      };
    }
    
    // Check if prompt contains price suggestion
    if (promptStr.includes('price') || promptStr.includes('suggest')) {
      return {
        min_price: 500000,
        max_price: 800000,
        median_price: 650000,
        confidence: 'medium',
        reasoning: 'Based on current market conditions and vehicle specifications'
      };
    }
    
    // Check if prompt contains market insights
    if (promptStr.includes('market') || promptStr.includes('insights')) {
      return {
        insights: [
          {
            title: 'Market Trend',
            description: 'SUV demand is increasing in the current market',
            action: 'Consider adding more SUVs',
            filterKey: 'category',
            filterValue: 'suv',
            urgency: 'medium'
          }
        ]
      };
    }
    
    // Default mock response
    return {
      result: 'Mock LLM response - Edge function not configured',
      data: {}
    };
  }

  // Email integration using Supabase Edge Functions
  async SendEmail(to: string, subject: string, body: string, options?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body, options }
      });
      
      if (error) {
        console.warn('Edge function send-email not available:', error);
        return { success: false, error: 'Email service not configured' };
      }
      
      return data;
    } catch (error) {
      console.warn('Edge function send-email failed:', error);
      return { success: false, error: 'Email service not configured' };
    }
  }

  // Ensure storage bucket exists
  async ensureStorageBucket() {
    // No-op on client: listing/creating buckets requires service role. Make sure
    // an 'uploads' bucket exists via Supabase Dashboard or SQL migration.
    return;
  }

  // Image generation using Supabase Edge Functions
  async GenerateImage(prompt: string, options?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, options }
      });
      
      if (error) {
        console.warn('Edge function generate-image not available:', error);
        return { url: null, error: 'Image generation service not configured' };
      }
      
      return data;
    } catch (error) {
      console.warn('Edge function generate-image failed:', error);
      return { url: null, error: 'Image generation service not configured' };
    }
  }

  // Data extraction using Supabase Edge Functions
  async ExtractDataFromUploadedFile(fileUrl: string, options?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('extract-data', {
        body: { fileUrl, options }
      });
      
      if (error) {
        console.warn('Edge function extract-data not available:', error);
        return { extractedData: {}, error: 'Data extraction service not configured' };
      }
      
      return data;
    } catch (error) {
      console.warn('Edge function extract-data failed:', error);
      return { extractedData: {}, error: 'Data extraction service not configured' };
    }
  }
}

// Create singleton instance
const Core = new CoreAdapter();

// Individual exports for backward compatibility
export const InvokeLLM = Core.InvokeLLM.bind(Core);
export const SendEmail = Core.SendEmail.bind(Core);
export const UploadFile = Core.UploadFile.bind(Core);
export const GenerateImage = Core.GenerateImage.bind(Core);
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile.bind(Core);

export { Core };

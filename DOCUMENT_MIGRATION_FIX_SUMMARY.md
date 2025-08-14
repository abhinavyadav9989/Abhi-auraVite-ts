# 📄 Document Migration & Profile Data Fix

## 📋 Issues Identified

### **1. Documents Not Stored in Database**
**Problem**: Documents uploaded during onboarding were being saved to the `onboarding_progress` JSONB field, but not to the `dealer_documents` table.

**Root Cause**: The onboarding process was storing document data in the onboarding progress, but the Profile component was looking for documents in the `dealer_documents` table.

### **2. Profile Data Not Fetched from Database**
**Problem**: After completing onboarding, the profile section wasn't displaying uploaded documents and some filled details.

**Root Cause**: Data was stored in onboarding progress but not properly migrated to the main dealer tables.

## 🔧 Solutions Applied

### **1. Onboarding Completion Document Migration**

**File**: `src/components/onboarding/OnboardingWizard.tsx`

Added automatic document migration during onboarding completion:

```typescript
// Function to migrate documents from onboarding progress to dealer_documents table
const migrateDocumentsToDealerDocuments = async (dealerId: string, data: OnboardingData) => {
  // Migrate KYB documents
  if (data.kybDocuments) {
    for (const [docType, docData] of Object.entries(data.kybDocuments)) {
      if (docData && typeof docData === 'object' && docData.url) {
        await DealerDocument.create({
          dealer_id: dealerId,
          document_type: docType,
          file_url: docData.url,
          file_name: docData.fileName || 'Uploaded Document',
          file_size: docData.fileSize || 0,
          file_type: docData.fileType || 'application/octet-stream',
          status: 'pending',
          uploaded_at: docData.uploadedAt || new Date().toISOString()
        });
      }
    }
  }
  
  // Migrate bank details document (cancelled cheque)
  if (data.bankDetails?.cancelledCheque) {
    await DealerDocument.create({
      dealer_id: dealerId,
      document_type: 'cancelled_cheque',
      file_url: data.bankDetails.cancelledCheque.url,
      file_name: data.bankDetails.cancelledCheque.fileName || 'Cancelled Cheque',
      file_size: data.bankDetails.cancelledCheque.fileSize || 0,
      file_type: data.bankDetails.cancelledCheque.fileType || 'application/octet-stream',
      status: 'pending',
      uploaded_at: data.bankDetails.cancelledCheque.uploadedAt || new Date().toISOString()
    });
  }
};
```

### **2. Profile Component Auto-Migration**

**File**: `src/pages/Profile.tsx`

Enhanced the `loadDocuments` function to automatically migrate documents if they're not found in the `dealer_documents` table:

```typescript
const loadDocuments = async (dealerId) => {
  const docs = await DealerDocument.filter({ dealer_id: dealerId });
  
  // If no documents found, check onboarding progress and migrate
  if (!docs || docs.length === 0) {
    const dealerData = await Dealer.get(dealerId);
    const onboardingData = dealerData.onboarding_progress || {};
    
    if (onboardingData.kybDocuments || onboardingData.bankDetails) {
      // Migrate documents from onboarding progress
      // ... migration logic
    }
  }
};
```

### **3. Database Migration Script**

**File**: `MIGRATE_EXISTING_DOCUMENTS.sql`

Created a comprehensive SQL script to migrate existing documents for users who completed onboarding before the fix:

```sql
-- Migrate documents for all dealers who completed onboarding
DO $$
DECLARE
    dealer_record RECORD;
    result TEXT;
BEGIN
    FOR dealer_record IN 
        SELECT id, email, name 
        FROM dealers 
        WHERE onboarding_completed = true 
        AND (onboarding_progress->'kybDocuments' IS NOT NULL OR onboarding_progress->'bankDetails' IS NOT NULL)
    LOOP
        result := migrate_dealer_documents(dealer_record.id);
        RAISE NOTICE 'Dealer % (%): %', dealer_record.name, dealer_record.email, result;
    END LOOP;
END $$;
```

## 🎯 **Expected Behavior After Fix**

### **For New Users:**
1. ✅ **Documents automatically migrated** during onboarding completion
2. ✅ **Profile displays uploaded documents** immediately after onboarding
3. ✅ **All form data properly stored** in dealer table fields
4. ✅ **Bank details saved** to `bank_details` table

### **For Existing Users:**
1. ✅ **Documents automatically migrated** when visiting profile
2. ✅ **Database migration script** handles bulk migration
3. ✅ **No data loss** during migration process
4. ✅ **Backward compatibility** maintained

## 🧪 **Testing Steps**

### **1. Test New User Onboarding**
1. Complete the onboarding process with document uploads
2. Verify documents appear in profile immediately
3. Check that all form data is properly displayed

### **2. Test Existing User Migration**
1. Run the `MIGRATE_EXISTING_DOCUMENTS.sql` script
2. Visit profile page for existing users
3. Verify documents are automatically migrated and displayed

### **3. Test Document Types**
1. Verify KYB documents (Trade License, GST Certificate, PAN Card, Address Proof)
2. Verify bank documents (Cancelled Cheque)
3. Check document status and metadata

## 📊 **Technical Details**

### **Document Types Handled:**
- `trade_licence` - Trade License
- `gst_certificate` - GST Certificate  
- `pan_card` - PAN Card
- `address_proof` - Address Proof
- `bank_statement` - Bank Statement
- `cancelled_cheque` - Cancelled Cheque
- `other` - Other Documents

### **Data Migration Flow:**
1. **Onboarding Progress** → **dealer_documents table**
2. **Onboarding Progress** → **dealer table fields**
3. **Bank Details** → **bank_details table**

### **Error Handling:**
- Graceful fallback if migration fails
- No data loss during migration
- Comprehensive logging for debugging

## 🛠️ **Deployment Steps**

### **1. Database Migration**
```bash
# Run in Supabase SQL Editor
\i MIGRATE_EXISTING_DOCUMENTS.sql
```

### **2. Application Updates**
- Deploy updated `OnboardingWizard.tsx`
- Deploy updated `Profile.tsx`
- Clear browser cache for affected users

### **3. Verification**
- Test with new user onboarding
- Test with existing user profile access
- Monitor console logs for migration status

## 🔄 **Monitoring**

After deployment, monitor:
- Console logs for document migration status
- Database for successful document creation
- Profile page document display
- Error rates in document uploads

## 📝 **Notes**

- **Backward compatible** - existing data is preserved
- **Automatic migration** - no manual intervention required
- **Defensive programming** - handles edge cases gracefully
- **Comprehensive logging** - easy debugging and monitoring
- **No performance impact** - migration only runs when needed

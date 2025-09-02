# Vehicle Adding Flow - User Guide

## Overview

The Vehicle Adding Flow is a comprehensive, step-by-step wizard that helps dealers add vehicles to their inventory quickly and accurately. The system features intelligent auto-fill capabilities, validation, and a user-friendly interface designed for both Basic and Advanced tier users.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Step-by-Step Guide](#step-by-step-guide)
3. [Auto-Fill Features](#auto-fill-features)
4. [Validation & Error Handling](#validation--error-handling)
5. [Tier-Specific Features](#tier-specific-features)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [FAQ](#faq)

## Getting Started

### Prerequisites

- **Account Setup**: Ensure your dealer account is properly set up and verified
- **Branch Creation**: At least one branch must be created before adding vehicles
- **Tier Verification**: Confirm your current tier (Basic or Advanced) and its limits

### Accessing the Vehicle Adding Flow

1. Navigate to your **Dashboard**
2. Click on **"Add Vehicle"** button
3. Or go to **Inventory** → **"Add New Vehicle"**

## Step-by-Step Guide

### Step 0: Branch Selection

**Purpose**: Select the branch where the vehicle will be listed

**What you'll see**:
- List of your existing branches
- Branch details (location, contact info)
- Option to create a new branch (if within tier limits)

**Actions**:
1. Select an existing branch from the dropdown
2. Or click **"Create New Branch"** if needed
3. Click **"Continue"** to proceed

**Tier Limits**:
- **Basic**: Maximum 2 branches
- **Advanced**: Unlimited branches

### Step 1: Identify Vehicle

**Purpose**: Identify the vehicle using registration number, VIN, or manual entry

**Options**:

#### A. Registration Number (Recommended)
- Enter the vehicle's registration number (e.g., MH12AB1234)
- System will auto-fill vehicle details from RTO database
- **Auto-fill**: Make, Model, Variant, Year, Fuel Type, Transmission, etc.

#### B. VIN (Vehicle Identification Number)
- Enter the 17-character VIN
- System will decode VIN to extract vehicle specifications
- **Auto-fill**: Manufacturer, Model, Year, Body Style, Engine Type, etc.

#### C. Manual Entry
- Select Make, Model, Variant, and Year manually
- Use searchable dropdowns for quick selection

**Auto-Filled Data Display**:
- Shows all auto-filled fields with source attribution
- Click **"Edit"** next to any field to modify
- Confidence indicators show data reliability

### Step 2: Core Specifications

**Purpose**: Enter essential vehicle specifications

**Required Fields**:
- **Fuel Type**: Petrol, Diesel, CNG, LPG, Electric, Hybrid
- **Transmission**: Manual, Automatic, AMT, CVT
- **Body Type**: Sedan, Hatchback, SUV, MUV, etc.
- **Color**: Vehicle color
- **Odometer**: Current kilometers driven
- **Number of Owners**: 1st, 2nd, 3rd+

**Advanced Specifications** (Advanced tier only):
- Engine Capacity
- Power/Torque
- Drivetrain
- Dimensions
- Safety Features
- Infotainment
- Emission Norm

### Step 3: Condition Assessment

**Purpose**: Assess vehicle condition and history

**Basic Assessment**:
- **Tyres OK?**: Yes/No toggle
- **Paint OK?**: Yes/No toggle
- **Accident History**: Yes/No toggle
- **Service History**: Yes/No toggle

**Condition Notes**:
- Add detailed notes for any "No" responses
- Describe issues, repairs, or maintenance history

**Advanced Inspection** (Advanced tier only):
- Inspection checklist reference
- OBD codes
- Brake pad percentage
- Tyre tread measurements
- Paint meter readings

### Step 4: Documents

**Purpose**: Upload and verify vehicle documents

**Document Types**:
- **RC (Registration Certificate)**
- **Insurance Certificate**
- **PUC Certificate**
- **Service Book**
- **Invoice**

**Upload Process**:
1. Drag and drop files or click to browse
2. Supported formats: JPG, PNG, PDF (max 10MB)
3. System will process documents using OCR
4. Auto-extract relevant information

**Document Status**:
- **RC Available**: Yes/No
- **Insurance**: Active/Expired + Validity date
- **PUC Valid Until**: Date picker
- **Service Records**: Yes/No

**OCR Auto-Fill** (Advanced tier):
- Automatically extracts registration number, owner name, etc.
- Shows confidence scores for extracted data
- Allows manual correction of extracted information

### Step 5: Photos & Videos

**Purpose**: Upload vehicle photos and videos

**Photo Requirements**:
- **Minimum**: 1 photo
- **Maximum**: 10 photos (Basic), 50 photos (Advanced)
- **Formats**: JPG, PNG, WebP
- **Size**: Max 10MB per photo

**Photo Tips**:
- **Exterior**: Front, back, sides, angles
- **Interior**: Dashboard, seats, features
- **Odometer**: Clear reading of kilometers
- **Engine Bay**: Engine condition
- **Wheels**: Tyre condition

**Advanced Features** (Advanced tier):
- **360° Spin**: Upload 360-degree view
- **Videos**: Upload video walkthroughs
- **AI Enhancement**: Clean background option

**Photo Management**:
- Drag to reorder photos
- First photo becomes the cover image
- Click to set as cover image

### Step 6: Pricing & Exposure

**Purpose**: Set pricing and exposure settings

**Stock Type**:
- **Owned**: You own the vehicle
- **Consignment**: Selling on behalf of owner

**Pricing Structure**:

#### Internal Costs (Private)
- **Base Cost**: Your purchase cost (optional)
- **Dealer Margin Target**: Target profit amount or percentage
- **Dealer Net**: Automatically calculated

#### Customer-Facing Pricing
- **Shown Price**: What customers see (required for public listings)
- **Dealer Price**: B2B price for verified dealers (optional)

**Exposure Modes**:
- **Retail (Public)**: Customers see shown price
- **B2B (Dealer-only)**: Only verified dealers see dealer price
- **Masked**: No price shown, contact required

**Market Analysis** (Advanced tier):
- Comparable vehicle analysis
- Price band suggestions
- Market trend indicators

### Step 7: Publish Settings

**Purpose**: Configure publishing options

**Publish Scope**:
- **Branch Only**: Visible only within your branch
- **Organization**: Visible across all your branches
- **Marketplace**: Public listing on marketplace

**Scheduling**:
- **Publish Now**: Immediate publication
- **Schedule**: Set future publication date
- **Draft**: Save without publishing

**Advanced Settings** (Advanced tier):
- **SEO Optimization**: Keywords and descriptions
- **Social Media**: Auto-share to social platforms
- **Lead Management**: Lead capture settings

### Step 8: Review & Publish

**Purpose**: Final review before publishing

**Review Sections**:
- **Vehicle Summary**: All entered details
- **Publishing Settings**: Where and how it will be published
- **Private Information**: Internal costs and margins (collapsible)
- **Validation Status**: Any remaining issues

**Actions**:
- **Save Draft**: Save without publishing
- **Publish to Branch**: Publish to selected branch
- **Publish to Organization**: Publish across all branches
- **Publish to Marketplace**: Public marketplace listing

## Auto-Fill Features

### Registration Number Auto-Fill

**How it works**:
1. Enter registration number
2. System queries RTO database
3. Auto-fills vehicle specifications
4. Shows confidence level and source

**Data extracted**:
- Make, Model, Variant
- Manufacturing Year
- Fuel Type, Transmission
- Engine Capacity, Seating
- Owner Name, Registration Date
- Insurance Status, PUC Status

**Fallback**: If RTO API fails, system uses LLM-based extraction

### VIN Decoding

**How it works**:
1. Enter 17-character VIN
2. System decodes VIN structure
3. Extracts manufacturer and specifications
4. Validates check digit

**Data extracted**:
- Manufacturer and Country
- Model and Year
- Body Style and Engine Type
- Plant Code and Serial Number

### Document OCR

**How it works**:
1. Upload document image
2. System processes with OCR
3. Extracts relevant information
4. Shows confidence scores

**Document types supported**:
- RC (Registration Certificate)
- Insurance Certificate
- PUC Certificate
- Service Book
- Invoice

### Multi-Source Auto-Fill

**How it works**:
1. Provide multiple sources (reg number + VIN + documents)
2. System processes all sources
3. Merges results intelligently
4. Shows combined confidence

**Benefits**:
- Higher accuracy through multiple sources
- Redundant data validation
- Comprehensive information extraction

## Validation & Error Handling

### Real-Time Validation

**Field-level validation**:
- Required field indicators
- Format validation (registration number, VIN)
- Range validation (year, price, kilometers)

**Step-level validation**:
- Ensures all required fields are completed
- Shows validation status for each step
- Prevents progression with critical errors

### Error Types

**Errors** (Must be fixed):
- Invalid registration number format
- Missing required fields
- Out-of-range values

**Warnings** (Should be reviewed):
- Unusual price compared to market
- Missing optional documents
- Low confidence auto-fill data

**Info** (Helpful suggestions):
- Recommended photo angles
- Market price suggestions
- Document upload tips

### Error Recovery

**Network Errors**:
- Automatic retry mechanism
- Offline mode support
- Sync when connection restored

**Auto-Fill Failures**:
- Manual entry fallback
- Alternative data sources
- Clear error messages with suggestions

**Validation Errors**:
- Inline error messages
- Step-by-step guidance
- Contextual help text

## Tier-Specific Features

### Basic Tier

**Limits**:
- Maximum 2 branches
- Maximum 10 photos per vehicle
- Maximum 200 vehicles in bulk upload
- Default exposure: Masked

**Features**:
- Basic auto-fill (RTO + LLM fallback)
- Standard validation
- Basic photo upload
- Simple pricing structure

### Advanced Tier

**Limits**:
- Unlimited branches
- Maximum 50 photos per vehicle
- Unlimited bulk uploads
- All exposure modes available

**Features**:
- Full auto-fill (RTO + VIN + OCR + LLM)
- Advanced validation and analytics
- AI photo enhancement
- Market analysis and pricing suggestions
- Advanced publishing options

## Troubleshooting

### Common Issues

**"Registration number not found"**
- Verify the registration number format
- Check if the vehicle is registered in the RTO database
- Try manual entry as fallback

**"VIN decode failed"**
- Ensure VIN is exactly 17 characters
- Check for invalid characters (I, O, Q)
- Verify check digit calculation

**"Document upload failed"**
- Check file size (max 10MB)
- Verify file format (JPG, PNG, PDF)
- Ensure stable internet connection

**"Auto-fill not working"**
- Check internet connection
- Try refreshing the page
- Use manual entry as alternative

### Performance Issues

**Slow loading**:
- Clear browser cache
- Check internet speed
- Close other browser tabs

**Auto-save not working**:
- Check browser storage permissions
- Ensure stable internet connection
- Try manual save

### Data Issues

**Incorrect auto-fill data**:
- Click "Edit" to correct individual fields
- Use manual entry for critical fields
- Report issues for system improvement

**Validation errors**:
- Review error messages carefully
- Check field requirements
- Use help text for guidance

## Best Practices

### Data Entry

**Registration Numbers**:
- Use exact format: XX00XX0000
- Include all characters and numbers
- Verify with RC document

**VIN Numbers**:
- Enter exactly 17 characters
- Double-check for typos
- Verify with vehicle documentation

**Photos**:
- Use good lighting
- Include all angles
- Show any damage clearly
- Keep file sizes reasonable

### Auto-Fill Usage

**Multiple Sources**:
- Provide registration number when available
- Include VIN for additional verification
- Upload relevant documents

**Data Verification**:
- Review all auto-filled data
- Correct any obvious errors
- Verify critical information manually

### Pricing Strategy

**Market Research**:
- Check comparable vehicles
- Consider market trends
- Factor in condition and features

**Margin Management**:
- Set realistic profit targets
- Consider all costs (purchase, repairs, marketing)
- Monitor market competition

### Document Management

**Quality**:
- Use clear, well-lit photos
- Ensure all text is readable
- Include all relevant pages

**Organization**:
- Use descriptive file names
- Group related documents
- Keep backups of important files

## FAQ

### General Questions

**Q: How long does it take to add a vehicle?**
A: With auto-fill, it typically takes 5-10 minutes. Manual entry may take 15-20 minutes.

**Q: Can I save my progress?**
A: Yes, the system auto-saves as you type. You can also manually save drafts.

**Q: Can I edit a vehicle after publishing?**
A: Yes, you can edit published vehicles from your inventory page.

**Q: What if I make a mistake?**
A: You can edit any field before publishing. After publishing, you can still edit from inventory.

### Auto-Fill Questions

**Q: How accurate is the auto-fill?**
A: RTO data is typically 95%+ accurate. VIN decoding is 92%+ accurate. OCR accuracy varies by document quality.

**Q: What if auto-fill fails?**
A: You can always enter data manually. The system provides helpful suggestions and validation.

**Q: Can I use multiple sources for auto-fill?**
A: Yes! Providing registration number, VIN, and documents together gives the best results.

### Technical Questions

**Q: What file formats are supported?**
A: Photos: JPG, PNG, WebP. Documents: JPG, PNG, PDF. Videos: MP4, MOV (Advanced tier).

**Q: What's the maximum file size?**
A: 10MB per file for photos and documents.

**Q: Is my data secure?**
A: Yes, all data is encrypted and stored securely. Private information (costs, margins) is never shared publicly.

### Tier Questions

**Q: How do I upgrade to Advanced tier?**
A: Contact your account manager or support team for upgrade options.

**Q: What happens if I exceed Basic tier limits?**
A: You'll see upgrade prompts when approaching limits. Existing data is preserved.

**Q: Can I downgrade from Advanced to Basic?**
A: Yes, but you may lose access to Advanced features. Contact support for assistance.

## Support

### Getting Help

**In-App Help**:
- Click the "?" icon for contextual help
- Use the help text under each field
- Review validation messages

**Documentation**:
- This user guide
- Video tutorials
- Best practices guide

**Support Channels**:
- Email: support@aura.com
- Phone: +91-XXXXXXXXXX
- Live Chat: Available in the app

### Feedback

**Bug Reports**:
- Use the "Report Issue" button in the app
- Include screenshots and steps to reproduce
- Provide system information

**Feature Requests**:
- Submit through the feedback form
- Describe the use case and benefits
- Include examples if possible

---

*Last updated: December 2024*
*Version: 1.0*

import { z } from 'zod';

// A robust Zod schema for validating any JSON value.
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
).describe("Represents any valid JSON value, including objects, arrays, and primitives.");

// --- ENUM Schemas ---
export const accessLevelEnum = z.enum(["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]);
export const documentStatusEnum = z.enum(["pending", "approved", "rejected"]);
export const inquiryStatusEnum = z.enum(["new", "in_progress", "resolved", "closed"]);
export const inspectionStatusEnum = z.enum(["pending", "scheduled", "completed", "failed"]);
export const logisticsStatusEnum = z.enum(["pending", "assigned", "in_transit", "delivered", "cancelled"]);
export const paymentMethodEnum = z.enum(["upi", "card", "netbanking", "cash", "other"]);
export const paymentStatusEnum = z.enum(["pending", "success", "failed", "refunded"]);
export const rtoStatusEnum = z.enum(["pending", "submitted", "approved", "rejected", "cancelled"]);
export const txnStatusEnum = z.enum(["pending", "completed", "cancelled", "failed", "offer_made", "offer_accepted", "offer_rejected", "counter_offer", "negotiating", "payment_pending", "payment_completed", "escrow_pending", "escrow_released", "logistics_pending", "logistics_completed", "rto_pending", "rto_completed", "disputed", "archived", "accepted"]);
export const userTypeEnum = z.enum(["group_dealer", "individual_org", "franchise", "wholesale_trader", "consignment_seller", "fleet_corporate", "nbfc_bank", "govt_psu", "rental_leasing", "agri_construction", "2w_3w_network", "dsa_broker", "chauffeur_driver", "self_user", "partner"]);
export const vehicleStatusEnum = z.enum(["active", "inactive", "sold", "draft", "live"]);
export const vehicleTypeEnum = z.enum(["personal", "commercial"]);

// --- TABLE Schemas ---

// Schema for the 'app_configs' table
export const appConfigsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the configuration entry (Primary Key)."),
    key: z.string().describe("The unique key for the configuration setting."),
    value: jsonSchema.nullable().describe("The value of the configuration setting, stored as JSON."),
    description: z.string().nullable().describe("A description of what this configuration setting does."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'audit_logs' table
export const auditLogsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the audit log entry (Primary Key)."),
    action: z.string().describe("The action that was performed (e.g., 'INSERT', 'UPDATE', 'DELETE')."),
    table_name: z.string().nullable().describe("The name of the table where the action occurred."),
    record_id: z.string().uuid().nullable().describe("The ID of the record that was affected."),
    user_id: z.string().uuid().nullable().describe("The user ID of the actor who performed the action."),
    actor_email: z.string().email().nullable().describe("The email of the actor."),
    old_values: jsonSchema.nullable().describe("A JSON object representing the state of the record before the change."),
    new_values: jsonSchema.nullable().describe("A JSON object representing the state of the record after the change."),
    details: z.string().nullable().describe("Additional details or notes about the logged action."),
    ip_address: z.any().nullable().describe("The IP address from which the action was initiated."),
    user_agent: z.string().nullable().describe("The user agent string of the client that performed the action."),
    session_id: z.string().uuid().nullable().describe("The session ID associated with the action."),
    target_id: z.string().uuid().nullable().describe("The ID of the primary target entity."),
    target_type: z.string().nullable().describe("The type of the primary target entity."),
    metadata: jsonSchema.nullable().describe("Any additional metadata related to the audit event."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the audit log entry was created."),
});

// Schema for the 'bank_accounts' table
export const bankAccountsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the bank account (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    bank_name: z.string().nullable().describe("The name of the bank."),
    branch_name: z.string().nullable().describe("The name of the bank branch."),
    account_holder_name: z.string().nullable().describe("The name of the account holder."),
    account_number: z.string().nullable().describe("The bank account number."),
    account_type: z.string().nullable().describe("The type of account (e.g., 'Savings', 'Current')."),
    ifsc_code: z.string().nullable().describe("The IFSC code of the bank branch."),
    micr_code: z.string().nullable().describe("The MICR code of the bank branch."),
    upi_id: z.string().nullable().describe("The UPI ID associated with the account."),
    cheque_image_url: z.string().url().nullable().describe("URL of the scanned cancelled cheque image."),
    is_primary: z.boolean().nullable().describe("Indicates if this is the primary bank account."),
    is_verified: z.boolean().nullable().describe("Indicates if the bank account has been verified."),
    verification_method: z.string().nullable().describe("The method used for verification (e.g., 'Penny Drop')."),
    verification_date: z.string().date().nullable().describe("The date the account was verified."),
    status: z.string().nullable().describe("The current status of the bank account record."),
    currency: z.string().nullable().describe("The currency of the account (e.g., 'INR')."),
    balance: z.number().nullable().describe("The current balance of the account (use with caution)."),
    last_transaction_date: z.string().date().nullable().describe("The date of the last transaction."),
    notes: z.string().nullable().describe("Any notes related to the bank account."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
    created_by: z.string().uuid().nullable().describe("The user ID of the person who created the record."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'bank_details' table
export const bankDetailsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the bank detail record (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table (one-to-one)."),
    bank_name: z.string().nullable().describe("The name of the bank."),
    account_holder_name: z.string().describe("The name of the account holder."),
    account_number: z.string().describe("The bank account number."),
    ifsc_code: z.string().describe("The IFSC code of the bank branch."),
    cancelled_cheque_url: z.string().url().nullable().describe("URL of the scanned cancelled cheque image."),
    is_verified: z.boolean().nullable().describe("Indicates if the bank account has been verified."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'branches' table
export const branchesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the branch (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    name: z.string().describe("The name of the branch."),
    address: z.string().nullable().describe("The full street address of the branch."),
    city: z.string().nullable().describe("The city where the branch is located."),
    state: z.string().nullable().describe("The state where the branch is located."),
    contact_number: z.string().nullable().describe("The primary contact number for the branch."),
    manager_id: z.string().uuid().nullable().describe("The user ID of the branch manager."),
    is_default: z.boolean().nullable().describe("Indicates if this is the default or main branch for the dealer."),
    working_hours: jsonSchema.nullable().describe("JSON object detailing the branch's working hours."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'dealer_documents' table
export const dealerDocumentsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the document (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    document_type: z.string().describe("The type of document (e.g., 'PAN', 'GSTIN', 'Trade License')."),
    file_url: z.string().url().describe("The URL where the document file is stored."),
    status: z.string().nullable().describe("The verification status of the document (e.g., 'Pending', 'Approved', 'Rejected')."),
    rejection_reason: z.string().nullable().describe("The reason for rejection, if applicable."),
    file_name: z.string().nullable().describe("The original name of the uploaded file."),
    file_type: z.string().nullable().describe("The MIME type of the file."),
    file_size: z.number().int().nonnegative().nullable().describe("The size of the file in bytes."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'dealer_hours' table
export const dealerHoursSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the hours record (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    day_of_week: z.number().int().min(0).max(6).describe("The day of the week (e.g., 0 for Sunday, 6 for Saturday)."),
    is_open: z.boolean().nullable().describe("Indicates if the dealership is open on this day."),
    open_time: z.string().time().nullable().describe("The opening time on this day."),
    close_time: z.string().time().nullable().describe("The closing time on this day."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
});

// Schema for the 'dealer_inquiries' table
export const dealerInquiriesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the inquiry (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    inquirer_name: z.string().nullable().describe("The name of the person making the inquiry."),
    inquirer_email: z.string().email().nullable().describe("The email of the inquirer."),
    inquirer_phone: z.string().nullable().describe("The phone number of the inquirer."),
    message: z.string().nullable().describe("The content of the inquiry message."),
    status: z.string().nullable().describe("The status of the inquiry (e.g., 'New', 'In Progress', 'Resolved')."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the inquiry was created."),
});

// Schema for the 'dealer_preferences' table
export const dealerPreferencesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the preference record (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    notification_email: z.boolean().nullable().describe("Enable or disable email notifications."),
    notification_sms: z.boolean().nullable().describe("Enable or disable SMS notifications."),
    auto_publish: z.boolean().nullable().describe("Enable or disable automatic publishing of new inventory."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the preferences were created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the preferences were last updated."),
});

// Schema for the 'dealer_reviews' table
export const dealerReviewsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the review (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table being reviewed."),
    reviewer_name: z.string().nullable().describe("The name of the person who wrote the review."),
    rating: z.number().min(1).max(5).nullable().describe("The rating given, typically on a scale of 1 to 5."),
    comment: z.string().nullable().describe("The text content of the review."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the review was submitted."),
});

// Schema for the 'dealers' table
export const dealersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the dealer (Primary Key)."),
    email: z.string().email().describe("The primary email address of the dealer."),
    phone: z.string().nullable().describe("The primary phone number of the dealer."),
    name: z.string().nullable().describe("The display name of the dealer or dealership."),
    business_name: z.string().nullable().describe("The legal business name of the dealership."),
    owner_name: z.string().nullable().describe("The name of the owner."),
    owner_user_id: z.string().uuid().nullable().describe("The user ID of the owner."),
    business_type: z.string().nullable().describe("The type of business (e.g., 'Sole Proprietorship', 'LLC')."),
    user_type: userTypeEnum.nullable().describe("The classification of the user/dealer type."),
    client_type: z.string().nullable().describe("The type of client this dealer represents."),
    address: z.string().nullable().describe("The primary business address."),
    city: z.string().nullable().describe("The city of the primary address."),
    state: z.string().nullable().describe("The state of the primary address."),
    pincode: z.string().nullable().describe("The pincode of the primary address."),
    contact_number: z.string().nullable().describe("An additional contact number."),
    whatsapp: z.string().nullable().describe("The WhatsApp contact number."),
    website: z.string().url().nullable().describe("The dealer's website URL."),
    logo_url: z.string().url().nullable().describe("URL for the dealer's logo."),
    banner_url: z.string().url().nullable().describe("URL for the dealer's profile banner."),
    description: z.string().nullable().describe("A description of the dealership."),
    tagline: z.string().nullable().describe("A short tagline for the dealership."),
    gstin: z.string().nullable().describe("The GST Identification Number."),
    pan_number: z.string().nullable().describe("The Permanent Account Number (PAN)."),
    status: z.string().nullable().describe("The overall status of the dealer's account (e.g., 'Active', 'Suspended')."),
    is_verified: z.boolean().nullable().describe("Indicates if the dealer has been verified."),
    is_featured: z.boolean().nullable().describe("Indicates if the dealer is featured on the platform."),
    is_premium: z.boolean().nullable().describe("Indicates if the dealer has a premium subscription."),
    rating: z.number().min(0).max(5).nullable().describe("The average rating of the dealer."),
    total_reviews: z.number().int().nonnegative().nullable().describe("The total number of reviews received."),
    total_sales: z.number().int().nonnegative().nullable().describe("The total number of sales completed."),
    total_vehicles: z.number().int().nonnegative().nullable().describe("The total number of vehicles listed."),
    onboarding_completed: z.boolean().nullable().describe("Flag indicating if the onboarding process is complete."),
    onboarding_started_at: z.string().datetime().nullable().describe("Timestamp when the onboarding process started."),
    onboarding_completed_at: z.string().datetime().nullable().describe("Timestamp when the onboarding process was completed."),
    current_onboarding_step: z.number().int().nullable().describe("The current step in the onboarding process."),
    onboarding_data: jsonSchema.nullable().describe("JSON object storing data collected during onboarding."),
    onboarding_progress: jsonSchema.nullable().describe("JSON object tracking completion of onboarding steps."),
    draft_data: jsonSchema.nullable().describe("JSON object for saving partially filled forms during onboarding."),
    kyc_completed: z.boolean().nullable().describe("Indicates if Know Your Customer (KYC) is complete."),
    kyb_completed: z.boolean().nullable().describe("Indicates if Know Your Business (KYB) is complete."),
    kyb_data: jsonSchema.nullable().describe("JSON object storing data from the KYB process."),
    verification_status: z.string().nullable().describe("The verification status of the dealer."),
    verification_status_new: z.string().nullable().describe("A new/updated verification status field."),
    verification_notes: z.string().nullable().describe("Notes from the verification team."),
    verified_at: z.string().datetime().nullable().describe("Timestamp when the dealer was verified."),
    verified_by: z.string().uuid().nullable().describe("The user ID of the admin who performed the verification."),
    access_level: accessLevelEnum.nullable().describe("The access level granted to the dealer."),
    bank_details_added: z.boolean().nullable().describe("Flag indicating if bank details have been added."),
    branches_added: z.boolean().nullable().describe("Flag indicating if branch details have been added."),
    plan_selection: jsonSchema.nullable().describe("JSON object for the selected subscription plan."),
    consent_receipt: jsonSchema.nullable().describe("JSON object storing consent information."),
    business_hours: jsonSchema.nullable().describe("JSON object for business hours."),
    business_mode: jsonSchema.nullable().describe("JSON object for business mode."),
    certifications: z.array(z.string()).nullable().describe("List of certifications."),
    email_verified: z.boolean().nullable().describe("Flag for email verification."),
    phone_verified: z.boolean().nullable().describe("Flag for phone verification."),
    payment_methods: jsonSchema.nullable().describe("JSON object for accepted payment methods."),
    specializations: z.array(z.string()).nullable().describe("List of specializations."),
    submitted_at: z.string().datetime().nullable().describe("Timestamp for form submission."),
    subscription_plan: z.string().nullable().describe("Name of the subscription plan."),
    bank_details: jsonSchema.nullable().describe("Embedded bank details."),
    created_at: z.string().datetime().describe("The timestamp when the dealer record was created."),
    updated_at: z.string().datetime().describe("The timestamp when the dealer record was last updated."),
    created_by: z.string().uuid().nullable().describe("The user ID of the person who created the record."),
});

// Schema for the 'logistics_orders' table
export const logisticsOrdersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the logistics order (Primary Key)."),
    transaction_id: z.string().uuid().nullable().describe("Foreign key linking to the 'transactions' table."),
    pickup_address: z.string().nullable().describe("The address for vehicle pickup."),
    delivery_address: z.string().nullable().describe("The address for vehicle delivery."),
    status: z.string().nullable().describe("The current status of the logistics order."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the order was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the order was last updated."),
});

// Schema for the 'onboarding_audit_log' table
export const onboardingAuditLogSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the audit log entry (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    step: z.string().nullable().describe("The onboarding step during which the action occurred."),
    action: z.string().describe("The action that was performed (e.g., 'SAVE_DRAFT', 'SUBMIT')."),
    old_values: jsonSchema.nullable().describe("A JSON object representing the state before the change."),
    new_values: jsonSchema.nullable().describe("A JSON object representing the state after the change."),
    ip_address: z.any().nullable().describe("The IP address from which the action was initiated."),
    user_agent: z.string().nullable().describe("The user agent string of the client."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the log entry was created."),
});

// Schema for the 'payments' table
export const paymentsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the payment (Primary Key)."),
    transaction_id: z.string().uuid().describe("Foreign key linking to the 'transactions' table."),
    amount: z.number().nonnegative().describe("The amount of the payment."),
    status: paymentStatusEnum.describe("The status of the payment."),
    payment_method: paymentMethodEnum.describe("The method used for the payment."),
    created_at: z.string().datetime().describe("The timestamp when the payment was recorded."),
});

// Schema for the 'rto_applications' table
export const rtoApplicationsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the RTO application (Primary Key)."),
    transaction_id: z.string().uuid().nullable().describe("Foreign key linking to the 'transactions' table."),
    vehicle_number: z.string().nullable().describe("The vehicle's registration number."),
    owner_name: z.string().nullable().describe("The name of the vehicle owner."),
    status: z.string().nullable().describe("The status of the RTO application."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the application was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the application was last updated."),
});

// Schema for the 'shortlists' table
export const shortlistsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the shortlist (Primary Key)."),
    user_id: z.string().uuid().nullable().describe("The user who owns this shortlist."),
    dealer_id: z.string().uuid().nullable().describe("The dealer who owns this shortlist."),
    vehicle_id: z.string().uuid().nullable().describe("A single vehicle in the shortlist (legacy)."),
    vehicle_ids: z.array(z.string().uuid()).describe("An array of vehicle IDs in the shortlist."),
    name: z.string().describe("The name of the shortlist."),
    notes: z.string().nullable().describe("User's notes for this shortlist."),
    priority: z.number().int().nullable().describe("A priority level for the shortlist."),
    is_public: z.boolean().nullable().describe("Indicates if the shortlist is public."),
    is_active: z.boolean().nullable().describe("Indicates if the shortlist is active."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the shortlist was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the shortlist was last updated."),
});

// Schema for the 'team_members' table
export const teamMembersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the team member (Primary Key)."),
    dealer_id: z.string().uuid().nullable().describe("Foreign key linking to the 'dealers' table."),
    user_id: z.string().uuid().nullable().describe("The user ID from the auth system, if linked."),
    full_name: z.string().nullable().describe("The full name of the team member."),
    email: z.string().email().nullable().describe("The email address of the team member."),
    mobile_number: z.string().nullable().describe("The mobile number of the team member."),
    role: z.string().nullable().describe("The role of the team member within the dealership."),
    status: z.string().nullable().describe("The status of the team member (e.g., 'Active', 'Inactive')."),
    permissions: jsonSchema.nullable().describe("JSON object defining specific permissions for the team member."),
    aadhar_number: z.string().nullable().describe("The Aadhar number of the team member."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the team member was added."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the record was last updated."),
});

// Schema for the 'transactions' table
export const transactionsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the transaction (Primary Key)."),
    vehicle_id: z.string().uuid().describe("Foreign key linking to the 'vehicles' table."),
    seller_id: z.string().uuid().describe("The user or dealer ID of the seller."),
    buyer_id: z.string().uuid().describe("The user or dealer ID of the buyer."),
    status: txnStatusEnum.describe("The current status of the transaction."),
    amount: z.number().nonnegative().describe("The total amount of the transaction."),
    amount_paid: z.number().nonnegative().nullable().describe("The amount that has been paid so far."),
    currency: z.string().nullable().describe("The currency of the transaction amount."),
    initial_offer: z.number().nonnegative().nullable().describe("The initial offer price."),
    current_offer: z.number().nonnegative().nullable().describe("The current offer price in negotiation."),
    final_price: z.number().nonnegative().nullable().describe("The final agreed-upon price."),
    last_action_by: z.string().uuid().nullable().describe("The user who performed the last action."),
    payment_method: z.string().nullable().describe("The method used for payment."),
    transaction_date: z.string().date().nullable().describe("The date the transaction was finalized."),
    transaction_type: z.string().nullable().describe("The type of transaction (e.g., 'Sale', 'Auction')."),
    timeline: jsonSchema.nullable().describe("JSON object logging key events in the transaction timeline."),
    messages: jsonSchema.nullable().describe("JSON object or array storing messages between buyer and seller."),
    notes: z.string().nullable().describe("Internal notes about the transaction."),
    metadata: jsonSchema.nullable().describe("Any additional metadata for the transaction."),
    seller_rated: z.boolean().nullable().describe("Indicates if the seller has been rated by the buyer."),
    buyer_rated: z.boolean().nullable().describe("Indicates if the buyer has been rated by the seller."),
    logistics_id: z.string().uuid().nullable().describe("Reference to an associated logistics order."),
    rto_id: z.string().uuid().nullable().describe("Reference to an associated RTO application."),
    created_at: z.string().datetime().describe("The timestamp when the transaction was initiated."),
    updated_at: z.string().datetime().describe("The timestamp when the transaction was last updated."),
});

// Schema for the 'user_sessions' table
export const userSessionsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the session (Primary Key)."),
    user_id: z.string().uuid().nullable().describe("The user ID this session belongs to."),
    session_data: jsonSchema.nullable().describe("JSON object containing session data."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the session was created."),
});

// Schema for the 'vehicle_assets' table
export const vehicleAssetsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the asset (Primary Key)."),
    vehicle_id: z.string().uuid().describe("Foreign key linking to the 'vehicles' table."),
    file_url: z.string().url().describe("The URL where the asset file is stored."),
    file_type: z.string().describe("The type of asset (e.g., 'image', 'video', 'document')."),
    file_name: z.string().nullable().describe("The original name of the asset file."),
    created_at: z.string().datetime().describe("The timestamp when the asset was created."),
});

// Schema for the 'vehicle_inspections' table
export const vehicleInspectionsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the inspection record (Primary Key)."),
    vehicle_id: z.string().uuid().nullable().describe("Foreign key linking to the 'vehicles' table."),
    inspector_id: z.string().uuid().nullable().describe("The user ID of the inspector."),
    inspection_date: z.string().date().nullable().describe("The date the inspection was performed."),
    status: z.string().nullable().describe("The status of the inspection."),
    report_url: z.string().url().nullable().describe("A URL to the detailed inspection report."),
    notes: z.string().nullable().describe("General notes from the inspection."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the record was created."),
});

// Schema for the 'vehicles' table
export const vehiclesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the vehicle (Primary Key)."),
    dealer_id: z.string().uuid().describe("Foreign key linking to the 'dealers' table."),
    branch_id: z.string().uuid().nullable().describe("Foreign key linking to the 'branches' table."),
    make: z.string().describe("The manufacturer of the vehicle (e.g., 'Toyota')."),
    model: z.string().describe("The model of the vehicle (e.g., 'Camry')."),
    variant: z.string().nullable().describe("The specific variant or trim of the model."),
    year: z.number().int().describe("The year of manufacture."),
    registration_number: z.string().nullable().describe("The vehicle's registration number."),
    price: z.number().nonnegative().nullable().describe("The current listed price."),
    asking_price: z.number().nonnegative().nullable().describe("The initial asking price."),
    status: vehicleStatusEnum.describe("The current status of the vehicle in inventory."),
    description: z.string().nullable().describe("A detailed description of the vehicle."),
    images: z.array(z.string().url()).nullable().describe("An array of URLs for vehicle images."),
    videos: z.array(z.string().url()).nullable().describe("An array of URLs for vehicle videos."),
    hero_image_url: z.string().url().nullable().describe("The primary display image for the vehicle."),
    body_type: z.string().nullable().describe("The body type of the vehicle (e.g., 'Sedan', 'SUV')."),
    kilometers: z.number().int().nonnegative().nullable().describe("The distance the vehicle has traveled in kilometers."),
    mileage: z.number().nonnegative().nullable().describe("The fuel efficiency of the vehicle."),
    fuel_type: z.string().nullable().describe("The type of fuel the vehicle uses."),
    transmission: z.string().nullable().describe("The transmission type (e.g., 'Automatic', 'Manual')."),
    engine_size: z.string().nullable().describe("The engine displacement or size."),
    color: z.string().nullable().describe("The exterior color of the vehicle."),
    ownership: z.string().nullable().describe("The ownership history (e.g., 'First Owner')."),
    rto_location: z.string().nullable().describe("The RTO where the vehicle is registered."),
    insurance_valid_until: z.string().date().nullable().describe("The expiry date of the insurance."),
    seating_capacity: z.number().int().nullable().describe("The number of seats in the vehicle."),
    features: z.array(z.string()).nullable().describe("A list of features the vehicle has."),
    tags: z.array(z.string()).nullable().describe("Descriptive tags for searching."),
    is_negotiable: z.boolean().nullable().describe("Indicates if the price is negotiable."),
    is_featured: z.boolean().nullable().describe("Indicates if the vehicle is a featured listing."),
    is_urgent: z.boolean().nullable().describe("Indicates if the sale is urgent."),
    emi_available: z.boolean().nullable().describe("Indicates if EMI options are available."),
    exchange_available: z.boolean().nullable().describe("Indicates if exchange is possible."),
    test_drive_available: z.boolean().nullable().describe("Indicates if a test drive is available."),
    created_at: z.string().datetime().describe("The timestamp when the record was created."),
    updated_at: z.string().datetime().describe("The timestamp when the record was last updated."),
    created_by: z.string().uuid().nullable().describe("The user ID of the person who created the record."),
    ai_confidence: z.string().nullable().describe("Confidence score from an AI model for any derived data."),
    ai_metadata: jsonSchema.nullable().describe("JSON object for metadata provided by an AI service."),
    ai_reasoning: z.string().nullable().describe("The reasoning provided by an AI service."),
    buyer_requirements: jsonSchema.nullable().describe("JSON object specifying requirements for potential buyers."),
    condition_rating: z.number().nullable().describe("A numerical rating of the vehicle's condition."),
    custom_attributes: jsonSchema.nullable().describe("JSON object for any custom fields."),
    documents: z.array(z.string().url()).nullable().describe("An array of URLs to vehicle documents."),
    financing_options: jsonSchema.nullable().describe("JSON object detailing available financing options."),
    inspection_report_url: z.string().url().nullable().describe("URL to a detailed inspection report."),
    inventory_type: z.string().nullable().describe("The type of inventory (e.g., 'Owned', 'Consignment')."),
    landed_cost_components: jsonSchema.nullable().describe("JSON object breaking down the landed cost."),
    listing_fee_type: z.string().nullable().describe("The type of fee for the listing (e.g., 'fixed', 'percentage')."),
    listing_fee_value: z.number().nonnegative().nullable().describe("The value of the listing fee."),
    location_city: z.string().nullable().describe("The city where the vehicle is located."),
    location_state: z.string().nullable().describe("The state where the vehicle is located."),
    market_data: jsonSchema.nullable().describe("JSON object with market comparison data."),
    market_price_max: z.number().nonnegative().nullable().describe("The maximum estimated market price."),
    market_price_min: z.number().nonnegative().nullable().describe("The minimum estimated market price."),
    publish_at: z.string().datetime().nullable().describe("A future timestamp to publish the listing."),
    publish_schedule: z.string().nullable().describe("A schedule for publishing (e.g., cron string)."),
    seller_notes: z.string().nullable().describe("Notes from the seller for internal use."),
    service_history: jsonSchema.nullable().describe("JSON object detailing the vehicle's service history."),
    suggested_categories: z.array(z.string()).nullable().describe("AI-suggested categories for the vehicle."),
    vehicle_category: z.array(z.string()).nullable().describe("The assigned categories for the vehicle."),
    vehicle_type: z.string().nullable().describe("The type of vehicle (e.g., 'Car', 'Motorcycle')."),
    viewing_schedule: jsonSchema.nullable().describe("JSON object with available times for viewing."),
    warranty_info: jsonSchema.nullable().describe("JSON object with details about the vehicle's warranty."),
});
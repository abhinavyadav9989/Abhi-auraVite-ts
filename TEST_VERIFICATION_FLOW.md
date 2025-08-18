# Email Verification Flow Test Guide

## **🧪 Test Scenarios:**

### **Scenario 1: New User Registration**
1. **Register** with a new email (e.g., `test@example.com`)
2. **Expected**: Account created, verification email sent
3. **Don't verify** the email yet

### **Scenario 2: Duplicate Registration Attempt**
1. **Try to register** again with the same email (`test@example.com`)
2. **Expected**: "Email already exists" error
3. **Registration blocked**

### **Scenario 3: Login with Unverified Account**
1. **Go to login form**
2. **Enter** the unverified email and password
3. **Expected**: "Email not verified. A new verification email has been sent to your inbox."
4. **Check email** for new verification link
5. **Click verification link**
6. **Try login again**
7. **Expected**: Successful login

### **Scenario 4: Login with Verified Account**
1. **Use verified account** credentials
2. **Expected**: Successful login

### **Scenario 5: Dealer Account Login**
1. **Try to register** with existing dealer email (`ravi.abhinavyadav@gmail.com`)
2. **Expected**: "Email already exists" error
3. **Try to login** with dealer credentials
4. **Expected**: Login success (if dealer has auth account) or appropriate error

## **✅ Expected Behavior:**

### **Registration:**
- ✅ New emails → Account created + verification email
- ✅ Existing emails → "Email already exists" error

### **Login:**
- ✅ Verified accounts → Successful login
- ✅ Unverified accounts → "Email not verified" + resend option
- ✅ Invalid credentials → Standard error message

### **Verification:**
- ✅ Resend button works
- ✅ Verification email received
- ✅ Clicking link verifies account
- ✅ Can login after verification

## **🔍 Console Logs to Watch:**

```
🔍 Checking email existence for: [email]
📊 Email check result (main): {data: true/false, error: null}
✅ Email exists (final): true/false
```

## **📧 Email Verification:**
- Check spam folder if verification emails don't arrive
- Supabase sends from `noreply@supabase.co`
- Verification links expire after 24 hours

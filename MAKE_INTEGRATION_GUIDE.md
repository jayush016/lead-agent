# Make.com Integration Guide

Connect your Facebook Lead Ads, Instagram, Google Forms, or any other source to your Lead Agent CRM.

## Your Webhook URL

```
https://lead-agent-inky.vercel.app/api/webhook
```

---

## Expected Payload Format

Send a POST request with JSON body:

```json
{
  "name": "John Doe",
  "phone": "9823456789",
  "property": "2 BHK",
  "location": "Baner",
  "budget_min": 50,
  "budget_max": 80,
  "source": "Facebook",
  "notes": "Interested in ready possession"
}
```

### Required Fields:
- `name` - Lead's full name
- `phone` - Phone number (with or without +91)

### Optional Fields:
- `property` - Property type (default: "2 BHK")
- `location` - Preferred location
- `budget_min` / `budget_max` - In Lakhs
- `source` - Lead source (Facebook, Instagram, Google, etc.)
- `notes` - Any additional message

---

## Make.com Setup Steps

### Step 1: Create a New Scenario
1. Go to [make.com](https://make.com) and login
2. Click **Create a new scenario**

### Step 2: Add Facebook Lead Ads Trigger
1. Click the **+** button
2. Search for **Facebook Lead Ads**
3. Select **Watch New Leads**
4. Connect your Facebook account
5. Select your Page and Lead Form

### Step 3: Add HTTP Webhook Action
1. Click **+** to add another module
2. Search for **HTTP**
3. Select **Make a request**
4. Configure:
   - **URL**: `https://lead-agent-inky.vercel.app/api/webhook`
   - **Method**: POST
   - **Body type**: JSON
   - **Request content**:
   ```json
   {
     "name": "{{1.full_name}}",
     "phone": "{{1.phone_number}}",
     "source": "Facebook",
     "notes": "{{1.message}}"
   }
   ```

### Step 4: Activate
1. Click **Run once** to test
2. If successful, click **Activate** to turn on the automation

---

## Alternative Sources

### Google Forms
1. Trigger: **Google Forms > Watch Responses**
2. Action: HTTP POST to webhook with mapped fields

### Instagram DM (via ManyChat)
1. Connect ManyChat to Instagram
2. Use ManyChat's HTTP action to POST to webhook

### Manual Test (cURL)
```bash
curl -X POST https://lead-agent-inky.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","phone":"9999999999","source":"Manual"}'
```

---

## Response Format

### Success:
```json
{
  "success": true,
  "message": "Lead created successfully",
  "lead": { "id": "...", "name": "..." }
}
```

### Error:
```json
{
  "success": false,
  "error": "Missing required fields: name, phone"
}
```

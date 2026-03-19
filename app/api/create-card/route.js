import { getSheet } from '@/lib/googleSheet';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (per server instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

export async function POST(request) {
  try {
    // Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    if (rateLimit.has(ip)) {
      const lastTime = rateLimit.get(ip);
      if (now - lastTime < RATE_LIMIT_WINDOW) {
         return NextResponse.json({ 
           error: 'Please wait 1 minute before creating another card.' 
         }, { status: 429 });
      }
    }
    rateLimit.set(ip, now);

    const body = await request.json();
    const { name, title, company, area_code, phone, is_whatsapp, email, linkedin, booking_url, others, bio, avatar, password, tag_id } = body;
    
    // Debug Auth
    console.log("Auth Email being used:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

    if (!name || !title || !company || !phone || !email || !password) {
       return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const sheet = await getSheet('User_Cards');
    
    // Generate a simple unique ID
    const id = crypto.randomUUID().split('-')[0]; // Use first section of UUID for brevity
    const created_at = new Date().toISOString();
    const referred_by = body.referred_by || '';

    // Verify sheet loaded correctly
    if (!sheet) {
        throw new Error('Could not find User_Cards tab');
    }

    // Dynamic Header Matching to handle Case/Space variations
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    
    const findHeader = (key) => {
        // Try strict match first
        if (headers.includes(key)) return key;
        
        // Try Normalized Match (ignore case, treat space as underscore)
        const normalizedKey = key.toLowerCase().replace(/_/g, '').replace(/ /g, '');
        return headers.find(h => h.toLowerCase().replace(/_/g, '').replace(/ /g, '') === normalizedKey);
    };

    const rowData = {};
    const fieldMap = {
        'id': id,
        'name': name,
        'title': title,
        'company': company,
        'area_code': area_code || '',
        'phone': phone,
        'is_whatsapp': is_whatsapp ? 'TRUE' : 'FALSE',
        'email': email,
        'linkedin': linkedin || '',
        'meeting_link': booking_url || '',
        'others': others || '',
        'bio': bio || '',
        'avatar': avatar || '',
        'password': password,
        'created_at': created_at,
        'referred_by': referred_by
    };

    Object.entries(fieldMap).forEach(([key, value]) => {
        const header = findHeader(key);
        if (header) {
            rowData[header] = value;
        } else {
             // If no header found, try adding with the key as is (library might ignore it)
             // or try common variations explicitly if needed
             if (key === 'area_code') rowData['Area Code'] = value;
             else if (key === 'referred_by') rowData['Referred By'] = value;
             else rowData[key] = value;
        }
    });

    await sheet.addRow(rowData);

    // If tag_id is provided, try to claim the tag in NFC_Tags sheet
    if (tag_id) {
        try {
            const tagSheet = await getSheet('NFC_Tags');
            if (tagSheet) {
               const rows = await tagSheet.getRows();
               const tagRow = rows.find(r => r.get('tag_id') === tag_id);
               if (tagRow) {
                   tagRow.set('target_id', id);
                   await tagRow.save();
                   console.log(`Tag claimed by ${id}`);
               } else {
                   // If tag doesn't exist in sheet, maybe auto-create it?
                   await tagSheet.addRow({
                       tag_id: tag_id,
                       target_id: id,
                       created_at: new Date().toISOString()
                   });
                   console.log(`Tag created and claimed by ${id}`);
               }
            } else {
                console.warn('NFC_Tags sheet not found');
            }
        } catch (tagError) {
            console.error('Failed to claim tag:', tagError);
            // Don't fail the card creation if tag claim fails, just log it
        }
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error("API Error Full Stack:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

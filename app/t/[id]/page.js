import { getSheet } from '@/lib/googleSheet';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TagRedirect({ params }) {
  const { id } = await params; // tag_id (e.g., gift-001)
  
  // Default destination (Fallback) with tag_id preserved
  let destination = `/user/claudiatsoi?tag_id=${id}`;

  try {
    const sheet = await getSheet('NFC_Tags');
    
    // Only proceed if sheet exists
    if (sheet) {
        const rows = await sheet.getRows();
        const tagRow = rows.find(row => row.get('tag_id') === id);

        if (tagRow) {
            const targetId = tagRow.get('target_id');
            // If tag is claimed, update destination
            if (targetId) {
                destination = `/user/${targetId}?tag_id=${id}`;
            }
        }
    }
  } catch (error) {
    console.error('Error in tag redirect:', error);
    // On error, we stick to the default destination (Claudia's profile + tag_id)
  }

  // Perform redirect OUTSIDE try/catch to avoid NEXT_REDIRECT errors being caught
  return redirect(destination);
}
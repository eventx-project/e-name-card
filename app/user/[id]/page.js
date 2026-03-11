import Link from 'next/link';
import { getSheet } from '@/lib/googleSheet';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react'; 
import SaveContactButton from '@/app/components/SaveContactButton';
import WriteNFCButton from '@/app/components/WriteNFCButton';
import ShareButton from '@/app/components/ShareButton';
import AddToHomeScreenButton from '@/app/components/AddToHomeScreenButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UserCard({ params }) {
  const { id } = await params;
  
  let row;
  try {
    const sheet = await getSheet('User_Cards');
    const rows = await sheet.getRows();
    row = rows.find(r => (r.get('id') || '') === id);
  } catch (error) {
     console.error(error);
  }

  if (!row) {
    return notFound();
  }

  const get = (key) => row.get(key) || row.get(key.toLowerCase()) || row.get(key.toUpperCase()) || row.get(key.replace('_', ' ')) || '';
  
  const name = get('name');
  const title = get('title');
  const company = get('company');
  const phone = String(get('phone') || '').trim();
  const email = get('email');
  const areaCode = String(get('area_code') || get('Area Code') || get('Area_Code') || '').trim();
  const isWhatsapp = String(get('is_whatsapp') || get('Is Whatsapp') || '').trim().toLowerCase() === 'true';
  const linkedin = get('linkedin') || get('LinkedIn') || '';
  const bookingUrl = get('meeting_link') || get('Meeting Link') || get('booking_url') || get('Booking URL') || '';
  const others = get('others') || get('Others') || get('others_url') || '';
  const bio = get('bio') || get('Bio') || '';
  const avatar = get('avatar') || get('Avatar') || '';

  const fullPhone = areaCode ? `${areaCode}${phone}` : phone;
  const whatsappUrl = isWhatsapp ? `https://wa.me/${fullPhone.replace(/[^0-9]/g,'')}` : '';

  // Helper to parse bio for links
  const renderBio = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{part}</a>;
        }
        return part;
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#121517] dark:text-white transition-colors duration-300">
       <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] mx-auto overflow-x-hidden">
         {/* DetailCard Header */}
         <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
           <div className="text-primary flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
              {/* Optional Back Button */}
           </div>
           <h2 className="text-[#121517] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12 uppercase tracking-widest text-xs opacity-60">Digital Card</h2>
         </header>

         <main className="flex-1 px-6 pt-4 pb-12">
            {/* Central Digital Card */}
            <div className="relative group mt-4">
                <div id="user-card-visual" className="whisper-shadow flex flex-col items-stretch justify-start rounded-xl bg-white border border-gray-200 overflow-hidden">
                    {/* Top Banner (keeping EventX logic but integrated) */}
                    <a href="https://eventx.io" target="_blank" rel="noopener noreferrer" className="w-full h-14 bg-white relative flex items-center justify-center py-2 overflow-hidden border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="relative h-6 w-16 shrink-0">
                             <Image 
                                 src="/eventx-logo.png" 
                                 alt="EventX" 
                                 fill 
                                 className="object-contain"
                                 priority
                                 unoptimized
                             /> 
                        </div>
                    </a>
                    
                    <div className="flex w-full flex-col items-start justify-center gap-2 px-8 py-8 min-h-[200px]">
                        <div className="flex w-full justify-between items-start">
                             {avatar ? (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <Image 
                                        src={avatar}
                                        alt={name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                             ) : (
                                <div className="flex-1 pr-4">
                                    <h1 className="text-[#121517] text-3xl font-extrabold leading-tight tracking-[-0.02em]">{name}</h1>
                                    <p className="text-primary text-lg font-medium mt-1">{title}</p>
                                    <p className="text-[#657b86] text-base font-normal mt-1">{company}</p>
                                </div>
                             )}
                             
                             <div className="p-1 bg-white shrink-0">
                                <QRCodeSVG 
                                    value={`https://e-bcard.eventx.io/user/${id}`}
                                    size={48}
                                    level="L"
                                    fgColor="#121517"
                                />
                             </div>
                        </div>

                        {avatar && (
                            <div className="w-full">
                                <h1 className="text-[#121517] text-3xl font-extrabold leading-tight tracking-[-0.02em]">{name}</h1>
                                <p className="text-primary text-lg font-medium mt-1">{title}</p>
                                <p className="text-[#657b86] text-base font-normal mt-1">{company}</p>
                            </div>
                        )}

                        {bio && (
                            <div className="w-full">
                                <p className="text-[#657b86] text-sm leading-relaxed whitespace-pre-wrap italic">
                                    "{renderBio(bio)}"
                                </p>
                            </div>
                        )}

                        {(isWhatsapp || bookingUrl) && (
                            <div className="w-full grid grid-cols-2 gap-3 mt-1 mb-2">
                                {isWhatsapp && (
                                    <a 
                                        href={whatsappUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-green-500/30 active:scale-95 transition-all hover:scale-[1.02] hover:shadow-green-500/40 ${!bookingUrl ? 'col-span-2' : ''}`}
                                    >
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.304-5.235c0-5.443 4.429-9.873 9.874-9.873 2.638 0 5.118 1.026 6.982 2.887 1.865 1.86 2.894 4.335 2.892 6.973-.004 5.444-4.432 9.875-9.873 9.875M12 2.175C6.579 2.175 2.168 6.582 2.168 12c0 1.737.453 3.412 1.29 4.87L2.4 20.355l4.63-1.213a9.928 9.928 0 014.97 1.332c5.422 0 9.836-4.411 9.836-9.834 0-5.424-4.413-9.836-9.836-9.865z"/></svg>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="font-bold text-[10px] uppercase opacity-90 tracking-wider">Chat on</span>
                                            <span className="font-black text-sm tracking-wide">WhatsApp</span>
                                        </div>
                                    </a>
                                )}
                                {bookingUrl && (
                                    <a 
                                        href={bookingUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-[#144f6d] text-white shadow-lg shadow-primary/30 active:scale-95 transition-all hover:scale-[1.02] hover:shadow-primary/40 ${!isWhatsapp ? 'col-span-2' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="font-bold text-[10px] uppercase opacity-90 tracking-wider">Book a</span>
                                            <span className="font-black text-sm tracking-wide">Meeting</span>
                                        </div>
                                    </a>
                                )}
                            </div>
                        )}
                        
                        <div className="w-full space-y-3 pt-4 border-t border-gray-100 flex-1">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">call</span>
                                <a href={`tel:${fullPhone}`} className="text-[#121517] text-sm font-medium hover:text-primary">{areaCode && `+${areaCode} `}{phone}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                                <a href={`mailto:${email}`} className="text-[#121517] text-sm font-medium hover:text-primary">{email}</a>
                            </div>
                            {linkedin && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">social_leaderboard</span>
                                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-[#121517] text-sm font-medium hover:text-primary break-all">{linkedin.replace(/^https?:\/\//, '')}</a>
                                </div>
                            )}
                            {others && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">language</span>
                                    <a href={others} target="_blank" rel="noopener noreferrer" className="text-[#121517] text-sm font-medium hover:text-primary truncate max-w-[200px]">{others.replace(/^https?:\/\//, '')}</a>
                                </div>
                            )}
                        </div>

                        <div className="w-full pt-4 mt-auto border-t border-gray-100 flex items-center justify-center gap-1 opacity-60">
                            <span className="text-[#657b86] text-[10px] font-bold uppercase tracking-wider">Powered by</span>
                            <div className="relative h-3 w-12">
                                <Image 
                                     src="/eventx-logo.png" 
                                     alt="EventX" 
                                     fill 
                                     className="object-contain grayscale opacity-80"
                                     unoptimized
                                /> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 w-full flex justify-center">
                 <Link href={`/user/${id}/edit`} className="text-primary/70 dark:text-white/50 text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:underline transition-colors flex items-center gap-1.5 py-2">
                    <span className="material-symbols-outlined text-[14px]">edit_square</span>
                    Edit this card
                 </Link>
            </div>

            <div className="mt-2 w-full px-2">
                <Link href={`/create?ref=${id}`} className="w-full flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20 hover:bg-[#144f6d]">
                    <span>Create Your Own</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
            </div>

            {/* Quick Actions Header */}
            <div className="mt-10 mb-4 flex items-center justify-between px-2">
                <h3 className="text-[#121517] dark:text-white text-sm font-bold uppercase tracking-widest opacity-50">Quick Actions</h3>
                <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5 ml-4"></div>
            </div>

            {/* Action Grid (2x2) */}
            <div className="grid grid-cols-2 gap-4">
                <ShareButton 
                    variant="card"
                    title={`${name} - ${title}`} 
                    text={`Here's ${name} business card!`} 
                    url={`https://e-bcard.eventx.io/user/${id}`} 
                    cardTitle="Share"
                    cardSubtitle="Via QR or Link"
                />
                
                <SaveContactButton 
                    variant="card"
                    name={name}
                    title={title}
                    company={company}
                    phone={fullPhone}
                    email={email}
                    cardTitle="Save Contact"
                    cardSubtitle="Download vCard"
                />
                
                <AddToHomeScreenButton 
                    variant="card"
                    cardTitle="Home Screen"
                    cardSubtitle="Add as bookmark"
                />

                <WriteNFCButton 
                    variant="card"
                    cardTitle="Write to NFC"
                    cardSubtitle="Program NFC tag"
                />
            </div>
            
             <footer className="mt-16 pb-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    </div>
                    <p className="text-[#657b86] dark:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] px-4 text-center">
                        Powered by Claudia Tsoi
                    </p>
                    <p className="text-[#657b86]/40 dark:text-white/20 text-[8px] font-mono mt-1">
                        ID: {id}
                    </p>
                </div>
            </footer>
         </main>
       </div>
    </div>
  );
}

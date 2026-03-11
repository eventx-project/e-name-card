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

export default async function InternalSalesCard({ params }) {
  const { id } = await params;
  
  let row;
  try {
    const sheet = await getSheet('Internal_Sales');
    const rows = await sheet.getRows();
    row = rows.find(r => (r.get('id') || '') === id);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
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
  const linkedin = get('linkedin') || get('LinkedIn URL') || '';
  const areaCode = String(get('area_code') || get('Area Code') || get('Area_Code') || '').trim();
  const isWhatsapp = String(get('is_whatsapp') || get('Is Whatsapp') || '').trim().toLowerCase() === 'true';
  const avatar = get('avatar') || get('Avatar') || '';

  const fullPhone = areaCode ? `${areaCode}${phone}` : phone;
  const whatsappUrl = isWhatsapp ? `https://wa.me/${fullPhone.replace(/[^0-9]/g,'')}` : '';

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
                    
                    <div className="flex w-full flex-col items-start justify-center gap-6 px-8 py-8 min-h-[200px]">
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
                                    value={`https://e-bcard.eventx.io/c/${id}`}
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
                        
                        <div className="w-full space-y-3 pt-4 border-t border-gray-100 flex-1">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">call</span>
                                <a href={`tel:${fullPhone}`} className="text-[#121517] text-sm font-medium hover:text-primary">{areaCode && `+${areaCode} `}{phone}</a>
                            </div>
                            {isWhatsapp && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-600 text-xl">chat</span>
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#121517] text-sm font-medium hover:text-green-600">WhatsApp Chat</a>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                                <a href={`mailto:${email}`} className="text-[#121517] text-sm font-medium hover:text-primary">{email}</a>
                            </div>
                            {linkedin && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600 text-xl">work</span> 
                                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-[#121517] text-sm font-medium hover:text-blue-600 break-all">{linkedin.replace(/^https?:\/\//, '')}</a>
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

            <div className="mt-6 w-full px-2">
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
                    url={`https://e-bcard.eventx.io/c/${id}`} 
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
                </div>
            </footer>
         </main>
       </div>
    </div>
  );
}

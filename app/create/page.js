'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const AREA_CODES = [
  { value: '852', label: '+852 (HK)' },
  { value: '86', label: '+86 (CN)' },
  { value: '853', label: '+853 (MO)' },
  { value: '886', label: '+886 (TW)' },
  { value: '65', label: '+65 (SG)' },
  { value: '81', label: '+81 (JP)' },
  { value: '82', label: '+82 (KR)' },
  { value: '1', label: '+1 (US/CA)' },
  { value: '44', label: '+44 (UK)' },
  { value: '61', label: '+61 (AU)' },
];

function CreateCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referredBy = searchParams.get('ref') || '';
  const tagId = searchParams.get('tag_id') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    area_code: '852',
    is_whatsapp: false,
    email: '',
    linkedin: '',
    booking_url: '',
    others: '',
    bio: '',
    avatar: '',
    password: '',
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^https?:\/\/.+/i;

    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.title.trim()) errors.title = 'Job Title is required';
    if (!formData.company.trim()) errors.company = 'Company Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
    
    if (!formData.password.trim()) {
        errors.password = 'Password is required to edit later';
    } else if (!/^[a-zA-Z0-9]{6}$/.test(formData.password.trim())) {
        errors.password = 'Password must be exactly 6 digits/letters (English or Numbers)';
    }

    if (!formData.email.trim()) {
        errors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
        errors.linkedin = 'URL must start with http:// or https://';
    }
    
    if (formData.booking_url && !urlRegex.test(formData.booking_url)) {
        errors.booking_url = 'URL must start with http:// or https://';
    }
    
    if (formData.others && !urlRegex.test(formData.others)) {
        errors.others = 'URL must start with http:// or https://';
    }

    return errors;
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    // Clear error when user types
    if (fieldErrors[e.target.name]) {
        setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file size validation (Limit: 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert("File size too large! Please upload an image smaller than 2MB.");
        return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'e-name-card');
    data.append('cloud_name', 'du9br1qnu');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/du9br1qnu/image/upload', {
        method: 'POST',
        body: data,
      });
      const image = await res.json();
      if (image.secure_url) {
        setFormData(prev => ({ ...prev, avatar: image.secure_url }));
      }
    } catch (err) {
      console.error('Upload failed', err);
      setErrorMsg('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // Scroll to first error
        const firstErrorKey = Object.keys(errors)[0];
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
        return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        referred_by: referredBy,
        tag_id: tagId // Pass the NFC tag ID if present
      };

      const res = await fetch('/api/create-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
         throw new Error(data.error || 'Failed to create card'); 
      }

      router.push(`/user/${data.id}?new=true`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#dae5e7] dark:border-primary/20">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
            <div className="text-primary flex size-10 items-center justify-start cursor-pointer hover:bg-black/5 rounded-full" onClick={() => router.back()}>
                <span className="material-symbols-outlined">arrow_back_ios</span>
            </div>
            <h2 className="text-[#101818] dark:text-white text-lg font-bold tracking-tight flex-1 text-center">Create Card</h2>
             <div className="flex w-10 items-center justify-end"></div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-2xl mx-auto pb-32">
        {/* Live Preview Section */}
        <section className="p-6">
            <h4 className="text-primary text-[10px] font-extrabold leading-normal tracking-[0.2em] mb-4 text-center uppercase">Live Digital Preview</h4>
            {/* Text-based Minimalist Card - Scaled Down */}
            <div className="preview-card-shadow bg-white dark:bg-white/5 border border-[#dae5e7] dark:border-primary/30 rounded p-6 min-h-[180px] flex flex-col justify-between transition-all duration-300 max-w-[90%] mx-auto relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
                     <Image src="/claunode_logo.png" alt="Logo" width={20} height={8} className="object-contain" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-primary text-[10px] font-bold tracking-[0.15em] uppercase mb-1">{formData.title || 'Job Title'}</span>
                    <h1 className="text-[#101818] dark:text-white text-2xl font-extrabold tracking-tighter leading-none mb-2">{formData.name || 'Your Name'}</h1>
                    <p className="text-[#5e888d] dark:text-[#a0c4c8] text-xs font-medium leading-relaxed max-w-[240px]">{formData.company || 'Company Name'}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-dashed border-[#dae5e7] dark:border-primary/20 flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">call</span>
                        <span className="text-[#101818] dark:text-white text-[10px] font-bold">{formData.phone ? (formData.area_code ? `+${formData.area_code} ${formData.phone}` : formData.phone) : 'Phone Number'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">alternate_email</span>
                        <span className="text-[#101818] dark:text-white text-[10px] font-bold">{formData.email || 'email@example.com'}</span>
                    </div>
                </div>
            </div>
        </section>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-2">
            {/* IDENTITY Section */}
            <div className="bg-white dark:bg-white/5 py-4">
                <h3 className="text-[#101818] dark:text-white text-xs font-black leading-tight tracking-[0.15em] px-6 py-4 uppercase">Identity & Security</h3>
                <div className="px-6 py-2">
                    <label className="flex flex-col w-full mb-4">
                         <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Edit Password / PIN</p>
                         <p className="text-[10px] text-[#657b86] dark:text-[#a0c4c8]/70 mb-2">You will need this to edit your card later.</p>
                         <input 
                            name="password" 
                            type="text" 
                            required 
                            maxLength={6}
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal transition-colors`}
                            placeholder="e.g. 1234AB (6 chars)" 
                            value={formData.password} 
                            onChange={handleChange}
                        />
                        {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.password}</p>}
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Full Name</p>
                        <input 
                            name="name" 
                            type="text" 
                            required 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal transition-colors`}
                            placeholder="e.g. Alex Rivera" 
                            value={formData.name} 
                            onChange={handleChange}
                        />
                        {fieldErrors.name && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.name}</p>}
                    </label>

                    <label className="flex flex-col w-full mt-4">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Profile Picture (Optional)</p>
                        <div className="flex items-center gap-4">
                            {formData.avatar && (
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#dae5e7]">
                                    <Image src={formData.avatar} alt="Preview" fill className="object-cover" unoptimized />
                                </div>
                            )}
                            <label className={`flex items-center justify-center h-12 px-4 rounded-lg border border-[#dae5e7] dark:border-primary/20 bg-background-light dark:bg-background-dark/40 cursor-pointer hover:bg-black/5 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className="text-[#101818] dark:text-white text-sm font-medium">
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </label>
                </div>
            </div>

            {/* PROFESSIONAL Section */}
            <div className="bg-white dark:bg-white/5 py-4">
                <h3 className="text-[#101818] dark:text-white text-xs font-black leading-tight tracking-[0.15em] px-6 py-4 uppercase">Professional</h3>
                <div className="flex flex-col sm:flex-row gap-2 px-6">
                    <label className="flex flex-col flex-1">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Job Title</p>
                        <input 
                            name="title" 
                            type="text" 
                            required 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="e.g. Designer" 
                            value={formData.title} 
                            onChange={handleChange}
                        />
                         {fieldErrors.title && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.title}</p>}
                    </label>
                    <label className="flex flex-col flex-1 mt-4 sm:mt-0">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Company</p>
                        <input 
                            name="company" 
                            type="text" 
                            required 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.company ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="Company Name" 
                            value={formData.company} 
                            onChange={handleChange}
                        />
                         {fieldErrors.company && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.company}</p>}
                    </label>
                </div>
            </div>

             {/* CONNECTIVITY Section */}
            <div className="bg-white dark:bg-white/5 py-4">
                <h3 className="text-[#101818] dark:text-white text-xs font-black leading-tight tracking-[0.15em] px-6 py-4 uppercase">Connectivity</h3>
                <div className="px-6 space-y-4">
                    <label className="flex flex-col w-full">
                         <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Phone</p>
                         <div className="flex gap-2">
                             <select 
                                name="area_code" 
                                required
                                className="w-32 rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dae5e7] dark:border-primary/20 bg-background-light dark:bg-background-dark/40 h-12 px-4 text-base font-normal"
                                value={formData.area_code} 
                                onChange={handleChange}
                             >
                                {AREA_CODES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                             </select>
                             <input 
                                name="phone" 
                                type="tel" 
                                required 
                                className={`flex-1 rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                                placeholder="Phone Number" 
                                value={formData.phone} 
                                onChange={handleChange}
                             />
                         </div>
                         {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.phone}</p>}
                    </label>
                    
                    <label className="flex items-center gap-2">
                        <input
                            id="is_whatsapp"
                            name="is_whatsapp"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-[#dae5e7] rounded"
                            checked={formData.is_whatsapp}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-[#101818] dark:text-white">Enable WhatsApp Chat</span>
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Email</p>
                        <input 
                            name="email" 
                            type="email" 
                            required 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="Email Address" 
                            value={formData.email} 
                            onChange={handleChange}
                        />
                         {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.email}</p>}
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">LinkedIn (Optional)</p>
                        <input 
                            name="linkedin" 
                            type="url" 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.linkedin ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="https://linkedin.com/in/..." 
                            value={formData.linkedin} 
                            onChange={handleChange}
                        />
                         {fieldErrors.linkedin && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.linkedin}</p>}
                    </label>

                    <label className="flex flex-col w-full">                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Booking / Meeting URL (Optional)</p>
                        <input 
                            name="booking_url" 
                            type="url" 
                             className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.booking_url ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="https://calendly.com/..." 
                            value={formData.booking_url} 
                            onChange={handleChange}
                        />
                         {fieldErrors.booking_url && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.booking_url}</p>}
                    </label>

                    <label className="flex flex-col w-full">                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Other URL (Optional)</p>
                        <input 
                            name="others" 
                            type="url" 
                            className={`w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border ${fieldErrors.others ? 'border-red-500 focus:ring-red-500' : 'border-[#dae5e7] dark:border-primary/20'} bg-background-light dark:bg-background-dark/40 h-12 placeholder:text-[#dae5e7] p-4 text-base font-normal`}
                            placeholder="https://yourwebsite.com" 
                            value={formData.others} 
                            onChange={handleChange}
                        />
                        {fieldErrors.others && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{fieldErrors.others}</p>}
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-[#5e888d] dark:text-[#a0c4c8] text-[11px] font-bold uppercase tracking-wider pb-2">Bio (Optional)</p>
                        <textarea 
                            name="bio"
                            className="w-full rounded-lg text-[#101818] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dae5e7] dark:border-primary/20 bg-background-light dark:bg-background-dark/40 h-24 placeholder:text-[#dae5e7] p-4 text-base font-normal resize-none" 
                            placeholder="A short bio about yourself..." 
                            value={formData.bio} 
                            onChange={handleChange}
                        />
                    </label>
                </div>
            </div>

            {status === 'error' && (
             <p className="text-red-500 text-center text-sm px-6">
               Error: {errorMsg}
             </p>
            )}
        </form>
      </main>

      {/* Fixed Footer Action */}
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pt-12 z-40">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                <button 
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    className="w-full bg-primary hover:bg-[#005a63] text-white py-4 rounded shadow-lg shadow-primary/20 text-sm font-bold tracking-[0.1em] uppercase transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {status === 'loading' ? 'Creating...' : 'Save Card'}
                </button>
            </div>
        </footer>
    </div>
  );
}

export default function CreateCard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <CreateCardContent />
    </Suspense>
  );
}

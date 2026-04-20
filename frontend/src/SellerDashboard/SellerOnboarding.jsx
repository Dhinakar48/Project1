import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaStore, FaFileInvoiceDollar, FaBuildingColumns, FaShieldHalved, FaFileSignature, FaArrowRight, FaArrowLeft, FaCheck, FaIdCard, FaImage } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = [
  { id: 'business', title: 'Business Verification', icon: FaBuilding, subtitle: 'Tell us about your company' },
  { id: 'store', title: 'Store Setup', icon: FaStore, subtitle: 'Define your storefront' },
  { id: 'tax', title: 'Tax Details', icon: FaFileInvoiceDollar, subtitle: 'GST & Regulatory Info' },
  { id: 'bank', title: 'Bank Details', icon: FaBuildingColumns, subtitle: 'Where to send your payouts' },
  { id: 'kyc', title: 'KYC Verifications', icon: FaShieldHalved, subtitle: 'Identity confirmation' },
  { id: 'agreements', title: 'Agreements', icon: FaFileSignature, subtitle: 'Review and sign terms' }
];

export default function SellerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    businessName: '',
    businessType: 'Proprietorship',
    address: '',
    address2: '',
    city: '',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '',
    storeName: '',
    category: '',
    description: '',
    logoUrl: '',
    gstin: '',
    pan: '',
    stateCode: '',
    accHolder: '',
    accNumber: '',
    ifsc: '',
    bankName: '',
    accType: 'Current',
    aadhar: '',
    aadharFile: null,
    proofFile: null,
    agreed: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOnboardingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setOnboardingData(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final submit
      const email = localStorage.getItem('onboardingSellerEmail');
      if (email) {
        try {
          await axios.post("http://127.0.0.1:5000/seller-onboarding", {
            email: email,
            storeName: onboardingData.storeName || onboardingData.businessName,
            gstin: onboardingData.gstin,
            pan: onboardingData.pan,
            aadhar: onboardingData.aadhar,
            description: onboardingData.description,
            logoUrl: onboardingData.logoUrl,
            bankDetails: {
              accHolder: onboardingData.accHolder,
              accNumber: onboardingData.accNumber,
              ifsc: onboardingData.ifsc,
              bankName: onboardingData.bankName,
              accType: onboardingData.accType
            },
            addressDetails: {
              address1: onboardingData.address,
              address2: onboardingData.address2,
              city: onboardingData.city,
              state: onboardingData.state,
              pincode: onboardingData.pincode,
              country: onboardingData.country,
              fullName: onboardingData.businessName
            }
          });

          localStorage.removeItem('onboardingSellerEmail');
          localStorage.setItem('sellerActiveTab', 'Overview');
          localStorage.setItem('isSellerAuthenticated', 'true');

          alert("Verification successful! Welcome to your dashboard.");
          navigate('/seller-dashboard');
        } catch (err) {
          console.error(err);
          alert("Error during onboarding. Please try again.");
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Legal Business Name</label>
              <input type="text" name="businessName" value={onboardingData.businessName} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Registered entity name" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Business Type</label>
                <select name="businessType" value={onboardingData.businessType} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800">
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>Private Ltd</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">GSTIN Number</label>
                <input type="text" name="gstin" value={onboardingData.gstin} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="15-digit GST Number" required />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Business Address Line 1</label>
              <textarea name="address" value={onboardingData.address} onChange={handleChange} rows="2" className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Street, building etc." required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Business Address Line 2 (Optional)</label>
              <textarea name="address2" value={onboardingData.address2} onChange={handleChange} rows="2" className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Floor, unit, etc." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">City</label>
                <input type="text" name="city" value={onboardingData.city} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="City" required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Zip Code / Pincode</label>
                <input type="text" name="pincode" value={onboardingData.pincode} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="6-digit ZIP" required />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">State</label>
                <select name="state" value={onboardingData.state} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800">
                  <option>Tamil Nadu</option>
                  <option>Karnataka</option>
                  <option>Kerala</option>
                  <option>Andhra Pradesh</option>
                  <option>Telangana</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Country</label>
                <select name="country" value={onboardingData.country} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div className="flex gap-4 items-end">
              <div className="w-16 shrink-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block mb-1.5 text-center">Logo</label>
                <div className="relative border-2 border-dashed border-stone-200 bg-stone-50 rounded-xl h-12 flex items-center justify-center hover:bg-stone-100/50 transition-colors cursor-pointer group">
                  <input type="file" name="logoUrl" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <FaImage className="text-amber-500 text-lg group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block mb-1.5">Store Display Name</label>
                <input type="text" name="storeName" value={onboardingData.storeName} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl h-12 px-4 outline-none focus:border-amber-400 transition-colors text-xs font-semibold text-stone-800" placeholder="Ex: Pixel Perfect Electronics" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Primary Product Category</label>
              <input type="text" name="category" value={onboardingData.category} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl h-12 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Ex: Virtual Reality Headsets" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Store Description</label>
              <textarea name="description" value={onboardingData.description} onChange={handleChange} rows="3" className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Brief description of your store" required />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">PAN Number</label>
              <input type="text" name="pan" value={onboardingData.pan} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="10-digit PAN" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">State Code</label>
              <input type="text" name="stateCode" value={onboardingData.stateCode} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" placeholder="Ex: 29 (Karnataka)" required />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Account Holder Name</label>
              <input type="text" name="accHolder" onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Bank Account Number</label>
                <input
                  type="password"
                  name="accNumber"
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Confirm Account Number</label>
                <input
                  type="text"
                  id="confirmAccount"
                  placeholder="Re-enter to confirm"
                  className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800"
                  required
                  onChange={(e) => {
                    if (onboardingData.accNumber !== e.target.value) {
                      e.target.setCustomValidity("Account numbers do not match.");
                    } else {
                      e.target.setCustomValidity("");
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">IFSC Code</label>
                <input type="text" name="ifsc" value={onboardingData.ifsc} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Bank Name</label>
                <input type="text" name="bankName" value={onboardingData.bankName} onChange={handleChange} className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 px-4 outline-none focus:border-amber-400 mt-1 transition-colors text-xs font-semibold text-stone-800" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Account Type</label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="accType" value="Current" checked={onboardingData.accType === 'Current'} onChange={handleChange} className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300" />
                  <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors uppercase tracking-widest">Current</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="accType" value="Savings" checked={onboardingData.accType === 'Savings'} onChange={handleChange} className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300" />
                  <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors uppercase tracking-widest">Savings</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">12-Digit Aadhar Number</label>
              <div className="relative group mt-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors">
                  <FaIdCard size={14} />
                </div>
                <input type="text" name="aadhar" value={onboardingData.aadhar} onChange={handleChange} placeholder="XXXX XXXX XXXX" className="w-full bg-white shadow-sm border border-stone-200/60 focus:bg-white focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-400 transition-colors text-xs font-semibold text-stone-800 tracking-widest" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative border-2 border-dashed border-stone-200 bg-stone-50 rounded-2xl p-6 text-center hover:bg-stone-100/50 transition-colors cursor-pointer group">
                <input type="file" name="aadharFile" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <FaImage className="text-amber-500 text-xl" />
                </div>
                <p className="font-bold text-stone-900 text-sm">Aadhar Image</p>
                <p className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mt-1 mb-4">Front & Back (JPG/PNG)</p>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl group-hover:bg-stone-300 transition-colors">Select Image</button>
              </div>
              <div className="relative border-2 border-dashed border-stone-200 bg-stone-50 rounded-2xl p-6 text-center hover:bg-stone-100/50 transition-colors cursor-pointer group">
                <input type="file" name="proofFile" onChange={handleFileChange} accept="application/pdf, image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <FaBuilding className="text-amber-500 text-xl" />
                </div>
                <p className="font-bold text-stone-900 text-sm">Business Proof</p>
                <p className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mt-1 mb-4">Registration (PDF)</p>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl group-hover:bg-stone-300 transition-colors">Select Doc</button>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-xs text-stone-600 h-40 overflow-y-auto font-medium leading-relaxed shadow-inner">
              <h4 className="font-black text-stone-900 text-sm uppercase tracking-tight mb-4">ElectroShop Merchant Agreement</h4>
              <p className="mb-3">1. <strong className="text-stone-800">Fulfillment:</strong> The seller agrees to fulfill all registered orders accurately within 48 hours of receipt.</p>
              <p className="mb-3">2. <strong className="text-stone-800">Authenticity:</strong> All products listed for sale must be 100% genuine, directly sourced, and completely legal.</p>
              <p className="mb-3">3. <strong className="text-stone-800">Platform Fees:</strong> ElectroShop retains a mandatory platform fee of 5% on all successful monetary transactions.</p>
              <p className="mb-3">4. <strong className="text-stone-800">Returns:</strong> Returns and refunds will be strictly processed based on the platform's universal 14-day return policy without exception.</p>
              <p>5. <strong className="text-stone-800">Quality Standard:</strong> The seller agrees to maintain an overall average rating of 4.0 stars to retain verified merchant privileges on the marketplace.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer mt-4 group">
              <input type="checkbox" name="agreed" checked={onboardingData.agreed} onChange={handleChange} className="mt-0.5 w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-500" required />
              <span className="text-[11px] font-bold leading-tight text-stone-600 group-hover:text-stone-900 transition-colors uppercase tracking-wide">I digitally sign and agree to all the binding terms and conditions outlined in the ElectroShop Merchant Agreement.</span>
            </label>
          </div>
        )
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">

      {/* Left Side: Stepper */}
      <div className="w-full md:w-[40%] lg:w-[35%] bg-stone-900 p-10 lg:p-20 text-white flex flex-col relative overflow-hidden h-screen">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-stone-800 rounded-full blur-[100px]" />

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Electro<span className="text-amber-500">Shop</span></h2>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-16">New Merchant Setup</p>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isPast = currentStep > index;

              return (
                <div key={step.id} className="flex gap-6 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-colors duration-500 ${isActive ? 'bg-amber-500 text-stone-900 shadow-xl shadow-amber-500/30' : isPast ? 'bg-stone-800 text-amber-500' : 'bg-stone-800/50 text-stone-600'}`}>
                      {isPast ? <FaCheck size={16} /> : <step.icon size={18} />}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`w-0.5 h-full absolute top-12 transition-colors duration-500 ${isPast ? 'bg-amber-500/50' : 'bg-stone-800/50'}`} />
                    )}
                  </div>
                  <div className={`pt-2 transition-opacity duration-500 ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-40'}`}>
                    <h3 className="font-black uppercase tracking-wider text-sm">{step.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{step.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="flex-1 px-10 md:px-16 lg:px-24 xl:px-40 flex flex-col bg-gradient-to-br from-white to-stone-50/50 h-screen overflow-hidden justify-center relative">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-200/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-stone-300/20 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-2xl mx-auto flex flex-col justify-center h-full py-10 relative z-10">

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-black uppercase tracking-tight text-stone-900 mb-2">{steps[currentStep]?.title || 'Loading...'}</h2>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-10">{steps[currentStep]?.subtitle || ''}</p>

                <form id="onboarding-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  {renderStepContent()}
                </form>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center shrink-0">
            <button
              onClick={handleBack}
              className={`flex items-center gap-3 text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
            >
              <FaArrowLeft size={14} /> Previous Step
            </button>

            <button
              type="submit"
              form="onboarding-form"
              className="bg-stone-900 hover:bg-stone-800 text-amber-500 px-8 py-4 rounded-2xl flex items-center gap-4 font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 shadow-2xl shadow-stone-900/10 active:scale-[0.98]"
            >
              {currentStep === steps.length - 1 ? 'Finish Setup' : 'Save & Continue'} <FaArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

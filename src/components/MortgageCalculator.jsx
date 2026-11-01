import React, { useState } from 'react';
import { 
  Calculator, DollarSign, Percent, Calendar, ShieldCheck, 
  HelpCircle, ChevronDown, ChevronUp, Check, ArrowRight,
  Sparkles, FileText, Landmark, Clock, Award
} from 'lucide-react';

export default function MortgageCalculator({
  property,
  onContactAdvisor,
  showToast
}) {
  // Base raw price in USD
  const initialUsdPrice = property?.price || 15000000;
  
  // State
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'AED'
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(25);
  const [interestRate, setInterestRate] = useState(4.85);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeServiceCharges, setIncludeServiceCharges] = useState(true);
  const [showUpfrontBreakdown, setShowUpfrontBreakdown] = useState(false);
  const [preApprovalRequested, setPreApprovalRequested] = useState(false);

  // Conversion rate (1 USD = 3.6725 AED)
  const exchangeRate = currency === 'AED' ? 3.6725 : 1;
  const currencySymbol = currency === 'AED' ? 'AED ' : '$';

  // Base price in current currency
  const propertyPrice = Math.round(initialUsdPrice * exchangeRate);

  // Calculations
  const downPaymentAmount = Math.round(propertyPrice * (downPaymentPercent / 100));
  const loanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);

  const monthlyInterestRate = (interestRate / 100) / 12;
  const numberOfPayments = loanTermYears * 12;

  // Monthly Principal & Interest Formula
  let monthlyPI = 0;
  if (loanPrincipal > 0 && numberOfPayments > 0) {
    if (monthlyInterestRate === 0) {
      monthlyPI = loanPrincipal / numberOfPayments;
    } else {
      monthlyPI = loanPrincipal * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }
  }

  // Estimated Taxes / Municipality fees (approx 0.25% per annum)
  const monthlyTax = includeTaxes ? Math.round((propertyPrice * 0.0025) / 12) : 0;

  // Estimated Luxury Estate Home Insurance (approx 0.12% per annum)
  const monthlyInsurance = includeInsurance ? Math.round((propertyPrice * 0.0012) / 12) : 0;

  // Estimated Service Charges / HOA Maintenance (approx based on sqft)
  const propertySqft = property?.sqft || 6500;
  const monthlyHOA = includeServiceCharges 
    ? Math.round(propertySqft * (currency === 'AED' ? 0.75 : 0.20))
    : 0;

  // Total Estimated Monthly
  const totalMonthly = Math.round(monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA);

  // Total Loan Details
  const totalLoanRepayment = Math.round(monthlyPI * numberOfPayments);
  const totalInterestPaid = Math.max(0, totalLoanRepayment - loanPrincipal);

  // Estimated Upfront Purchase Costs (standard UAE real estate structure)
  const dldTransferFee = Math.round(propertyPrice * 0.04); // 4% DLD
  const registrationTrusteeFee = currency === 'AED' ? 4200 : 1150;
  const mortgageRegistrationFee = Math.round(loanPrincipal * 0.0025); // 0.25% of loan
  const valuationFee = currency === 'AED' ? 3150 : 850;
  const totalUpfrontFees = dldTransferFee + registrationTrusteeFee + mortgageRegistrationFee + valuationFee;
  const totalDueAtClosing = downPaymentAmount + totalUpfrontFees;

  // Percentages for the Visual Progress Bar
  const piShare = totalMonthly > 0 ? (monthlyPI / totalMonthly) * 100 : 0;
  const taxShare = totalMonthly > 0 ? (monthlyTax / totalMonthly) * 100 : 0;
  const insuranceShare = totalMonthly > 0 ? (monthlyInsurance / totalMonthly) * 100 : 0;
  const hoaShare = totalMonthly > 0 ? (monthlyHOA / totalMonthly) * 100 : 0;

  const formatMoney = (amount) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const handlePreApproval = (e) => {
    e.preventDefault();
    setPreApprovalRequested(true);
    if (showToast) {
      showToast(`Financing consultation requested for ${property?.title || 'this residence'}. Our private mortgage advisory desk will contact you within 2 hours.`, 'success');
    }
    if (onContactAdvisor) {
      onContactAdvisor({
        name: 'Novalux Private Capital Desk',
        title: 'Senior Mortgage & Structured Finance Advisor'
      });
    }
  };

  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      
      {/* 1. Header with Currency Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Calculator size={17} />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold">
              Financing & Investment Desk
            </span>
          </div>
          <h3 className="text-[22px] sm:text-[24px] font-bold text-gray-900 tracking-tight font-sans">
            Mortgage & Acquisition Calculator
          </h3>
          <p className="text-[13px] text-gray-500 max-w-xl">
            Estimate your monthly payments, down payment structure, and upfront acquisition fees for {property?.title}.
          </p>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currency === 'USD'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            USD ($)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('AED')}
            className={`text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currency === 'AED'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            AED (د.إ)
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Grid: Inputs on Left, Results & Visual Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* LEFT COLUMN: Interactive Parameter Inputs (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Property Price Readout */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                Purchase Price
              </label>
              <span className="text-[11px] text-gray-500 font-mono">
                {property?.listingType || 'FOR SALE'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formatMoney(propertyPrice)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[16px] font-bold text-gray-900 cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 font-mono">
                {currency}
              </span>
            </div>
          </div>

          {/* B. Down Payment Controls (Percentage Chips + Slider) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                Down Payment
              </label>
              <div className="text-[13px] font-extrabold text-black">
                {formatMoney(downPaymentAmount)} <span className="text-gray-500 font-medium text-xs">({downPaymentPercent}%)</span>
              </div>
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-5 gap-2">
              {[15, 20, 25, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-2 text-[12px] font-bold rounded-lg border transition-all cursor-pointer ${
                    downPaymentPercent === pct
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>Min (10%)</span>
              <span>Standard UAE VIP (20% - 25%)</span>
              <span>Max (60%)</span>
            </div>
          </div>

          {/* C. Loan Term Selection */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
              Loan Term
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 20, 25, 30].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setLoanTermYears(years)}
                  className={`py-2.5 text-[12px] font-bold rounded-lg border transition-all cursor-pointer ${
                    loanTermYears === years
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                  }`}
                >
                  {years} Years
                </button>
              ))}
            </div>
          </div>

          {/* D. Interest Rate Slider & Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                Interest Rate (Fixed / Variable)
              </label>
              <div className="text-[13px] font-bold text-black flex items-center gap-1">
                <span>{interestRate.toFixed(2)}%</span>
                <span className="text-gray-400 text-xs font-normal">per annum</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2.5"
                max="8.5"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="flex-1 accent-black cursor-pointer h-1.5 bg-gray-200 rounded-lg"
              />
              <div className="w-24 shrink-0 relative">
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="15"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-gray-900 text-right pr-6 focus:outline-none focus:border-black"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* E. Included Fees Toggles */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold block">
              Include In Monthly Estimation:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeTaxes}
                  onChange={(e) => setIncludeTaxes(e.target.checked)}
                  className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                />
                <span className="text-[12px] font-medium text-gray-700">Municipality & Tax</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                />
                <span className="text-[12px] font-medium text-gray-700">Homeowner Insurance</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeServiceCharges}
                  onChange={(e) => setIncludeServiceCharges(e.target.checked)}
                  className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                />
                <span className="text-[12px] font-medium text-gray-700">HOA / Service Fees</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Results, Breakdown Bar & Pre-Approval CTA (5 Columns) */}
        <div className="lg:col-span-5 bg-stone-50 border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 space-y-6">
          
          {/* Total Monthly Payment Display */}
          <div className="text-center pb-5 border-b border-gray-200/80">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
              Estimated Total Payment
            </span>
            <div className="text-[34px] sm:text-[40px] font-extrabold text-black tracking-tight leading-none font-sans">
              {formatMoney(totalMonthly)}
              <span className="text-[14px] text-gray-500 font-medium ml-1">/ month</span>
            </div>
            <p className="text-[12px] text-gray-500 mt-2">
              Principal loan: {formatMoney(loanPrincipal)} over {loanTermYears} years
            </p>
          </div>

          {/* Visual Stacked Progress Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${piShare}%` }} 
                className="bg-black h-full transition-all duration-300" 
                title={`Principal & Interest: ${formatMoney(Math.round(monthlyPI))}`} 
              />
              <div 
                style={{ width: `${taxShare}%` }} 
                className="bg-amber-600 h-full transition-all duration-300" 
                title={`Municipality & Tax: ${formatMoney(monthlyTax)}`} 
              />
              <div 
                style={{ width: `${insuranceShare}%` }} 
                className="bg-emerald-600 h-full transition-all duration-300" 
                title={`Home Insurance: ${formatMoney(monthlyInsurance)}`} 
              />
              <div 
                style={{ width: `${hoaShare}%` }} 
                className="bg-blue-600 h-full transition-all duration-300" 
                title={`HOA / Service: ${formatMoney(monthlyHOA)}`} 
              />
            </div>

            {/* Breakdown Legend Table */}
            <div className="space-y-2 pt-2 text-[12px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                  <span className="text-gray-700 font-medium">Principal & Interest</span>
                </div>
                <span className="font-bold text-gray-900">{formatMoney(Math.round(monthlyPI))}</span>
              </div>

              {includeTaxes && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                    <span className="text-gray-700 font-medium">Municipality & Property Tax</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatMoney(monthlyTax)}</span>
                </div>
              )}

              {includeInsurance && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="text-gray-700 font-medium">Homeowners Insurance</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatMoney(monthlyInsurance)}</span>
                </div>
              )}

              {includeServiceCharges && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-gray-700 font-medium">HOA & Master Community</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatMoney(monthlyHOA)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upfront Fees Accordion Breakdown */}
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowUpfrontBreakdown(!showUpfrontBreakdown)}
              className="w-full flex items-center justify-between text-[12px] font-bold text-gray-800 hover:text-black py-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Landmark size={14} className="text-amber-700" />
                <span>Estimated Upfront Cash Required</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-black">{formatMoney(totalDueAtClosing)}</span>
                {showUpfrontBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showUpfrontBreakdown && (
              <div className="mt-2.5 p-3 rounded-xl bg-white border border-gray-200 text-[11px] space-y-1.5 divide-y divide-gray-100 animate-fade-in">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-600">Down Payment ({downPaymentPercent}%)</span>
                  <span className="font-bold text-gray-900">{formatMoney(downPaymentAmount)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-600">Land Department Transfer Fee (4%)</span>
                  <span className="font-bold text-gray-900">{formatMoney(dldTransferFee)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-600">Mortgage Registration (0.25%)</span>
                  <span className="font-bold text-gray-900">{formatMoney(mortgageRegistrationFee)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-600">Trustee & Bank Valuation Fees</span>
                  <span className="font-bold text-gray-900">{formatMoney(registrationTrusteeFee + valuationFee)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pre-Approval VIP Action CTA */}
          <div className="pt-3">
            {preApprovalRequested ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-[13px]">
                  <Check size={16} />
                  <span>Pre-Approval Request Received</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Our Private Capital Advisor has been notified.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePreApproval}
                className="w-full py-3 px-4 rounded-xl bg-black text-white text-[13px] font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Get Pre-Approved with Private Capital</span>
                <ArrowRight size={13} />
              </button>
            )}
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[10px] text-center mt-2 font-mono">
              <ShieldCheck size={12} className="text-gray-500" />
              <span>Tailored rates available for resident & non-resident investors</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}


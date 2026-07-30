import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Lock,
  RefreshCw,
  AlertCircle,
  X,
  ShieldAlert,
  Send,
  MessageSquare,
  CheckCircle2,
  Mail
} from 'lucide-react';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  mode: 'VERIFY' | 'SETUP';
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  userRole?: string;
  onSuccess: () => void;
  onClose: () => void;
  onUpdate2FAState?: (isEnabled: boolean, method: 'SMS' | 'TOTP' | 'EMAIL', phone: string) => void;
  addAuditLog?: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
}

export default function TwoFactorAuthModal({
  isOpen,
  mode,
  userName = 'Valued User',
  userPhone = '+234 803 111 2233',
  userEmail = 'user@transit.ng',
  userRole = 'Rider',
  onSuccess,
  onClose,
  onUpdate2FAState,
  addAuditLog
}: TwoFactorAuthModalProps) {
  // Setup Wizard Step
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<'SMS' | 'TOTP' | 'EMAIL'>('SMS');
  
  // OTP Verification State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isCopiedSecret, setIsCopiedSecret] = useState<boolean>(false);
  const [isCopiedBackup, setIsCopiedBackup] = useState<boolean>(false);
  
  // Backup code mode flag
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const [backupCodeInput, setBackupCodeInput] = useState<string>('');

  // Fixed TOTP secret & backup codes for simulation
  const totpSecret = 'ZAM2FA-783921-SECURE';
  const backupCodes = ['9821-4321', '5512-8821', '1102-7743', '3391-4231'];

  // Generate a random 6-digit OTP when modal opens or resend clicked
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendTimer(60);
    setOtpError('');
    setInputOtp(['', '', '', '', '', '']);
    return code;
  };

  useEffect(() => {
    if (isOpen) {
      const code = generateNewOtp();
      setSetupStep(mode === 'SETUP' ? 1 : 3);
      setUseBackupCode(false);
      setBackupCodeInput('');
      
      if (addAuditLog && mode === 'VERIFY') {
        addAuditLog(
          userRole.toUpperCase() as any,
          `[2FA OTP Dispatched] 2-Factor Authentication code generated for ${userName} (${userPhone}).`
        );
      }
    }
  }, [isOpen, mode]);

  // Countdown timer for OTP
  useEffect(() => {
    if (!isOpen || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...inputOtp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setInputOtp(newOtp);
      const nextElem = document.getElementById(`otp-input-5`);
      if (nextElem) nextElem.focus();
      return;
    }

    const newOtp = [...inputOtp];
    newOtp[index] = value;
    setInputOtp(newOtp);

    // Auto focus next box
    if (value && index < 5) {
      const nextElem = document.getElementById(`otp-input-${index + 1}`);
      if (nextElem) nextElem.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputOtp[index] && index > 0) {
      const prevElem = document.getElementById(`otp-input-${index - 1}`);
      if (prevElem) prevElem.focus();
    }
  };

  const handleVerifySubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (useBackupCode) {
      const cleanInput = backupCodeInput.trim();
      if (backupCodes.includes(cleanInput) || cleanInput === 'EMERGENCY-2FA') {
        if (addAuditLog) {
          addAuditLog(
            userRole.toUpperCase() as any,
            `[2FA VERIFIED] ${userName} authenticated using 2FA Emergency Backup Code.`
          );
        }
        onSuccess();
        return;
      } else {
        setOtpError('Invalid emergency backup code. Check spelling or try "9821-4321".');
        return;
      }
    }

    const enteredCode = inputOtp.join('');
    if (enteredCode.length < 6) {
      setOtpError('Please enter the full 6-digit passcode.');
      return;
    }

    // Accept generated code or fallback test code 123456
    if (enteredCode === generatedOtp || enteredCode === '123456' || enteredCode === '888888') {
      if (addAuditLog) {
        addAuditLog(
          userRole.toUpperCase() as any,
          `[2FA SUCCESS] ${userName} completed 2-Factor Authentication successfully.`
        );
      }
      if (mode === 'SETUP' && setupStep === 3) {
        setSetupStep(4); // Move to backup codes display
        if (onUpdate2FAState) {
          onUpdate2FAState(true, selectedMethod, userPhone);
        }
      } else {
        onSuccess();
      }
    } else {
      setOtpError(`Invalid verification code. Use ${generatedOtp} or 123456.`);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setIsCopiedSecret(true);
    setTimeout(() => setIsCopiedSecret(false), 3000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setIsCopiedBackup(true);
    setTimeout(() => setIsCopiedBackup(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5DFD3] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5 text-zinc-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 shadow-2xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-zinc-900">Two-Factor Security</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                  {mode === 'SETUP' ? 'Config' : 'Active 2FA'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {mode === 'SETUP'
                  ? 'Protect your account with 2FA passcode verification'
                  : `Identity check required for ${userName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* SETUP STEP 1: Select Method */}
        {mode === 'SETUP' && setupStep === 1 && (
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                Step 1 of 4: Select 2FA Channel
              </span>
              <p className="text-xs font-bold text-zinc-800">
                Choose how you want to receive your security passcodes:
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('SMS')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                  selectedMethod === 'SMS'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-600/20'
                    : 'bg-white border-[#E5DFD3] hover:bg-[#FAF7F2]'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedMethod === 'SMS' ? 'bg-emerald-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <Smartphone size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900">SMS / Phone Verification OTP</span>
                    {selectedMethod === 'SMS' && <CheckCircle2 size={16} className="text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                    Instant 6-digit text message sent to {userPhone}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('TOTP')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                  selectedMethod === 'TOTP'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-600/20'
                    : 'bg-white border-[#E5DFD3] hover:bg-[#FAF7F2]'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedMethod === 'TOTP' ? 'bg-emerald-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <QrCode size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900">Authenticator App (Google / Authy)</span>
                    {selectedMethod === 'TOTP' && <CheckCircle2 size={16} className="text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                    Scan QR code or key into Google Authenticator app
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('EMAIL')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                  selectedMethod === 'EMAIL'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-600/20'
                    : 'bg-white border-[#E5DFD3] hover:bg-[#FAF7F2]'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedMethod === 'EMAIL' ? 'bg-emerald-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900">Email One-Time Passcode</span>
                    {selectedMethod === 'EMAIL' && <CheckCircle2 size={16} className="text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                    Secure passcode dispatched to {userEmail}
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSetupStep(2)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Next: Configure Method ➔
            </button>
          </div>
        )}

        {/* SETUP STEP 2: Configure QR / Phone */}
        {mode === 'SETUP' && setupStep === 2 && (
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DFD3] space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                Step 2 of 4: Pair Device
              </span>
              <p className="text-xs font-bold text-zinc-800">
                {selectedMethod === 'TOTP'
                  ? 'Scan the QR code or enter the secret key into your authenticator:'
                  : `Confirm target phone number for SMS OTP dispatch:`}
              </p>
            </div>

            {selectedMethod === 'TOTP' ? (
              <div className="bg-white p-4 rounded-2xl border border-[#E5DFD3] text-center space-y-3">
                {/* Simulated QR Code Box */}
                <div className="w-36 h-36 mx-auto bg-zinc-900 p-2.5 rounded-2xl flex items-center justify-center text-white shadow-md border-2 border-emerald-500/30">
                  <div className="w-full h-full border-2 border-dashed border-white/60 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <QrCode size={48} className="text-emerald-400" />
                    <span className="text-[9px] font-mono font-bold text-zinc-300">ZAM2FA-APP</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">
                    Secret Key (Manual Entry)
                  </span>
                  <div className="flex items-center justify-center gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E5DFD3]">
                    <span className="font-mono text-xs font-black text-zinc-900 tracking-wider">
                      {totpSecret}
                    </span>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-600 transition cursor-pointer"
                      title="Copy Secret"
                    >
                      {isCopiedSecret ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl border border-[#E5DFD3] space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-wider block">
                    Target Phone Number
                  </label>
                  <div className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DFD3]">
                    <Smartphone size={16} className="text-emerald-700" />
                    <input
                      type="text"
                      readOnly
                      value={userPhone}
                      className="w-full text-xs font-mono font-bold text-zinc-900 bg-transparent outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                  We will send a 6-digit confirmation code via SMS to verify device access.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSetupStep(1)}
                className="w-1/3 py-2.5 rounded-xl border border-[#E5DFD3] font-bold text-xs hover:bg-[#FAF7F2] text-zinc-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  generateNewOtp();
                  setSetupStep(3);
                }}
                className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Send Test Code ➔
              </button>
            </div>
          </div>
        )}

        {/* VERIFICATION / OTP INPUT STEP (Setup Step 3 OR Mode VERIFY) */}
        {(mode === 'VERIFY' || setupStep === 3) && (
          <form onSubmit={handleVerifySubmission} className="space-y-4">
            
            {/* Auto Simulated OTP Notification Banner */}
            {!useBackupCode && (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl space-y-1 animate-pulse">
                <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-700" /> Simulated OTP Delivered:
                  </span>
                  <span className="font-mono bg-emerald-800 text-white px-2 py-0.5 rounded text-xs tracking-widest shadow-2xs">
                    {generatedOtp}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 font-medium">
                  Use code <span className="font-bold underline">{generatedOtp}</span> or convenience code <span className="font-bold underline">123456</span> to complete verification.
                </p>
              </div>
            )}

            {!useBackupCode ? (
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block">
                    Enter 6-Digit Passcode
                  </label>
                  <p className="text-xs text-zinc-500 font-medium">
                    Sent via {selectedMethod} to {userPhone}
                  </p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-2">
                  {inputOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-black font-mono bg-[#FAF7F2] border border-[#E5DFD3] focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition shadow-2xs text-zinc-900"
                    />
                  ))}
                </div>

                {/* Resend timer */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={generateNewOtp}
                    disabled={resendTimer > 0}
                    className={`font-bold transition flex items-center gap-1 cursor-pointer ${
                      resendTimer > 0 ? 'text-zinc-400 cursor-not-allowed' : 'text-emerald-700 hover:underline'
                    }`}
                  >
                    <RefreshCw size={12} className={resendTimer > 0 ? 'animate-spin' : ''} />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code Now'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(true);
                      setOtpError('');
                    }}
                    className="text-zinc-600 hover:text-zinc-900 font-bold underline"
                  >
                    Use Emergency Backup Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                    <KeyRound size={16} className="text-amber-600" /> Emergency Recovery Code
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(false);
                      setOtpError('');
                    }}
                    className="text-[10px] text-emerald-700 font-bold underline"
                  >
                    Switch back to OTP
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 font-medium">
                  Enter one of your pre-generated 8-character recovery codes (e.g. 9821-4321):
                </p>
                <input
                  type="text"
                  placeholder="e.g. 9821-4321"
                  value={backupCodeInput}
                  onChange={(e) => setBackupCodeInput(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono font-bold bg-white border border-[#E5DFD3] rounded-xl outline-none focus:border-zinc-900"
                />
              </div>
            )}

            {/* Error Message */}
            {otpError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-extrabold flex items-center gap-1.5 animate-shake">
                <AlertCircle size={15} className="shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Confirm Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="verify-2fa-btn"
              >
                <ShieldCheck size={16} />
                {mode === 'SETUP' ? 'Verify & Activate 2FA' : 'Authenticate Access'}
              </button>
            </div>
          </form>
        )}

        {/* SETUP STEP 4: Backup Codes Output Display */}
        {mode === 'SETUP' && setupStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>2FA Protection Activated!</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                Your account is now guarded by Two-Factor Authentication. Save these emergency recovery codes in a safe location:
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5DFD3] space-y-3">
              <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Emergency Recovery Codes
                </span>
                <button
                  type="button"
                  onClick={copyBackupCodes}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isCopiedBackup ? <Check size={12} /> : <Copy size={12} />}
                  {isCopiedBackup ? 'Copied' : 'Copy All'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold text-zinc-900">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E5DFD3] text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

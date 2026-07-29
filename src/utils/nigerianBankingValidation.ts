export interface NigerianBank {
  code: string;
  name: string;
  nibssCode: string;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { code: '057', name: 'Zenith Bank', nibssCode: '000015' },
  { code: '011', name: 'FirstBank Nigeria', nibssCode: '000016' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)', nibssCode: '000013' },
  { code: '044', name: 'Access Bank', nibssCode: '000014' },
  { code: '033', name: 'United Bank for Africa (UBA)', nibssCode: '000004' },
  { code: '090267', name: 'Kuda Bank (Kuda MFB)', nibssCode: '090267' },
  { code: '999992', name: 'OPay Digital Services', nibssCode: '100004' },
  { code: '50515', name: 'Moniepoint Microfinance Bank', nibssCode: '50515' },
  { code: '221', name: 'Stanbic IBTC Bank', nibssCode: '000012' },
  { code: '232', name: 'Sterling Bank', nibssCode: '000001' },
  { code: '032', name: 'Union Bank of Nigeria', nibssCode: '000018' },
  { code: '070', name: 'Fidelity Bank', nibssCode: '000007' },
  { code: '214', name: 'First City Monument Bank (FCMB)', nibssCode: '000003' },
  { code: '076', name: 'Polaris Bank', nibssCode: '000008' },
  { code: '035', name: 'Wema Bank', nibssCode: '000017' },
  { code: '301', name: 'Jaiz Bank', nibssCode: '000006' },
  { code: '302', name: 'TajBank', nibssCode: '000026' }
];

export type CardBrand = 'verve' | 'mastercard' | 'visa' | 'unknown';

export function detectCardBrand(cardNumber: string): CardBrand {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (/^506[0-1]|^507[0-9]|^6500|^5018|^5020|^5038/.test(sanitized)) {
    return 'verve';
  }
  if (/^5[1-5]|^2[2-7]/.test(sanitized)) {
    return 'mastercard';
  }
  if (/^4/.test(sanitized)) {
    return 'visa';
  }
  return 'unknown';
}

export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (!sanitized || sanitized.length < 13 || sanitized.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export interface CardValidationErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  pin?: string;
}

export interface BankAccountValidationErrors {
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface CardValidationResult {
  isValid: boolean;
  errors: CardValidationErrors;
  cardBrand: CardBrand;
}

export interface BankAccountValidationResult {
  isValid: boolean;
  errors: BankAccountValidationErrors;
  resolvedAccountName?: string;
}

export function validateNigerianCard(data: {
  cardNumber: string;
  expiry: string;
  cvv: string;
  pin?: string;
  requirePin?: boolean;
}): CardValidationResult {
  const errors: CardValidationErrors = {};
  const sanitizedNo = data.cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(sanitizedNo);

  // 1. Card Number checks
  if (!sanitizedNo) {
    errors.cardNumber = 'Card number is required.';
  } else if (brand === 'verve' && sanitizedNo.length !== 16 && sanitizedNo.length !== 19) {
    errors.cardNumber = 'Nigerian Verve card number must be 16 or 19 digits.';
  } else if ((brand === 'visa' || brand === 'mastercard') && sanitizedNo.length !== 16) {
    errors.cardNumber = `${brand === 'visa' ? 'Visa' : 'Mastercard'} card must be exactly 16 digits.`;
  } else if (sanitizedNo.length < 15 || sanitizedNo.length > 19) {
    errors.cardNumber = 'Card number must be between 16 and 19 digits.';
  } else if (!validateLuhn(sanitizedNo)) {
    errors.cardNumber = 'Invalid card number (failed NIBSS/Luhn checksum validation). Check for typos.';
  }

  // 2. Expiry checks (MM/YY or MM/YYYY)
  if (!data.expiry) {
    errors.expiry = 'Expiry date is required.';
  } else {
    const expMatch = data.expiry.trim().match(/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/);
    if (!expMatch) {
      errors.expiry = 'Invalid expiry format. Use MM/YY (e.g. 08/28).';
    } else {
      const month = parseInt(expMatch[1], 10);
      let year = parseInt(expMatch[2], 10);
      if (year < 100) year += 2000;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card has expired. Please enter an active payment card.';
      }
    }
  }

  // 3. CVV checks
  const sanitizedCvv = data.cvv.replace(/\D/g, '');
  if (!sanitizedCvv) {
    errors.cvv = 'CVV code is required.';
  } else if (sanitizedCvv.length !== 3 && sanitizedCvv.length !== 4) {
    errors.cvv = 'CVV must be 3 digits (or 4 digits).';
  }

  // 4. Nigerian Card ATM PIN requirement
  if (data.requirePin) {
    const sanitizedPin = (data.pin || '').replace(/\D/g, '');
    if (!sanitizedPin) {
      errors.pin = '4-digit ATM PIN is required for Nigerian card authentication.';
    } else if (sanitizedPin.length !== 4) {
      errors.pin = 'ATM PIN must be exactly 4 digits.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cardBrand: brand
  };
}

export function validateNigerianBankAccount(data: {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
}): BankAccountValidationResult {
  const errors: BankAccountValidationErrors = {};
  const sanitizedAcc = data.accountNumber.replace(/\D/g, '');

  if (!data.bankCode) {
    errors.bankCode = 'Please select a CBN-licensed Nigerian commercial or digital bank.';
  }

  if (!sanitizedAcc) {
    errors.accountNumber = 'Account number is required.';
  } else if (sanitizedAcc.length !== 10) {
    errors.accountNumber = 'Standard NUBAN bank account number must be exactly 10 digits.';
  }

  if (data.accountName !== undefined && !data.accountName.trim()) {
    errors.accountName = 'Account holder name is required.';
  } else if (data.accountName && data.accountName.trim().length < 3) {
    errors.accountName = 'Account holder name must be at least 3 characters.';
  }

  let resolvedName: string | undefined = undefined;
  if (data.bankCode && sanitizedAcc.length === 10) {
    const bank = NIGERIAN_BANKS.find(b => b.code === data.bankCode);
    const bankLabel = bank ? bank.name : 'Commercial Bank';
    resolvedName = `${data.accountName?.trim() || 'Verified Holder'} (${bankLabel})`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    resolvedAccountName: resolvedName
  };
}

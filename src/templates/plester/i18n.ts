import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type PlesterText = {
  healedEyebrow: string;
  /** judul pengganti kalau ucapan utama kosong */
  titleFallback: string;
  eyebrow: string;
  you: string;
  fromName: string;
  healedAria: string;
  brokenAria: string;
  /** pembuka yang tenang, sebelum pengakuan */
  openA: string;
  openB: string;
  openCta: string;
  /** pengakuan di retakan */
  admitLabel: string;
  admitHint: string;
  crackAria: string;
  next: string;
  /** plester "tapi…" yang tidak mau menempel */
  butWord: string;
  butHint: string;
  butAria: string;
  butLine: string;
  /** janji di plester */
  promiseLabel: string;
  stickAria: string;
  countAria: string;
  hint: string;
  /** pertanyaan lembut */
  askEyebrow: string;
  askQ: string;
  forgive: string;
  needTime: string;
  forgiveReply: string;
  timeReply: string;
  sign: string;
  read: string;
  finaleEyebrow: string;
};

export const TEXT: Record<Locale, PlesterText> = {
  id: {
    healedEyebrow: 'hatinya utuh lagi',
    titleFallback: 'Maaf ya, {to}',
    eyebrow: 'sebuah permintaan maaf untuk',
    you: 'kamu',
    fromName: 'dari {name}',
    healedAria: 'Hati yang sudah utuh lagi',
    brokenAria: 'Hati yang retak',
    openA: '{to}, aku nggak mau minta maaf asal-asalan.',
    openB: 'Jadi aku mau ngaku dulu, satu per satu.',
    openCta: 'Aku dengerin',
    admitLabel: 'yang aku sadari · {i}/{n}',
    admitHint: 'Sentuh retakannya',
    crackAria: 'Retakan {i} dari {n}',
    next: 'Lanjut →',
    butWord: 'tapi…',
    butHint: 'Tempel plester yang ini?',
    butAria: 'Tempel plester bertuliskan “tapi”',
    butLine: 'Yang ini nggak jadi. Maaf ini nggak pakai “tapi”.',
    promiseLabel: 'janjiku · {i}/{n}',
    stickAria: 'Tempel plester {n}',
    countAria: '{stuck} dari {n} plester ditempel',
    hint: 'Ketuk plesternya, tempel di hati',
    askEyebrow: 'nggak harus dijawab sekarang',
    askQ: 'Kalau boleh tahu, hatimu sekarang gimana?',
    forgive: 'Aku maafkan',
    needTime: 'Aku butuh waktu',
    forgiveReply: 'Makasih, {to}. Aku nggak akan menyia-nyiakannya.',
    timeReply: 'Nggak apa-apa. Ambil waktu sebanyak yang kamu perlu. Aku tetap di sini.',
    sign: '— {name}',
    read: 'Baca suratnya →',
    finaleEyebrow: 'Dari hati yang sudah ditambal',
  },
  ms: {
    healedEyebrow: 'hatinya pulih semula',
    titleFallback: 'Maafkan aku, {to}',
    eyebrow: 'sebuah permohonan maaf untuk',
    you: 'awak',
    fromName: 'daripada {name}',
    healedAria: 'Hati yang dah pulih semula',
    brokenAria: 'Hati yang retak',
    openA: '{to}, aku tak nak minta maaf sambil lewa.',
    openB: 'Jadi biar aku mengaku dulu, satu per satu.',
    openCta: 'Aku dengar',
    admitLabel: 'yang aku sedar · {i}/{n}',
    admitHint: 'Sentuh retakannya',
    crackAria: 'Retakan {i} daripada {n}',
    next: 'Teruskan →',
    butWord: 'tapi…',
    butHint: 'Tampal plaster yang ini?',
    butAria: 'Tampal plaster bertulis “tapi”',
    butLine: 'Yang ini tak jadi. Maaf ini tak pakai “tapi”.',
    promiseLabel: 'janjiku · {i}/{n}',
    stickAria: 'Tampal plaster {n}',
    countAria: '{stuck} daripada {n} plaster ditampal',
    hint: 'Ketuk plaster, tampal di hati',
    askEyebrow: 'tak perlu jawab sekarang',
    askQ: 'Kalau boleh aku tahu, hati awak sekarang macam mana?',
    forgive: 'Aku maafkan',
    needTime: 'Aku perlukan masa',
    forgiveReply: 'Terima kasih, {to}. Aku tak akan sia-siakannya.',
    timeReply: 'Tak apa. Ambil masa selama mana yang awak perlu. Aku tetap di sini.',
    sign: '— {name}',
    read: 'Baca suratnya →',
    finaleEyebrow: 'Dari hati yang dah ditampal',
  },
  en: {
    healedEyebrow: 'whole again',
    titleFallback: 'I’m sorry, {to}',
    eyebrow: 'an apology for',
    you: 'you',
    fromName: 'from {name}',
    healedAria: 'A heart made whole again',
    brokenAria: 'A broken heart',
    openA: '{to}, I don’t want to say sorry the easy way.',
    openB: 'So let me own up first, one thing at a time.',
    openCta: 'I’m listening',
    admitLabel: 'what I realize · {i}/{n}',
    admitHint: 'Touch the cracks',
    crackAria: 'Crack {i} of {n}',
    next: 'Continue →',
    butWord: 'but…',
    butHint: 'Use this bandage?',
    butAria: 'Apply the bandage that says “but”',
    butLine: 'Not this one. This apology doesn’t come with a “but”.',
    promiseLabel: 'my promise · {i}/{n}',
    stickAria: 'Apply bandage {n}',
    countAria: '{stuck} of {n} bandages on',
    hint: 'Tap a bandage to patch the heart',
    askEyebrow: 'no need to answer now',
    askQ: 'If you don’t mind me asking, how’s your heart right now?',
    forgive: 'I forgive you',
    needTime: 'I need some time',
    forgiveReply: 'Thank you, {to}. I won’t waste it.',
    timeReply: 'That’s okay. Take all the time you need. I’m still here.',
    sign: '— {name}',
    read: 'Read the letter →',
    finaleEyebrow: 'From a mended heart',
  },
};

export function useText() {
  return TEXT[useLocale()];
}

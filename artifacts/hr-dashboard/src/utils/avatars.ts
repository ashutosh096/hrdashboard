// Vector SVG Logo Avatars (No real photos — clean vector icon logos)

export const MALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23E0F2FE"/><circle cx="50" cy="38" r="17" fill="%230284C7"/><path d="M 20 84 C 20 64, 32 54, 50 54 C 68 54, 80 64, 80 84 Z" fill="%230284C7"/></svg>`;

export const FEMALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FCE7F3"/><circle cx="50" cy="38" r="17" fill="%23DB2777"/><path d="M 22 84 C 22 64, 34 54, 50 54 C 66 54, 78 64, 78 84 Z" fill="%23DB2777"/></svg>`;

export function getAvatarByName(name?: string, gender?: 'male' | 'female'): string {
  if (gender === 'female') return FEMALE_AVATAR;
  if (gender === 'male') return MALE_AVATAR;

  const lower = (name || '').toLowerCase().trim();
  const femaleKeywords = [
    'priya', 'anita', 'neha', 'sharmila', 'pooja', 'sneha', 'swati', 'divya', 
    'sarah', 'emily', 'jessica', 'rachel', 'ananya', 'kavita', 'meera', 'aarti', 'female'
  ];
  const isFemale = femaleKeywords.some(kw => lower.includes(kw));
  return isFemale ? FEMALE_AVATAR : MALE_AVATAR;
}

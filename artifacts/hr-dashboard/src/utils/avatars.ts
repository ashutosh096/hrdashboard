// Vector SVG Logo Avatars (Clean vector icon logos)
// Male = Blue (#0284C7 / #E0F2FE), Female = Pink (#DB2777 / #FCE7F3)

export const MALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23E0F2FE"/><circle cx="50" cy="38" r="17" fill="%230284C7"/><path d="M 20 84 C 20 64, 32 54, 50 54 C 68 54, 80 64, 80 84 Z" fill="%230284C7"/></svg>`;

export const FEMALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FCE7F3"/><circle cx="50" cy="38" r="17" fill="%23DB2777"/><path d="M 22 84 C 22 64, 34 54, 50 54 C 66 54, 78 64, 78 84 Z" fill="%23DB2777"/></svg>`;

export function isFemaleEmployee(name?: string, email?: string): boolean {
  const lower = `${name || ''} ${email || ''}`.toLowerCase().trim();
  // Specified by company roster: Prerna Shukla, Tarul Sharma, and Neha Shukla are female.
  return lower.includes('prerna') || lower.includes('tarul') || lower.includes('neha');
}

export function getAvatarByName(name?: string, email?: string): string {
  return isFemaleEmployee(name, email) ? FEMALE_AVATAR : MALE_AVATAR;
}

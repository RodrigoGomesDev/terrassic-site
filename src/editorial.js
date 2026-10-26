// Public character name chosen by Rodrigo. Keep imported mod data intact until its later migration.
// Applied when rendering translated prose, so the next import cannot restore the old display name.
export const scientistName=text=>text.replace(/Katarina Usha|Katarina/g,'Katyusha');

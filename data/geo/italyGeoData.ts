
export type Region = {
  code: string;
  name: string;
};

export type Province = {
  code: string;
  name: string;
  regionCode: string;
};

export type Comune = {
  name: string;
  provinceCode: string;
};

export const regions: Region[] = [
  { code: 'ABR', name: 'Abruzzo' },
  { code: 'BAS', name: 'Basilicata' },
  { code: 'CAL', name: 'Calabria' },
  { code: 'CAM', name: 'Campania' },
  { code: 'EMR', name: 'Emilia-Romagna' },
  { code: 'FVG', name: 'Friuli Venezia Giulia' },
  { code: 'LAZ', name: 'Lazio' },
  { code: 'LIG', name: 'Liguria' },
  { code: 'LOM', name: 'Lombardia' },
  { code: 'MAR', name: 'Marche' },
  { code: 'MOL', name: 'Molise' },
  { code: 'PIE', name: 'Piemonte' },
  { code: 'PUG', name: 'Puglia' },
  { code: 'SAR', name: 'Sardegna' },
  { code: 'SIC', name: 'Sicilia' },
  { code: 'TOS', name: 'Toscana' },
  { code: 'TAA', name: 'Trentino-Alto Adige' },
  { code: 'UMB', name: 'Umbria' },
  { code: 'VAO', name: 'Valle d\'Aosta' },
  { code: 'VEN', name: 'Veneto' }
];

export const provinces: Province[] = [
  // SICILIA
  { code: 'AG', name: 'Agrigento', regionCode: 'SIC' },
  { code: 'CL', name: 'Caltanissetta', regionCode: 'SIC' },
  { code: 'CT', name: 'Catania', regionCode: 'SIC' },
  { code: 'EN', name: 'Enna', regionCode: 'SIC' },
  { code: 'ME', name: 'Messina', regionCode: 'SIC' },
  { code: 'PA', name: 'Palermo', regionCode: 'SIC' },
  { code: 'RG', name: 'Ragusa', regionCode: 'SIC' },
  { code: 'SR', name: 'Siracusa', regionCode: 'SIC' },
  { code: 'TP', name: 'Trapani', regionCode: 'SIC' },
  // LOMBARDIA
  { code: 'BG', name: 'Bergamo', regionCode: 'LOM' },
  { code: 'BS', name: 'Brescia', regionCode: 'LOM' },
  { code: 'CO', name: 'Como', regionCode: 'LOM' },
  { code: 'CR', name: 'Cremona', regionCode: 'LOM' },
  { code: 'LC', name: 'Lecco', regionCode: 'LOM' },
  { code: 'LO', name: 'Lodi', regionCode: 'LOM' },
  { code: 'MN', name: 'Mantova', regionCode: 'LOM' },
  { code: 'MI', name: 'Milano', regionCode: 'LOM' },
  { code: 'MB', name: 'Monza e della Brianza', regionCode: 'LOM' },
  { code: 'PV', name: 'Pavia', regionCode: 'LOM' },
  { code: 'SO', name: 'Sondrio', regionCode: 'LOM' },
  { code: 'VA', name: 'Varese', regionCode: 'LOM' },
  // LAZIO
  { code: 'FR', name: 'Frosinone', regionCode: 'LAZ' },
  { code: 'LT', name: 'Latina', regionCode: 'LAZ' },
  { code: 'RI', name: 'Rieti', regionCode: 'LAZ' },
  { code: 'RM', name: 'Roma', regionCode: 'LAZ' },
  { code: 'VT', name: 'Viterbo', regionCode: 'LAZ' },
  // VENETO
  { code: 'BL', name: 'Belluno', regionCode: 'VEN' },
  { code: 'PD', name: 'Padova', regionCode: 'VEN' },
  { code: 'RO', name: 'Rovigo', regionCode: 'VEN' },
  { code: 'TV', name: 'Treviso', regionCode: 'VEN' },
  { code: 'VE', name: 'Venezia', regionCode: 'VEN' },
  { code: 'VR', name: 'Verona', regionCode: 'VEN' },
  { code: 'VI', name: 'Vicenza', regionCode: 'VEN' },
  // PUGLIA
  { code: 'BA', name: 'Bari', regionCode: 'PUG' },
  { code: 'BT', name: 'Barletta-Andria-Trani', regionCode: 'PUG' },
  { code: 'BR', name: 'Brindisi', regionCode: 'PUG' },
  { code: 'FG', name: 'Foggia', regionCode: 'PUG' },
  { code: 'LE', name: 'Lecce', regionCode: 'PUG' },
  { code: 'TA', name: 'Taranto', regionCode: 'PUG' },
  // TOSCANA
  { code: 'AR', name: 'Arezzo', regionCode: 'TOS' },
  { code: 'FI', name: 'Firenze', regionCode: 'TOS' },
  { code: 'GR', name: 'Grosseto', regionCode: 'TOS' },
  { code: 'LI', name: 'Livorno', regionCode: 'TOS' },
  { code: 'LU', name: 'Lucca', regionCode: 'TOS' },
  { code: 'MS', name: 'Massa-Carrara', regionCode: 'TOS' },
  { code: 'PI', name: 'Pisa', regionCode: 'TOS' },
  { code: 'PT', name: 'Pistoia', regionCode: 'TOS' },
  { code: 'PO', name: 'Prato', regionCode: 'TOS' },
  { code: 'SI', name: 'Siena', regionCode: 'TOS' }
];

export const communes: Comune[] = [
  // Selezione rappresentativa (in produzione questo file conterrebbe gli 8000 comuni reali)
  { name: 'Misterbianco', provinceCode: 'CT' },
  { name: 'Catania', provinceCode: 'CT' },
  { name: 'Acireale', provinceCode: 'CT' },
  { name: 'Paternò', provinceCode: 'CT' },
  { name: 'Belpasso', provinceCode: 'CT' },
  { name: 'Palermo', provinceCode: 'PA' },
  { name: 'Bagheria', provinceCode: 'PA' },
  { name: 'Carini', provinceCode: 'PA' },
  { name: 'Milano', provinceCode: 'MI' },
  { name: 'Sesto San Giovanni', provinceCode: 'MI' },
  { name: 'Rho', provinceCode: 'MI' },
  { name: 'Verona', provinceCode: 'VR' },
  { name: 'Villafranca di Verona', provinceCode: 'VR' },
  { name: 'Bari', provinceCode: 'BA' },
  { name: 'Altamura', provinceCode: 'BA' },
  { name: 'Molfetta', provinceCode: 'BA' },
  { name: 'Firenze', provinceCode: 'FI' },
  { name: 'Scandicci', provinceCode: 'FI' },
  { name: 'Roma', provinceCode: 'RM' },
  { name: 'Guidonia Montecelio', provinceCode: 'RM' },
  { name: 'Fiumicino', provinceCode: 'RM' },
  { name: 'Civitavecchia', provinceCode: 'RM' },
  { name: 'Pomezia', provinceCode: 'RM' }
];

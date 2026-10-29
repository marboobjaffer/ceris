export type DressSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type DressCategory =
  | 'All'
  | 'Corset Gowns'
  | 'Chantilly Lace'
  | 'Silk & Bias'
  | 'Avant-Garde';

export interface DressProduct {
  id: string;
  name: string;
  subtitle: string;
  category: Exclude<DressCategory, 'All'>;
  price: number;
  fabric: string;
  silhouette: string;
  origin: string;
  availability: string;
  image: string;
  description: string;
  constructionDetails: string[];
  careInstructions: string;
  measurementsBySize: Record<
    DressSize,
    { bustCm: string; waistCm: string; hipCm: string; lengthCm: string }
  >;
}

export const HERO_EDITORIAL_IMAGE =
  '/src/assets/images/hero_goth_atelier_1793254543263.jpg';

export const DRESS_CATALOG: DressProduct[] = [
  {
    id: 'rr-01-velvet-sovereign',
    name: 'Sovereign Crushed Velvet Corset Gown',
    subtitle: 'Spiral-Boned Bodice · Floor-Length Cathedral Sweep',
    category: 'Corset Gowns',
    price: 680,
    fabric: 'Silk-Back Crushed Velvet',
    silhouette: 'Structured Corset & Draped Full Skirt',
    origin: 'Hand-finished in Milan Atelier',
    availability: 'In Stock',
    image: '/src/assets/images/dress_velvet_corset_1793254543427.jpg',
    description:
      'Constructed from heavy 340gsm silk-viscose crushed velvet in deep obsidian. Features an 18-panel internal spiral steel-boned corset bodice with oxidized silver hook closures and a floor-sweeping gathered skirt.',
    constructionDetails: [
      '14-channel flexible spiral steel boning with cotton coutil interlining',
      'Adjustable back silk-satin lacing with modesty panel',
      'Hand-pleated cathedral train with concealed bustle loop',
      '100% breathable cupro Bemberg full lining'
    ],
    careInstructions: 'Specialist dry clean only. Store on padded hanger away from direct light.',
    measurementsBySize: {
      XS: { bustCm: '78–82', waistCm: '58–62', hipCm: '86–90', lengthCm: '148' },
      S: { bustCm: '83–87', waistCm: '63–67', hipCm: '91–95', lengthCm: '150' },
      M: { bustCm: '88–93', waistCm: '68–73', hipCm: '96–101', lengthCm: '152' },
      L: { bustCm: '94–100', waistCm: '74–80', hipCm: '102–108', lengthCm: '154' },
      XL: { bustCm: '101–108', waistCm: '81–88', hipCm: '109–116', lengthCm: '155' }
    }
  },
  {
    id: 'rr-02-vesper-chantilly',
    name: 'Vesper Calais Chantilly Lace Gown',
    subtitle: 'High Victorian Collar · Sheer Bishop Sleeves',
    category: 'Chantilly Lace',
    price: 740,
    fabric: 'Calais-Caudry Leavers Lace',
    silhouette: 'High-Neck Fitted Bodice & A-Line Train',
    origin: 'Lace woven in Calais, France',
    availability: 'Limited Run',
    image: '/src/assets/images/dress_lace_cathedral_1793254544138.jpg',
    description:
      'Woven on century-old Leavers looms in northern France, the Vesper gown pairs gossamer botanical black Chantilly lace over a sculpted matte silk georgette slip with a velvet ribbon waistband.',
    constructionDetails: [
      'Authentic French Leavers floral lace with scalloped eyelash cuffs',
      'High Victorian collar fastened with twelve jet glass buttons',
      'Velvet grosgrain waist definition and tiered lace godets',
      'Detached opaque silk crepe de Chine under-slip included'
    ],
    careInstructions: 'Delicate hand-clean or specialist couture dry clean.',
    measurementsBySize: {
      XS: { bustCm: '80–84', waistCm: '60–64', hipCm: '88–92', lengthCm: '146' },
      S: { bustCm: '85–89', waistCm: '65–69', hipCm: '93–97', lengthCm: '148' },
      M: { bustCm: '90–95', waistCm: '70–75', hipCm: '98–103', lengthCm: '150' },
      L: { bustCm: '96–102', waistCm: '76–82', hipCm: '104–110', lengthCm: '152' },
      XL: { bustCm: '103–110', waistCm: '83–90', hipCm: '111–118', lengthCm: '153' }
    }
  },
  {
    id: 'rr-03-nocturne-bias-slip',
    name: 'Nocturne Liquid Silk Bias Slip Dress',
    subtitle: 'Oxidized Silver Harness Straps · Low Cowl Back',
    category: 'Silk & Bias',
    price: 520,
    fabric: '30-Momme Mulberry Silk Satin',
    silhouette: '45-Degree Bias Cut Column',
    origin: 'Woven in Como, Italy',
    availability: 'In Stock',
    image: '/src/assets/images/dress_satin_bias_1793254545567.jpg',
    description:
      'Cut strictly on the 45-degree bias from heavyweight 30-momme mulberry silk charmeuse, draping across the frame like liquid obsidian. Framed by detachable hallmarked 925 oxidized silver shoulder chains.',
    constructionDetails: [
      'True bias-cut construction that molds naturally without darts',
      'Hand-forged oxidized sterling silver multi-strand shoulder chains',
      'Dramatic low-draped cowl back with internal counterweight',
      'French-seamed interior throughout for double-faced smoothness'
    ],
    careInstructions: 'Remove silver chains before cleaning. Dry clean only.',
    measurementsBySize: {
      XS: { bustCm: '79–84', waistCm: '60–65', hipCm: '87–92', lengthCm: '144' },
      S: { bustCm: '85–90', waistCm: '66–71', hipCm: '93–98', lengthCm: '146' },
      M: { bustCm: '91–96', waistCm: '72–77', hipCm: '99–104', lengthCm: '148' },
      L: { bustCm: '97–103', waistCm: '78–84', hipCm: '105–111', lengthCm: '150' },
      XL: { bustCm: '104–111', waistCm: '85–92', hipCm: '112–119', lengthCm: '151' }
    }
  },
  {
    id: 'rr-04-ravenna-organza-midi',
    name: 'Ravenna Tiered Smoked Organza Midi',
    subtitle: 'Tailored Military Bodice · Raw-Edge Silk Tulle',
    category: 'Avant-Garde',
    price: 590,
    fabric: 'Crisp Silk Organza & Fine Tulle',
    silhouette: 'Structured Shoulder & Tiered Midi Volume',
    origin: 'Hand-finished in Milan Atelier',
    availability: 'In Stock',
    image: '/src/assets/images/dress_tulle_tiered_1793254546242.jpg',
    description:
      'An architectural study in contrast: a sharply tailored virgin wool-silk bodice with subtle puff shoulders gives way to five asymmetric tiers of smoked silk organza and raw-edge French tulle.',
    constructionDetails: [
      'Tailored stand-collar jacket bodice with pewter shank buttons',
      'Five cascading tiers of smoked silk organza over matte tulle',
      'Concealed side-seam pockets integrated into the second tier',
      'Mid-calf architectural hem ideal for pairing with combat or platform boots'
    ],
    careInstructions: 'Steam gently from inside. Professional dry clean only.',
    measurementsBySize: {
      XS: { bustCm: '80–84', waistCm: '61–65', hipCm: 'Free', lengthCm: '124' },
      S: { bustCm: '85–89', waistCm: '66–70', hipCm: 'Free', lengthCm: '126' },
      M: { bustCm: '90–95', waistCm: '71–76', hipCm: 'Free', lengthCm: '128' },
      L: { bustCm: '96–102', waistCm: '77–83', hipCm: 'Free', lengthCm: '130' },
      XL: { bustCm: '103–110', waistCm: '84–91', hipCm: 'Free', lengthCm: '132' }
    }
  },
  {
    id: 'rr-05-carmilla-rust-brocade',
    name: 'Carmilla Oxblood & Obsidian Jacquard Gown',
    subtitle: 'Boned Sweetheart Bodice · Damask Court Train',
    category: 'Corset Gowns',
    price: 820,
    fabric: 'Custom Rust & Black Silk Brocade',
    silhouette: 'Boned Bustier & Box-Pleated Ball Skirt',
    origin: 'Custom Jacquard woven in Lyon',
    availability: 'Limited Run',
    image: '/src/assets/images/dress_brocade_empire_1793254547296.jpg',
    description:
      'Our signature house textile: deep oxidized rust-crimson botanical damask woven into midnight black silk jacquard. Features a sculpted underwire corset top framed with Chantilly lace trim and a sweeping box-pleated skirt.',
    constructionDetails: [
      'Bespoke Rust & Raven botanical damask jacquard (68% Silk, 32% Virgin Wool)',
      'Contoured cupped bustier with internal waist-stay tape',
      'Deep architectural box pleats that hold sculptural volume without a crinoline',
      'Scalloped Chantilly lace neckline border'
    ],
    careInstructions: 'Specialist couture dry clean only. Do not press brocade relief flat.',
    measurementsBySize: {
      XS: { bustCm: '78–82', waistCm: '59–63', hipCm: '88–94', lengthCm: '150' },
      S: { bustCm: '83–87', waistCm: '64–68', hipCm: '95–100', lengthCm: '152' },
      M: { bustCm: '88–93', waistCm: '69–74', hipCm: '101–106', lengthCm: '154' },
      L: { bustCm: '94–100', waistCm: '75–81', hipCm: '107–113', lengthCm: '156' },
      XL: { bustCm: '101–108', waistCm: '82–89', hipCm: '114–120', lengthCm: '157' }
    }
  },
  {
    id: 'rr-06-monolith-draped-column',
    name: 'Monolith Asymmetric Leather-Trimmed Column',
    subtitle: 'Matte Silk Jersey · Supple Plongé Lambskin Sash',
    category: 'Avant-Garde',
    price: 640,
    fabric: 'Heavy Matte Silk Jersey & Lambskin',
    silhouette: 'Asymmetric Draped Column with Split',
    origin: 'Hand-draped in Milan Atelier',
    availability: 'In Stock',
    image: '/src/assets/images/dress_draped_jersey_1793254548185.jpg',
    description:
      'Hand-draped on the mannequin from dense matte black silk-cupro jersey and edged with butter-soft vegetable-tanned black lambskin borders. Wraps diagonally across the torso to create a severe, monolithic silhouette.',
    constructionDetails: [
      'Diagonal hand-pinned Grecian-gothic pleating across shoulder and hip',
      'Vegetable-tanned Italian plongé lambskin trim and integrated waist belt',
      'High mock neck and fitted long sleeves with invisible wrist zips',
      'Walking slit along the left leg veiled by an overlapping drape panel'
    ],
    careInstructions: 'Leather specialist clean only.',
    measurementsBySize: {
      XS: { bustCm: '80–85', waistCm: '61–66', hipCm: '87–92', lengthCm: '147' },
      S: { bustCm: '86–91', waistCm: '67–72', hipCm: '93–98', lengthCm: '149' },
      M: { bustCm: '92–97', waistCm: '73–78', hipCm: '99–104', lengthCm: '151' },
      L: { bustCm: '98–104', waistCm: '79–85', hipCm: '105–111', lengthCm: '153' },
      XL: { bustCm: '105–112', waistCm: '86–93', hipCm: '112–118', lengthCm: '154' }
    }
  }
];

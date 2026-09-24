export const CAR_BRANDS: Record<string, string[]> = {
    Audi: ['A4', 'A6', 'Q7'],
    BMW: ['3 Series', '5 Series', 'X5'],
    Daewoo: ['Lanos', 'Sens'],
    Hyundai: ['Elantra', 'Tucson'],
    Kia: ['Ceed', 'Sportage'],
    'Mercedes-Benz': ['C-Class', 'E-Class'],
    Nissan: ['Qashqai', 'X-Trail'],
    Renault: ['Duster', 'Megane'],
    Skoda: ['Octavia', 'Superb'],
    Toyota: ['Camry', 'RAV4'],
    Volkswagen: ['Golf', 'Passat', 'Tiguan'],
};

export const isKnownCar = (make: string, model: string): boolean => {
    return CAR_BRANDS[make]?.includes(model) ?? false;
};

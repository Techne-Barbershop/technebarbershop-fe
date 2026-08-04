import type { Artist, PaymentMethod, ServiceCategory, Reservation } from "@/lib/types";

export const STORE = {
  name: "Techné a Barbershop",
  location: "Jl. Palakali No.69, Kukusan, Kecamatan Beji, Kota Depok, Jawa Barat",
};

export const CATEGORIES: ServiceCategory[] = [
  {
    id: "haircut-treatment",
    name: "HAIRCUT & TREATMENT",
    tagline: "Cuts, trims and complete face care.",
    icon: "scissors",
    services: [
      {
        id: "essential-cut",
        categoryId: "haircut-treatment",
        title: "Essential Cut",
        durationMinutes: 45,
        price: 45000,
        description:
          "A precise, modern cut tailored to your face shape and hair type, finished with a razor-clean neckline. The studio's signature everyday cut.",
        includes: [
          { icon: "chat", label: "Consultation" },
          { icon: "scissors", label: "Hair Cut" },
          { icon: "wind", label: "Blow Dry" },
          { icon: "sparkle", label: "Style" },
        ],
      },
      {
        id: "full-face-treatment",
        categoryId: "haircut-treatment",
        title: "Full Face Treatment",
        durationMinutes: 60,
        price: 75000,
        description:
          "A complete facial reset: hot towel, exfoliation, steam, and a precision shave and brow cleanup. Leaves skin clean, soft and glowing.",
        includes: [
          { icon: "chat", label: "Consultation" },
          { icon: "razor", label: "Shave & Lineup" },
          { icon: "jar", label: "Facial Care" },
          { icon: "sparkle", label: "Finish" },
        ],
      },
      {
        id: "beard-trim-shave",
        categoryId: "haircut-treatment",
        title: "Only Beard Trim and Shave",
        durationMinutes: 30,
        price: 35000,
        description:
          "A sharp beard sculpted with a straight razor and a hot-towel finish. Perfect for keeping your beard crisp between cuts.",
        includes: [
          { icon: "razor", label: "Beard Trim" },
          { icon: "razor", label: "Hot Towel Shave" },
          { icon: "sparkle", label: "Finish" },
        ],
      },
    ],
  },
  {
    id: "chemical-touch",
    name: "CHEMICAL TOUCH",
    tagline: "Perms and smoothing that add texture and movement.",
    icon: "waves",
    services: [
      {
        id: "frizzle-perm",
        categoryId: "chemical-touch",
        title: "Authentic Frizzle Perm",
        durationMinutes: 120,
        price: 180000,
        description:
          "Full, defined frizzle texture shaped around your face. A relaxing multi-step process that adds serious volume and personality.",
        includes: [
          { icon: "chat", label: "Consultation" },
          { icon: "waves", label: "Perm Process" },
          { icon: "droplet", label: "Hair Wash" },
          { icon: "sparkle", label: "Styling" },
        ],
      },
      {
        id: "korean-drip",
        categoryId: "chemical-touch",
        title: "Korean Full Drip",
        durationMinutes: 150,
        price: 220000,
        description:
          "The trend-setting Korean-style textured perm. Soft, natural movement with a high-gloss finish that looks effortless.",
        includes: [
          { icon: "chat", label: "Consultation" },
          { icon: "waves", label: "Perm Process" },
          { icon: "droplet", label: "Hair Wash" },
          { icon: "wind", label: "Blow Dry" },
        ],
      },
      {
        id: "smoothing-treatment",
        categoryId: "chemical-touch",
        title: "Smoothing Treatment",
        durationMinutes: 90,
        price: 160000,
        description:
          "Eliminates frizz and tames unruly hair for months. A keratin smoothing treatment that leaves hair silky, straight and manageable.",
        includes: [
          { icon: "chat", label: "Consultation" },
          { icon: "bottle", label: "Treatment" },
          { icon: "droplet", label: "Hair Wash" },
          { icon: "wind", label: "Blow Dry" },
        ],
      },
    ],
  },
  {
    id: "coloring",
    name: "COLORING",
    tagline: "From natural black to bold bleached color.",
    icon: "sparkle",
    services: [
      {
        id: "black-basic",
        categoryId: "coloring",
        title: "Black Basic Hair Coloring",
        durationMinutes: 60,
        price: 95000,
        description:
          "A rich, even natural black that covers grays and deepens your shade. A glossy, healthy-looking finish in a single session.",
        includes: [
          { icon: "chat", label: "Color Consult" },
          { icon: "bottle", label: "Color Process" },
          { icon: "droplet", label: "Hair Wash" },
          { icon: "sparkle", label: "Finish" },
        ],
      },
      {
        id: "full-bleach",
        categoryId: "coloring",
        title: "Full Coloring 1 Bleach",
        durationMinutes: 120,
        price: 250000,
        description:
          "One full round of lightening for a bold, even base color. Includes toner for a bright, uniform result that turns heads.",
        includes: [
          { icon: "chat", label: "Color Consult" },
          { icon: "bottle", label: "Bleach" },
          { icon: "jar", label: "Toning" },
          { icon: "sparkle", label: "Finish" },
        ],
      },
      {
        id: "gray-coverage",
        categoryId: "coloring",
        title: "Gray Coverage",
        durationMinutes: 60,
        price: 110000,
        description:
          "Targeted color for stubborn grays that blends naturally into your existing shade. A refined, age-defying refresh.",
        includes: [
          { icon: "chat", label: "Color Consult" },
          { icon: "bottle", label: "Color Process" },
          { icon: "droplet", label: "Hair Wash" },
        ],
      },
    ],
  },
];

export const ALL_SERVICES: ServiceCategory["services"] = CATEGORIES.flatMap(
  (category) => category.services,
);

export function getServiceById(id: string | null) {
  if (!id) return undefined;
  return ALL_SERVICES.find((service) => service.id === id);
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "va",
    name: "Virtual Account",
    description:
      "Transfer to a unique virtual account number via ATM, mobile or internet banking.",
    icon: "building",
    detail: {
      label: "Virtual Account Number",
      value: "8810 1234 5678 0012",
    },
    steps: [
      "Your unique virtual account number is generated below.",
      "Open your banking app or go to an ATM.",
      "Select Transfer and enter the virtual account number.",
      "Enter the total amount and confirm the transfer.",
      "Your booking is confirmed automatically once the payment is received.",
    ],
  },
  {
    id: "qris",
    name: "QRIS",
    description:
      "Scan the QR code with any e-wallet or banking app that supports QRIS.",
    icon: "qrcode",
    detail: {
      label: "QRIS Code",
      value: "Scan with any e-wallet or banking app",
    },
    steps: [
      "Your unique QRIS code is generated below.",
      "Open any e-wallet or banking app and choose Scan / QRIS.",
      "Scan the QR code and check the amount shown.",
      "Confirm the payment in your app.",
      "Your booking is confirmed instantly once the payment is received.",
    ],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description:
      "Pay instantly using GoPay, OVO, DANA or other supported e-wallets.",
    icon: "wallet",
    detail: {
      label: "E-Wallet Number",
      value: "0812 3456 7890",
    },
    steps: [
      "Open your e-wallet app (GoPay, OVO, DANA).",
      "Choose Send / Transfer and enter the e-wallet number above.",
      "Enter the total amount and confirm with your PIN.",
      "Your booking is confirmed instantly once the payment is received.",
    ],
  },
];

export function getPaymentMethodById(id: string | null) {
  if (!id) return undefined;
  return PAYMENT_METHODS.find((method) => method.id === id);
}

export const ARTISTS: Artist[] = [
  {
    id: "andre",
    name: "Andre Maulana",
    rating: 4.9,
    reviewCount: 512,
    basePrice: 60000,
    specialty: "Skin Fades",
  },
  {
    id: "rizky",
    name: "Rizky Pratama",
    rating: 4.8,
    reviewCount: 398,
    basePrice: 55000,
    specialty: "Classic Cuts",
  },
  {
    id: "kevin",
    name: "Kevin Wijaya",
    rating: 4.7,
    reviewCount: 276,
    basePrice: 50000,
    specialty: "Color Specialist",
  },
  {
    id: "fajar",
    name: "Fajar Nugroho",
    rating: 4.9,
    reviewCount: 460,
    basePrice: 65000,
    specialty: "Textures & Perms",
  },
  {
    id: "dimas",
    name: "Dimas Saputra",
    rating: 4.6,
    reviewCount: 215,
    basePrice: 45000,
    specialty: "Clipper Work",
  },
  {
    id: "yoga",
    name: "Yoga Aditya",
    rating: 4.8,
    reviewCount: 341,
    basePrice: 60000,
    specialty: "Beard & Lineups",
  },
];

export function getArtistById(id: string | null): Artist | undefined {
  if (!id) return undefined;
  return ARTISTS.find((artist) => artist.id === id);
}

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "RES-001",
    customerName: "Budi Santoso",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    workerId: "andre",
    workerName: "Andre Maulana",
    serviceName: "Essential Cut",
    status: "Completed",
  },
  {
    id: "RES-002",
    customerName: "Andi Saputra",
    date: new Date().toISOString().split("T")[0],
    time: "11:00",
    workerId: "andre",
    workerName: "Andre Maulana",
    serviceName: "Full Face Treatment",
    status: "Booked",
  },
  {
    id: "RES-003",
    customerName: "Reza Rahadian",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    workerId: "andre",
    workerName: "Andre Maulana",
    serviceName: "Authentic Frizzle Perm",
    status: "Booked",
  },
  {
    id: "RES-004",
    customerName: "Dimas Anggara",
    date: new Date().toISOString().split("T")[0],
    time: "16:30",
    workerId: "andre",
    workerName: "Andre Maulana",
    serviceName: "Only Beard Trim and Shave",
    status: "Canceled",
  },
];

/** Sample coupons – these will be managed from the admin panel. */
export const coupons = [
  {
    code: "HYSKILLED10",
    description: "10% off your order",
    type: "percent",
    value: 10,
    maxDiscount: 2000,
  },
  {
    code: "WELCOME20",
    description: "20% off for new learners (up to ₹2,500)",
    type: "percent",
    value: 20,
    maxDiscount: 2500,
    minOrder: 1999,
  },
  {
    code: "FLAT500",
    description: "Flat ₹500 off orders above ₹2,999",
    type: "flat",
    value: 500,
    minOrder: 2999,
  },
];

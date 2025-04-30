import { Product } from '@/types/quote';

export const getProductPrice = (
  price: number,
  quantity: number,
  discount: number = 0,
  generalDiscount: number = 0
): number => {
  if (!price || !quantity) return 0;
  const base = price * quantity;
  const baseOffPrice = base * (discount / 100);
  const totalOffPrice = (base - baseOffPrice) * (generalDiscount / 100);
  return base - baseOffPrice - totalOffPrice;
};

export const getProductEfficiency = (
  effieciency: number,
  quantity: number
): number => {
  if (!effieciency || !quantity) return 0;
  return effieciency * quantity;
};

export const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

interface SummaryTotals {
  totalToPay: number;
  totalNoDiscount: number;
  totalPublic: number;
  profit: number;
  profitability: number;
  averageEfficiency: number;
  genDiscount: number;
  totalProductsQtty: number;
}

export const calculateSummaryTotals = (
  products: Product[],
  priceProperty: 'profesionalPrice' | 'publicPrice',
  generalDiscount: number = 0
): SummaryTotals => {
  // Filter products with type guard
  const homeProducts = products.filter((prod) => prod.efficiency === null);
  const cabineProducts = products.filter((prod) => prod.publicPrice === null);

  // Calculate totals with null safety
  const totalToPay = products.reduce((acc, curr) => {
    const price = curr[priceProperty];
    if (price === null || price === undefined) return acc;
    return (
      acc +
      getProductPrice(
        price,
        curr.quantity ?? 0,
        curr.discount ?? 0,
        generalDiscount
      )
    );
  }, 0);

  const totalNoDiscount = products.reduce((acc, curr) => {
    const price = curr[priceProperty];
    if (price === null || price === undefined) return acc;
    return acc + price * (curr.quantity ?? 0);
  }, 0);

  // Calculate general discount percentage
  const genDiscount =
    totalNoDiscount !== 0
      ? ((totalNoDiscount - totalToPay) * 100) / totalNoDiscount
      : 0;

  // Calculate total quantity with null safety
  const totalProductsQtty = products.reduce(
    (acc, curr) => acc + (curr.quantity ?? 0),
    0
  );

  // Calculate home product totals
  const totalPublic = homeProducts.reduce((acc, curr) => {
    if (curr.publicPrice === null || curr.publicPrice === undefined) return acc;
    return acc + curr.publicPrice * (curr.quantity ?? 0);
  }, 0);

  const totalHome = homeProducts.reduce((acc, curr) => {
    if (curr.profesionalPrice === null) return acc;
    return acc + getProductPrice(
      curr.profesionalPrice,
      curr.quantity ?? 0,
      curr.discount ?? 0,
      generalDiscount
    );
  }, 0);

  // Calculate profit metrics
  const profit = totalPublic - totalHome;
  const profitability =
    totalHome !== 0 ? ((totalPublic - totalHome) * 100) / totalHome : 0;

  // Calculate efficiency metrics with null safety
  const totalEfficiency = cabineProducts.reduce((acc, curr) => {
    if (curr.efficiency === null || curr.efficiency === undefined) return acc;
    return acc + curr.efficiency * (curr.quantity ?? 0);
  }, 0);

  const totalCabineProds = cabineProducts.reduce(
    (acc, curr) => acc + (curr.quantity ?? 0),
    0
  );

  const averageEfficiency =
    cabineProducts.length > 0 ? totalEfficiency / totalCabineProds : 0;

  return {
    totalToPay,
    totalNoDiscount,
    totalPublic,
    profit,
    profitability,
    averageEfficiency,
    genDiscount,
    totalProductsQtty,
  };
};

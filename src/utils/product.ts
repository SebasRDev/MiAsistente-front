import { Product } from '@/types/quote';

export const getProductPrice = (
  price: number,
  quantity: number,
  discount: number
) => {
  return price * quantity - price * quantity * (discount / 100);
};

export const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const calculateSummaryTotals = (
  products: Product[],
  priceProperty: 'profesionalPrice' | 'publicPrice'
) => {
  const homeProducts = products.filter((prod) => prod.efficiency === null);
  const cabineProducts = products.filter((prod) => prod.publicPrice === null);
  const totalToPay = products.reduce(
    (acc, curr) =>
      acc + getProductPrice(curr[priceProperty], curr.quantity, curr.discount),
    0
  );
  const totalNoDiscount = products.reduce(
    (acc, curr) => acc + curr[priceProperty] * curr.quantity,
    0
  );
  const genDiscount =
    totalNoDiscount !== 0
      ? ((totalNoDiscount - totalToPay) * 100) / totalNoDiscount
      : 0;
  const totalProductsQtty = products.reduce(
    (acc, curr) => acc + curr.quantity,
    0
  );

  const totalPublic = homeProducts.reduce(
    (acc, curr) => acc + curr.publicPrice * curr.quantity,
    0
  );
  const totalHome = homeProducts.reduce(
    (acc, curr) => acc + curr.profesionalPrice * curr.quantity,
    0
  );
  const profit = totalPublic - totalHome;
  const profitability =
    totalHome !== 0 ? ((totalPublic - totalHome) * 100) / totalHome : 0;
  const totalEfficiency = cabineProducts.reduce(
    (acc, curr) => acc + curr.efficiency * curr.quantity,
    0
  );
  const totalCabineProds = cabineProducts.reduce(
    (acc, curr) => acc + curr.quantity,
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

import { useQuery } from '@tanstack/react-query';

const fetchProducts = async () => {
  const response = await fetch('http://localhost:3000/api/products');
  const data = await response.json();
  return data;
};

const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export { useProducts, fetchProducts };

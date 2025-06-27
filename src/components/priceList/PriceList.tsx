'use client'

import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";

import { productOptions } from "@/app/productos/product";
import Product from "@/app/productos/product.interface";
import { currencyFormatter } from "@/utils/product";

const PriceListContent = () => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const { data } = useSuspenseQuery(productOptions);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => {
      clearTimeout(handler);
    }; 
  },[search]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres con tildes
      .replace(/[\u0300-\u036f]/g, '') // Remueve los acentos
      .trim();
  };

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return data || [];

    const normalizedSearch = normalizeText(debouncedSearch);
    
    return data?.filter((product: Product) => {
      const normalizedName = normalizeText(product.name);
      const normalizedCode = normalizeText(product.code);
      
      return normalizedName.includes(normalizedSearch) ||
             normalizedCode.includes(normalizedSearch);
    }) || [];
  }, [data, debouncedSearch]);

  return (
    <div className="flex flex-col lg:flex-row lg:flex-wrap gap-5">
      <h1 className="font-Trajan-pro text-primary text-center text-2xl">Lista de precios</h1>
      <input
        type="text"
        placeholder="Buscar producto"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-sm"
      />
      {filteredProducts?.map((product: Product) => (
        <div key={product.id} className="flex gap-4 items-center backdrop-blur-sm saturate-150 p-4 w-full lg:w-1/2">
          {/* <div className="h-20 aspect-square rounded-md bg-primary-900 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="h-full object-contain"/>
          </div> */}
          <div className="flex flex-col">
            <p className="text-md text-primary">{product.code}</p>
            <p className="font-bold text-balance text-lg mb-4">{product.name}</p>
            <p className="font-bold text-gray-800 text-lg">Precio Profesional: <span className="text-primary">{currencyFormatter.format(product.profesionalPrice)}</span></p>
            {product.publicPrice && <p className="font-bold text-gray-800 text-lg">Precio público: <span className="text-primary">{currencyFormatter.format(product.publicPrice)}</span></p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PriceListContent;
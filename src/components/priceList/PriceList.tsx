'use client'

import { Chip } from "@heroui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
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
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24 flex flex-col gap-4">
      <h1 className="font-Trajan-pro-bold text-primary text-center text-2xl">Lista de precios</h1>
      <input
        type="text"
        placeholder="Buscar producto"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-sm"
      />
      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-5">
        {filteredProducts?.map((product: Product) => (
          <div key={product.id} className="flex gap-4 items-cente border border-primary rounded-md backdrop-blur-sm saturate-150 p-4 w-full lg:w-[calc(50%_-_10px)]">
            <div className="flex flex-col">
              <div className="flex gap-2 mb-2 flex-wrap">
                <Chip variant="flat" classNames={{
                    base: "bg-green-900/40 rounded-md",
                    content: "drop-shadow shadow-black text-white text-sm",
                  }}>{product.publicPrice ? 'USO EN CASA' : 'USO EN CABINA'}</Chip>
                {product?.category !== null && <Chip variant="flat" classNames={{
                    base: "bg-gradient-to-br from-lime-800/40 to-green-900/40 rounded-md",
                    content: "drop-shadow shadow-black text-white text-sm",
                  }}
                >
                  {product?.category}
                </Chip>}
              </div>
              <div className="flex">
                {product.image && <div className="h-20 aspect-square rounded-md flex items-center justify-center">
                  <Image className="h-full object-contain" src={product.image} alt={product.name} width={50} height={50}/>
                </div>}
                <div>
                  <p className="text-md text-primary">{product.code}</p>
                  <p className="font-bold text-balance text-lg mb-4 text-gray-700">{product.name}</p>
                </div>
              </div>
              <p className="font-bold text-gray-700 text-lg mb-4">Activos: <span className="font-normal">{product.actives}</span></p>
              <p className="font-bold text-gray-700 text-lg">Precio Profesional: <span className="font-normal text-green-950">{currencyFormatter.format(product.profesionalPrice)}</span></p>
              {product.publicPrice && <p className="font-bold text-gray-700 text-lg">Precio Público: <span className="text-green-950 font-normal">{currencyFormatter.format(product.publicPrice)}</span></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PriceListContent;
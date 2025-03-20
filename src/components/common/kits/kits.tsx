'use client'

import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { IconMoon, IconPlus, IconSun, IconSunMoon, IconX } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Kit } from "@/app/kits/kit.interface";
import { kitsOptions } from "@/app/kits/kits";
import { useQuote } from "@/context/QuoteContext";
import { currencyFormatter } from "@/utils/product";

const Usage = ({ time }: { time: string }) => {
  switch (time) {
    case 'DIA':
    case 'DÍA':
      return <IconSun stroke={1} size={28} />
    case 'DIA O NOCHE':
    case 'DÍA O NOCHE':
      return <IconSunMoon stroke={1} size={28} />
    case 'NOCHE':
      return <IconMoon stroke={1} size={28} />
    default:
      return null
  }
}

const Kits = () => {
  const { data } = useSuspenseQuery(kitsOptions);
  const { state, dispatch } = useQuote();
  const [showKits, setShowKits] = useState<string | null>(null);
  const [kitsCategory, setKitsCategory] = useState<string>(state.segment === 'formula' ? 'CASA' : 'CABINA');
  const router = useRouter();

  useEffect(() => {
    setKitsCategory(state.segment === 'formula' ? 'CASA' : 'CABINA')
  }, [state.segment])

  const kits = [...data];

  const handleAddKit = (kit: Kit) => {
    try {
      dispatch({ type: 'SET_KIT', payload: kit.id })
      kit.kitProducts.forEach(({ product, quantity }) => {
        dispatch({
          type: 'ADD_PRODUCT',
          payload: {
            ...product,
            quantity: quantity,
            discount: 0,
            instanceId: `${product.id}_${Date.now()}`
          }
        })
      })
      toast.success(`${kit.name} añadido correctamente`);
      router.push('/productos');
    } catch (error) {
      toast.error(`Error al añadir ${kit.name}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {kits?.map((kit: Kit) => (
        kit.category === kitsCategory && (
          <Card
            key={kit.id}
            style={{ "--tw-backdrop-blur": "blur(4px)" } as React.CSSProperties}
            className="w-full overflow-hidden"
            isBlurred
            onPress={() => setShowKits(prevState => prevState === kit.id ? null : kit.id)}
            isPressable
          >
            <CardHeader className="flex flex-col items-center gap-2 relative">
              <h2 className="font-bold text-primary font-Trajan-pro text-lg text-balance px-6">{kit.name}</h2>
              <div className="absolute top-4 right-4">
                {showKits === kit.id ? <IconX stroke={1.5} size={24} /> : <IconPlus stroke={1.5} size={24} />}
              </div>
            </CardHeader>

            <AnimatePresence>
              {showKits === kit.id && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CardBody className="flex flex-col gap-2">
                      <motion.p
                        className="text-xl font-bold text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {currencyFormatter.format(kit.price)}
                      </motion.p>

                      {kit.kitProducts.map(({ product, quantity }, index) => (
                        <motion.div
                          key={product.id}
                          className="flex gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                        >
                          {kitsCategory === 'CABINA' && <p className="text-md font-bold text-primary">{quantity}</p>}
                          <p className="flex-grow">{product.name}</p>
                          <motion.div
                            className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                          >
                            {
                              kitsCategory === 'CASA'
                                ? <Usage time={product.time} />
                                : <p>{product.efficiency}</p>
                            }
                          </motion.div>
                        </motion.div>
                      ))}
                    </CardBody>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <CardFooter className="flex justify-center">
                      <Button
                        color="primary"
                        size="md"
                        onPress={() => handleAddKit(kit)}
                      >
                        Añadir
                      </Button>
                    </CardFooter>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </Card>
        )
      ))}
    </div>
  )
}

export default Kits
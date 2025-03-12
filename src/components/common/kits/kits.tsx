'use client'

import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { IconMoon, IconPlus, IconSun, IconSunMoon, IconX } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

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
      return
  }
}

const Kits = () => {
  const { data } = useSuspenseQuery(kitsOptions);
  const [showKits, setShowKits] = useState<string | null>(null);
  const { dispatch } = useQuote();

  const kits = [...data];

  return (
    <div className="flex flex-col gap-4">
      {kits?.map((kit: Kit) => (
        <Card
          key={kit.id}
          style={{ "--tw-backdrop-blur": " blur(4px)" } as React.CSSProperties}
          className="w-full overflow-hidden"
          isBlurred
          onPress={() => setShowKits(prevState => prevState === kit.id ? null : kit.id)}
          isPressable
        >
          <CardHeader className="flex flex-col items-center gap-2 relative">
            <h2 className="font-bold text-primary font-Trajan-pro text-lg">{kit.name}</h2>
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
                        <p className="flex-grow">{quantity} {product.name}</p>
                        <motion.div
                          className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                        >
                          <Usage time={product.time} />
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
                      onPress={() => dispatch({ type: 'SET_KIT', payload: kit.id })}
                    >
                      Añadir
                    </Button>
                  </CardFooter>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  )
}

export default Kits
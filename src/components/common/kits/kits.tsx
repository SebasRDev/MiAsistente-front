'use client'

import { Kit } from "@/app/kits/kit.interface";
import { kitsOptions } from "@/app/kits/kits";
import { useQuote } from "@/context/QuoteContext";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query"

const Usage = ({ time }: { time: string }) => {
  switch (time) {
    case 'DIA':
    case 'DÍA':
      return <IconSun stroke={1} />
    case 'DIA O NOCHE':
    case 'DÍA O NOCHE':
      return <IconSunMoon stroke={1} />
    case 'NOCHE':
      return <IconMoon stroke={1} />
    default:
      return
  }
}

const Kits = () => {
  const { data } = useSuspenseQuery(kitsOptions);
  const { dispatch } = useQuote();

  console.log(data)

  return (
    <div className="flex flex-col gap-4">
      {data?.map((kit: Kit) => (
        <Card key={kit.id} className="w-full">
          <CardHeader className="flex flex-col items-center gap-2">
            <span className="font-bold text-primary">{kit.name}</span>
            {`${kit.price} COP`}
          </CardHeader>
          <CardBody>
            {
              kit.kitProducts.map(({ product, quantity }) =>
                <div key={product.id} className="flex gap-2">
                  <Usage time={product.time} />
                  <p className="flex-grow">{product.name}</p>
                  <p>{quantity}</p>
                </div>
              )
            }
          </CardBody>
          <CardFooter>
            <Button
              color="primary"
              size="md"
              onPress={() => dispatch({ type: 'SET_KIT', payload: kit.id })}
            >
              Comprar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default Kits
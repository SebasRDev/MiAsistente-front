'use client'

import { Google } from "@/components/common/icons/icons";
import { useQuote } from "@/context/QuoteContext";
import { translateAuthError } from "@/utils/errorTranslations";
import { login, signup } from "@/utils/login/actions";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input } from "@heroui/react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData);
      } else {
        result = await signup(formData);
      }

      if (result?.error) {
        toast.error(translateAuthError(result.error));
      }

      if (result?.success) {
        router.push('/productos');
      }

    } catch (error: any) {
      if (!error.toString().includes('NEXT_REDIRECT')) {
        console.error("Error real:", error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }


  const toggleVisibility = () => setIsVisible(!isVisible);
  return (
    <div className="login-page">
      <div className="container max-w-6xl w-11/12 mx-auto flex justify-end">
        <Card isBlurred className="max-w-96 w-full shrink-0">
          <CardHeader>
            <p className="text-white text-2xl">Ingreso SkhAPP</p>
          </CardHeader>
          <CardBody>
            <Button
              className="mb-8 bg-white text-primary font-bold text-md"
              radius="sm"
              color="primary"
              startContent={<Google />}
            >
              Ingresar con Google
            </Button>
            <Form onSubmit={handleSubmit}>
              <Input
                isRequired
                label="Email"
                name="email"
                placeholder="Ingresa tu email"
                type="email"
              />
              <Input
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <IconEyeClosed stroke={1.5} />
                    ) : (
                      <IconEye stroke={1.5} />
                    )}
                  </button>
                }
                name="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                type={isVisible ? "text" : "password"}
              />
              {!isLogin && <Input
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <IconEyeClosed stroke={1.5} />
                    ) : (
                      <IconEye stroke={1.5} />
                    )}
                  </button>
                }
                name="confirm_password"
                label="Confirmar contraseña"
                placeholder="Confirmar contraseña contraseña"
                type={isVisible ? "text" : "password"}
              />}
              <Button
                type="submit" variant="solid" color="primary" size="md" isLoading={isLoading}>
                {isLogin ? "Ingresar" : "Registrate"}
              </Button>
            </Form>
          </CardBody>
          <CardFooter>
            <p className="text-white text-sm">¿No tienes cuenta aún? <Button
              type="submit"
              variant="light"
              color="primary"
              size="md"
              onPress={() => setIsLogin(!isLogin)}>
              {isLogin ? "Registrate" : "Ingresar"}
            </Button></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
'use client'
import { Button, CircularProgress } from "@heroui/react";
import { IconUserEdit, IconReceipt2, IconVaccineBottle, IconDownload, IconPercentage } from "@tabler/icons-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { KitsIcon } from "@/components/common/icons/icons";
import { useAuth } from "@/context/AuthContext";
import { useQuote } from "@/context/QuoteContext";

const NavigationFooter = () => {
  const { state } = useQuote();
  const { profile } = useAuth();
  const pathname = usePathname();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [downloadValue, setDownloadValue] = useState(0);
  const isWaitingRoom = pathname.includes('waiting-room');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (pdfLoading) {
      interval = setInterval(() => {
        setDownloadValue((v) => (v >= 100 ? 0 : v + 10));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pdfLoading]);

  const requestBody = {
    "data": {
      "name": state.quote.client,
      "consultant": state.quote.profesional,
      "gift": state.quote.gift,
      "city": state.quote.city,
      "campaign": state.quote.campaign,
      "generalDiscount": state.quote.generalDiscount,
      "phone": state.quote.phone,
      "id": state.quote.id,
      "recommendations": state.quote.recommendations,
    },
    "kit": state.kit,
    "products": state.products.map(({ id, quantity, discount }) => ({ id, quantity, discount })),
  }

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const canShare = () => {
    return 'share' in navigator;
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getPDF = async () => {
    setPdfLoading(true);
    setDownloadValue(0);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/quotes/${state.segment}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `formula-${state.quote.client || 'cotizacion'}.pdf`;

      if (isMobile() && canShare()) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        setTimeout(() => {
          toast.success('PDF generado exitosamente', {
            action: (
              <div className="flex gap-2 flex-col justify-end items-end flex-grow">
                <Button
                  color="primary"
                  variant="solid"
                  onPress={async () => {
                    try {
                      await navigator.share({
                        files: [file],
                        title: 'Cotización',
                        text: 'Compartir cotización PDF'
                      });
                    } catch (error) {
                      if (typeof error === 'object' && error !== null && 'name' in error &&
                        (error as { name: string }).name !== 'AbortError') {
                        console.error('Error sharing:', error);
                        downloadFile(url, filename);
                      }
                    }
                  }}
                >
                  Compartir
                </Button>
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={() => downloadFile(url, filename)}
                >
                  Descargar
                </Button>
              </div>
            )
          });
        }, 1000);
      } else {
        setTimeout(() => {
          toast.success('PDF generado exitosamente', {
            action: {
              label: 'Descargar',
              onClick: () => downloadFile(url, filename)
            }
          });
        }, 500);
      }

    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('No se pudo generar el PDF');
    } finally {
      setDownloadValue(100);
      setPdfLoading(false);
    }
  };

  return (
    <>
      {profile && !isWaitingRoom && <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 overflow-hidden">
        <div className="grid h-full max-w-lg grid-cols-6 mx-auto">
          <Link
            href="/datos"
            aria-label="Datos del cliente"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconUserEdit
              stroke={1.5}
              color={pathname == '/datos' ? "#658864" : "#6b7280"}
              size={35}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/total"
            aria-label="Resumen general"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconReceipt2
              stroke={1.5}
              color={pathname == '/total' ? "#658864" : "#6b7280"}
              size={35}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/descuento-general"
            aria-label="Descuento general"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconPercentage
              stroke={1.5}
              color={pathname == '/descuento-general' ? "#658864" : "#6b7280"}
              size={35}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/productos"
            aria-label="Productos"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconVaccineBottle
              stroke={1.5}
              color={pathname == '/productos' ? "#658864" : "#6b7280"}
              size={35}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/kits"
            aria-label="Kits"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <KitsIcon
              color={pathname == '/kits' ? "#658864" : "#6b7280"}
            />
          </Link>
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label={pdfLoading ? "Generando PDF…" : "Generar y descargar PDF"}
              className="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary rounded-full hover:bg-primary group focus:ring-4 focus:ring-primary focus:outline-none"
              onClick={getPDF}
              disabled={pdfLoading}
            >
              {
                pdfLoading
                  ? <CircularProgress
                    aria-label="Generando PDF…"
                    color="success"
                    showValueLabel={true}
                    size="md"
                    value={downloadValue}
                    formatOptions={{
                      style: "decimal"
                    }}
                    strokeWidth={4}
                    classNames={{
                      value: "text-xs font-bold text-white font-Swiss-bold",
                    }}
                  />
                  : <IconDownload
                    stroke={1.5}
                    color="#fff"
                    size={24}
                    aria-hidden="true"
                  />
              }
            </button>
          </div>
        </div>
      </div>}
    </>
  )
}

export default NavigationFooter

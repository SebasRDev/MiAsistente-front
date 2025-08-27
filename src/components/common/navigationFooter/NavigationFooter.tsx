'use client'
import { Button, CircularProgress } from "@heroui/react";
import { IconUserEdit, IconReceipt2, IconVaccineBottle, IconDownload, IconPercentage } from "@tabler/icons-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { KitsIcon } from "@/components/common/icons/icons";
import { useQuote } from "@/context/QuoteContext";

const NavigationFooter = () => {
  const { state } = useQuote();
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

  // Función para detectar si estamos en móvil
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Función para detectar si el navegador soporta Web Share API
  const canShare = () => {
    return 'share' in navigator;
  };

  // Función auxiliar para descargar archivo
  const downloadFile = (url:string, filename:string) => {
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

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      const filename = `formula-${state.quote.client || 'cotizacion'}.pdf`;

      if (isMobile()) {
        // En móvil: primero abrir para vista previa
        // const newWindow = window.open(url, '_blank');
        
        // Si soporta Web Share API, mostrar opción de compartir
        if (canShare()) {
          // Crear archivo para compartir
          const file = new File([blob], filename, { type: 'application/pdf' });
          
          // Mostrar toast con opción de compartir
          setTimeout(() => {
            toast.success('PDF generado exitosamente', {
              action: (
                <div className="flex gap-2 flex-col justify-end items-end grow">
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
                  {/* <button 
                    onClick={() => downloadFile(url, filename)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Descargar
                  </button>
                  <button 
                    onClick={async () => {
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
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Compartir
                  </button> */}
                </div>
              )
            });
          }, 1000);
        } else {
          // Si no soporta compartir, solo mostrar descarga
          setTimeout(() => {
            toast.success('PDF abierto. ¿Deseas descargarlo?', {
              action: {
                label: 'Descargar',
                onClick: () => downloadFile(url, filename)
              }
            });
          }, 1000);
        }
      } else {
        // En desktop: abrir en nueva pestaña y descargar
        // window.open(url, '_blank');
        
        // También ofrecer descarga
        setTimeout(() => {
          toast.success('PDF abierto en nueva pestaña', {
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

  // const getPDF = async () => {
  //   setPdfLoading(true);
  //   setDownloadValue(0);
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/quotes/${state.segment}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',

  //       },
  //       body: JSON.stringify(requestBody)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     // Get the blob from the response
  //     const blob = await response.blob();

  //     // Create a URL for the blob
  //     const url = window.URL.createObjectURL(blob);

  //     // Create a temporary link element
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `formula-${state.quote.client || 'cotizacion'}.pdf`;

  //     // Append to document, click, and remove
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     // Clean up the URL
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Error downloading PDF:', error);
  //     // You might want to add some user feedback here
  //     toast.error('No se pudo generar el PDF');

  //   } finally {
  //     setDownloadValue(100);
  //     setPdfLoading(false);
  //   }
  // }
  

  return (
    <>
      {state.user && !isWaitingRoom && <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 overflow-hidden">
        <div className="grid h-full max-w-lg grid-cols-6 mx-auto">
          <Link
            href="/datos"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconUserEdit
              stroke={1.5}
              color={pathname == '/datos' ? "#658864" : "#6b7280"}
              size={35}
              className="group-hover:text-primary"
            />
          </Link>
          <Link
            href="/total"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconReceipt2
              stroke={1.5}
              color={pathname == '/total' ? "#658864" : "#6b7280"}
              size={35}
              className="group-hover:text-primary"
            />
          </Link>
          <Link
            href="/descuento-general"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconPercentage
              stroke={1.5}
              color={pathname == '/descuento-general' ? "#658864" : "#6b7280"}
              size={35}
              className="group-hover:text-primary"
            />
          </Link>
          <Link
            href="/productos"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <IconVaccineBottle
              stroke={1.5}
              color={pathname == '/productos' ? "#658864" : "#6b7280"}
              size={35}
              className="group-hover:text-primary"
            />
          </Link>
          <Link
            href="/kits"
            className="flex items-center justify-center group hover:bg-gray-50"
          >
            <KitsIcon
              color={pathname == '/kits' ? "#658864" : "#6b7280"}
            />
          </Link>
          <div className="flex items-center justify-center">
            <button data-tooltip-target="tooltip-new" type="button" className="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary rounded-full hover:bg-primary group focus:ring-4 focus:ring-primary focus:outline-none"
              onClick={getPDF}
            >
              {
                pdfLoading
                  ? <CircularProgress
                    aria-label="Loading..."
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
                    className="group-hover:text-primary"
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
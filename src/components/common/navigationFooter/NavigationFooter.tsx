'use client'
import { CircularProgress } from "@heroui/react";
import { IconUserEdit, IconReceipt2, IconVaccineBottle, IconDownload } from "@tabler/icons-react"
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
      "generalDiscount": state.quote.generalDiscount,
    },
    "kit": state.kit,
    "products": state.products.map(({ id, quantity, discount }) => ({ id, quantity, discount })),
  }

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

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `formula-${state.quote.client || 'cotizacion'}.pdf`;

      // Append to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // You might want to add some user feedback here
      toast.error('No se pudo generar el PDF');

    } finally {
      setDownloadValue(100);
      setPdfLoading(false);
    }
  }

  return (
    <>
      {state.user && <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 overflow-hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
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
        </div>
      </div>}
    </>
  )
}

export default NavigationFooter
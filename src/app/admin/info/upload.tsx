'use client';
import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import type { FilePondFile } from "filepond";
import 'filepond/dist/filepond.min.css'
import { useState } from "react";
import { FilePond } from "react-filepond";
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { toast } from "sonner";

import { AnimatedSpan,
  Terminal,
  TypingAnimation } from "@/components/ui/terminal";


const translationsMap: Record<string, string> = {
  products: "productos",
  kits: "kits",
};

const endpointsMap: Record<string, string> = {
  products: "products/import",
  kits: "kits/file",
};

interface ItemError {
  code?: string;
  name?: string;
  error: string;
}

interface UploadResponse {
  message?: string;
  result?: {
    created: number;
    updated: number;
    deleted?: number;
    errors?: ItemError[];
    details?: {
      affectedKits?: string[];
    };
  };
}

export default function UploadModal({option} : {option: string}) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FilePondFile[]>([])
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const handleUpload = () => {
    if (files.length === 0){
      toast.warning('Por favor, selecciona un archivo para de subir.');
      return
    };

    const formData = new FormData();
    formData.append('file', files[0].file);
    setIsSubmitting(true);

    fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/${endpointsMap[option]}`, {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || `Error ${res.status} al subir el archivo.`);
        }
        return data as UploadResponse;
      })
      .then((data) => {
        setResponse(data);
        setUploadError(null);
        setShowResult(true);
        setAttempt((a) => a + 1);

        const itemErrors = data?.result?.errors ?? [];
        if (!data?.result) {
          toast.warning(data?.message || `No se encontraron ${translationsMap[option]} válidos en el archivo.`);
        } else if (itemErrors.length > 0) {
          toast.warning(`${translationsMap[option]} procesados con ${itemErrors.length} error(es). Revisa el detalle.`);
        } else {
          toast.success(`${translationsMap[option]} actualizados correctamente.`);
        }

        queryClient.invalidateQueries({ queryKey: [option] });
        if (option === 'products') {
          queryClient.invalidateQueries({ queryKey: ['kits'] });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setResponse(null);
        setUploadError(error.message || 'Ocurrió un error al subir el archivo.');
        setShowResult(true);
        setAttempt((a) => a + 1);
        toast.error(`Error al subir ${translationsMap[option]}: ${error.message}`);
      })
      .finally(() => {
        setIsSubmitting(false);
        setFiles([]);
      });

  }

  return (
    <>
      {option === 'products' && (
        <p className="mb-3 text-sm text-danger-600">
          ⚠ El archivo debe ser el generado por &quot;Exportar productos&quot; (con la
          columna id intacta). Cualquier producto existente cuyo id no aparezca en el
          archivo será eliminado, y los kits que lo contengan recalcularán su precio.
        </p>
      )}
      <FilePond
        files={files.map(fileItem => fileItem.file)}
        onupdatefiles={(fileItems: FilePondFile[]) => setFiles(fileItems)}
        instantUpload={false}
        name="file"
        labelIdle='Arrasta tus archivos o <span class="filepond--label-action">Buscalos</span>'
      />
      {showResult && <Terminal key={attempt}>
        <TypingAnimation>{`Actualizando ${translationsMap[option]} desde el archivo`}</TypingAnimation>
        {uploadError ? (
          <AnimatedSpan className="text-red-500">
            ✘ Error: {uploadError}
          </AnimatedSpan>
        ) : !response?.result ? (
          <AnimatedSpan className="text-yellow-500">
            ⚠ {response?.message || `No se encontraron ${translationsMap[option]} válidos en el archivo.`}
          </AnimatedSpan>
        ) : <>
          <AnimatedSpan className="text-green-500">
            ✔ {translationsMap[option]} creados {response.result.created ?? 0}.
          </AnimatedSpan>
          <AnimatedSpan className="text-green-500">
            ✔ {translationsMap[option]} actualizados {response.result.updated ?? 0}.
          </AnimatedSpan>
          {option === 'products' && <>
            <AnimatedSpan className={(response.result.deleted ?? 0) > 0 ? "text-red-500" : "text-green-500"}>
              {(response.result.deleted ?? 0) > 0 ? '⚠' : '✔'} productos eliminados {response.result.deleted ?? 0}.
            </AnimatedSpan>
            {(response.result.details?.affectedKits?.length ?? 0) > 0 && (
              <AnimatedSpan className="text-yellow-500">
                ⚠ kits recalculados: {response.result.details!.affectedKits!.join(', ')}
              </AnimatedSpan>
            )}
          </>}
          {(response.result.errors?.length ?? 0) > 0 && (
            <AnimatedSpan className="text-red-500">
              ✘ {response.result.errors!.length} con error: {response.result.errors!.map((e) => `${e.code ?? e.name} (${e.error})`).join(', ')}
            </AnimatedSpan>
          )}
        </>}
      </Terminal>}
      <Button className="mt-4" onPress={handleUpload} isLoading={isSubmitting}>Subir archivos</Button>
    </>
  );
}

'use client';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
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

export default function UploadModal({option} : {option: string}) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FilePondFile[]>([])
  const [response, setResponse] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    if (files.length === 0){
      toast.warning('Por favor, selecciona un archivo para de subir.');
      return
    };

    const formData = new FormData();
    formData.append('file', files[0].file);

    fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/${endpointsMap[option]}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setIsUploading(true);
        setResponse(data);
        console.log('Success:', data);
        toast.success(`${translationsMap[option]} actualizados correctamente.`);
        queryClient.invalidateQueries({ queryKey: [option] });
        if (option === 'products') {
          queryClient.invalidateQueries({ queryKey: ['kits'] });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Ocurrió un error al subir el archivo.');
      })
      .finally(() => {
        setTimeout(() => {
          setIsUploading(false);
        }, 5000);
        setTimeout(() => setFiles([]) , 5500);
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
      {isUploading && <Terminal>
        <TypingAnimation>{`Actualizando ${translationsMap[option]} desde el archivo`}</TypingAnimation>
        <AnimatedSpan className="text-green-500">
          ✔ {translationsMap[option]} creados {response?.result?.created}.
        </AnimatedSpan>
        <AnimatedSpan className="text-green-500">
          ✔ {translationsMap[option]} actualizados {response?.result?.updated}.
        </AnimatedSpan>
        {option === 'products' && <>
          <AnimatedSpan className={response?.result?.deleted > 0 ? "text-red-500" : "text-green-500"}>
            {response?.result?.deleted > 0 ? '⚠' : '✔'} productos eliminados {response?.result?.deleted ?? 0}.
          </AnimatedSpan>
          {response?.result?.details?.affectedKits?.length > 0 && (
            <AnimatedSpan className="text-yellow-500">
              ⚠ kits recalculados: {response.result.details.affectedKits.join(', ')}
            </AnimatedSpan>
          )}
        </>}
      </Terminal>}
      <Button className="mt-4" onPress={handleUpload}>Subir archivos</Button>
    </>
  );
}

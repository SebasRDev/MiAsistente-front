'use client';
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

export default function UploadModal({option} : {option: string}) {
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

    fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/${option}/file`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setIsUploading(true);
        setResponse(data);
        console.log('Success:', data);
        toast.success(`${translationsMap[option]} actualizados correctamente.`);
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
      <FilePond
        files={files}
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
          <AnimatedSpan className="text-green-500">
            ✔ Productos uso en casa {response?.result?.details?.homeProducts}.
          </AnimatedSpan>
          <AnimatedSpan className="text-green-500">
            ✔ Productos uso en cabina {response?.result?.details?.cabinProducts}.
          </AnimatedSpan>
        </>}
      </Terminal>}
      <Button className="mt-4" onPress={handleUpload}>Subir archivos</Button>
    </>
  );
}

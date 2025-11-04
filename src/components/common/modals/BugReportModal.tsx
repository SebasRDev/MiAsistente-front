// components/BugReportModal.tsx
'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from '@heroui/react';
import { IconBug, IconSend } from '@tabler/icons-react';
import { getApp } from "firebase/app";
import { collection, addDoc, serverTimestamp , getFirestore } from "firebase/firestore";
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useQuote } from '@/context/QuoteContext';
import { sendAdvancedDiscordNotification } from '@/utils/notifications';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BugReportModal = ({ isOpen, onClose }: BugReportModalProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const { state } = useQuote();

  // En BugReportModal.tsx, actualizar la función sendBugNotification:

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const bugReport = {
        message: message.trim() || 'No se proporcionó descripción',
        timestamp: serverTimestamp(),
        userId: user?.uid,
        userEmail: profile?.email,
        userName: `${profile?.name} ${profile?.lastName}`,
        currentState: state,
        userAgent: navigator.userAgent,
        status: 'pending'
      };

      // Guardar en Firestore
      const db = getFirestore(getApp());
      const docRef = await addDoc(collection(db, 'bug_reports'), bugReport);
      
      // Agregar el ID del documento al reporte
      const reportWithId = { ...bugReport, firestoreId: docRef.id };
      
      // Enviar notificación a Discord
      const notificationResult = await sendAdvancedDiscordNotification(reportWithId);
      
      if (notificationResult.success) {
        toast.success('✅ Bug reportado con éxito. ¡Gracias por tu ayuda!');
      } else {
        toast.warning(`⚠️ Bug guardado pero falló la notificación: ${notificationResult.error}`);
      }
      
      setMessage('');
      onClose();
      
    } catch (error) {
      toast.error(`❌ Error al reportar bug: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <IconBug className="text-danger" size={24} />
          <span>Reportar un Error</span>
        </ModalHeader>
        
        <ModalBody className="py-6">
          <div className="space-y-4">
            <p className="text-sm text-default-600">
              Describe el problema que encontraste. si es posible.
            </p>
            
            <Textarea
              label="Descripción del error"
              placeholder="Ej: Al intentar generar el PDF de la cotización, la aplicación se congela..."
              value={message}
              onValueChange={setMessage}
              minRows={4}
              maxRows={8}
              maxLength={1000}
              description={`${message.length}/1000 caracteres`}
            />
            
            <div className="bg-default-100 p-3 rounded-lg">
              <p className="text-xs text-default-600 mb-2">
                <strong>Información que se incluirá automáticamente:</strong>
              </p>
              <ul className="text-xs text-default-500 space-y-1">
                <li>• Fecha y hora del reporte</li>
                <li>• Tu información de usuario</li>
                <li>• Productos y/o kit seleccionados</li>
                <li>• Información del navegador</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            color="danger" 
            onPress={handleSubmit}
            disabled={isSubmitting}
            startContent={<IconSend size={16} />}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Reportar Error'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
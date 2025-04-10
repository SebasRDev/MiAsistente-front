"use client";

import type {ButtonProps} from "@heroui/react";
import {Button, Card, CardBody, cn, Form, Input} from "@heroui/react";
import {useControlledState} from "@react-stately/utils";
import { getApp } from "firebase/app";
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { m, LazyMotion, domAnimation, AnimatePresence, motion } from 'framer-motion';
import type {ComponentProps} from "react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useQuote } from "@/context/QuoteContext";

export type RowStepProps = {
  title?: React.ReactNode;
  className?: string;
};

export interface RowStepsProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * An array of steps.
   *
   * @default []
   */
  steps?: RowStepProps[];
  /**
   * The color of the steps.
   *
   * @default "primary"
   */
  color?: ButtonProps["color"];
  /**
   * The current step index.
   */
  currentStep?: number;
  /**
   * The default step index.
   *
   * @default 0
   */
  defaultStep?: number;
  /**
   * Whether to hide the progress bars.
   *
   * @default false
   */
  hideProgressBars?: boolean;
  /**
   * The custom class for the steps wrapper.
   */
  className?: string;
  /**
   * The custom class for the step.
   */
  stepClassName?: string;
  /**
   * Callback function when the step index changes.
   */
  onStepChange?: (stepIndex: number) => void;
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <m.path
        animate={{pathLength: 1}}
        d="M5 13l4 4L19 7"
        initial={{pathLength: 0}}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
      />
    </svg>
  );
}

// Define field names as a type for type safety
type ProfileFieldName = 'name' | 'lastName' | 'graduate' | 'profession' | 'id' | 'phone' | 'nit' | 'centerName';

// Define the profile data interface
interface ProfileData {
  name: string;
  lastName: string;
  graduate: string;
  profession: string;
  id: string;
  phone: string;
  nit: string;
  centerName: string;
}

// Define the field structure with proper types
interface FieldConfig {
  label: string;
  name: ProfileFieldName;
  value: string;
  required?: boolean;
  type?: string;
  step: number;
}

const fields: FieldConfig[] = [
  {
    label: "Nombre",
    name: "name",
    value: "",
    required: true,
    step: 1,
  },
  {
    label: "Apellido",
    name: "lastName",
    value: "",
    required: true,
    step: 1,
  },
  {
    label: "Egresado",
    name: "graduate",
    value: "",
    step: 1,
  },
  {
    label: "Profesión",
    name: "profession",
    value: "",
    step: 1,
  },
  {
    label: "CC",
    name: "id",
    value: "",
    required: true,
    type: "tel",
    step: 1,
  },
  {
    label: "Teléfono",
    name: "phone",
    value: "",
    required: true,
    type: "tel",
    step: 1,
  },
  {
    label: "Nit",
    name: "nit",
    value: "",
    required: true,
    type: "tel",
    step: 2,
  },
  {
    label: "Nombre del centro de estética",
    name: "centerName",
    value: "",
    required: true,
    step: 2,
  },
]

const RowSteps = React.forwardRef<HTMLButtonElement, RowStepsProps>(
  (
    {
      color = "primary",
      steps = [],
      defaultStep = 0,
      onStepChange,
      currentStep: currentStepProp,
      hideProgressBars = false,
      stepClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const { state, dispatch } = useQuote();
    const [currentStep, setCurrentStep] = useControlledState(
      currentStepProp,
      defaultStep,
      onStepChange,
    );
    const [profileData, setProfileData] = useState<ProfileData>({
      name: '',
      lastName: '',
      graduate: '',
      profession: '',
      id: '',
      phone: '',
      nit: '',
      centerName: '',
    });
    
    // Define proper types for errors and touchedFields
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    
    // Add null check for state.user
    useEffect(() => {
      if (state?.user) {
        setProfileData({
          name: state.user.name || '',
          lastName: state.user.lastName || '',
          graduate: state.user.egresado || '',
          profession: state.user.profesion || '',
          id: state.user.id || '',
          phone: state.user.phone || '',
          nit: state.user.nit || '',
          centerName: state.user.centerName || '',
        });
      }
    }, [state?.user]);

    const colors = React.useMemo(() => {
      let userColor;
      let fgColor;

      const colorsVars = [
        "[--active-fg-color:var(--step-fg-color)]",
        "[--active-border-color:var(--step-color)]",
        "[--active-color:var(--step-color)]",
        "[--complete-background-color:var(--step-color)]",
        "[--complete-border-color:var(--step-color)]",
        "[--inactive-border-color:hsl(var(--heroui-default-300))]",
        "[--inactive-color:hsl(var(--heroui-default-300))]",
      ];

      switch (color) {
        case "primary":
          userColor = "[--step-color:hsl(var(--heroui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-primary-foreground))]";
          break;
        case "secondary":
          userColor = "[--step-color:hsl(var(--heroui-secondary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-secondary-foreground))]";
          break;
        case "success":
          userColor = "[--step-color:hsl(var(--heroui-success))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-success-foreground))]";
          break;
        case "warning":
          userColor = "[--step-color:hsl(var(--heroui-warning))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-warning-foreground))]";
          break;
        case "danger":
          userColor = "[--step-color:hsl(var(--heroui-error))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-error-foreground))]";
          break;
        case "default":
          userColor = "[--step-color:hsl(var(--heroui-default))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-default-foreground))]";
          break;
        default:
          userColor = "[--step-color:hsl(var(--heroui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--heroui-primary-foreground))]";
          break;
      }

      if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor);
      if (!className?.includes("--step-color")) colorsVars.unshift(userColor);
      if (!className?.includes("--inactive-bar-color"))
        colorsVars.push("[--inactive-bar-color:hsl(var(--heroui-default-300))]");

      return colorsVars;
    }, [color, className]);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setProfileData((prevState) => ({...prevState, [name as ProfileFieldName]: value}));
    }

    const handleBlur = (fieldName: string) => {
      // Marca el campo como tocado
      setTouchedFields(prev => ({
        ...prev,
        [fieldName]: true
      }));
      
      // Valida solo este campo específico
      validateField(fieldName);
    };

    const validateField = (fieldName: string) => {
      const field = fields.find(f => f.name === fieldName);
      
      if (field?.required) {
        const value = profileData[field.name];
        const isInvalid = !value || value.trim() === '';
        
        setErrors(prev => ({
          ...prev,
          [fieldName]: isInvalid
        }));
        
        return !isInvalid;
      }
      
      return true;
    };

    const validateFields = (step: number) => {
      const stepFields = fields.filter(field => field.step === step);
      let isValid = true;
      const newErrors: Record<string, boolean> = {...errors};
      
      stepFields.forEach(field => {
        if (field.required) {
          const value = profileData[field.name];
          const fieldIsInvalid = !value || value.trim() === '';
          newErrors[field.name] = fieldIsInvalid;
          
          if (fieldIsInvalid) {
            isValid = false;
            // Marca el campo como tocado si es inválido durante la validación de paso
            setTouchedFields(prev => ({
              ...prev,
              [field.name]: true
            }));
          }
        }
      });
      
      setErrors(newErrors);
      return isValid;
    };

    const handleAction = async () => {
      if (currentStep === 0) {
        // Valida solo los campos del paso actual
        const isStepValid = validateFields(1);
        
        if (isStepValid) {
          setCurrentStep(1);
        } else {
          const invalidFields = fields
            .filter(field => field.step === 1 && field.required && errors[field.name])
            .map(field => field.label);
          
          if (invalidFields.length > 0) {
            toast.error(`Por favor complete los campos requeridos: ${invalidFields.join(', ')}`);
          }
        }
      } else {
        // Valida los campos del paso 2 antes de guardar
        const isStepValid = validateFields(2);
        
        if (isStepValid && state?.user) {
          try {
            const updatedUserData = {
              ...state.user,
              ...profileData,
              isProfileComplete: true
            };
            dispatch({ type: 'SET_USER', payload: updatedUserData });
            const db = getFirestore(getApp());
            const userDocRef = doc(db, 'users', state.user.uid);
            await setDoc(userDocRef, updatedUserData, { merge: true });
            toast.success('Información actualizada con éxito');
          } catch (error) {
            console.error('Error al guardar tu información:', error);
            toast.error('Ocurrió un error al guardar tú información');
          }
        } else if (!state?.user) {
          toast.error('Usuario no disponible');
        } else {
          const invalidFields = fields
            .filter(field => field.step === 2 && field.required && errors[field.name])
            .map(field => field.label);
          
          if (invalidFields.length > 0) {
            toast.error(`Por favor complete los campos requeridos: ${invalidFields.join(', ')}`);
          }
        }
      }
    };

    return (
      <Card isBlurred className="w-11/12 max-w-lg mx-auto">
      <CardBody className="flex flex-col gap-4 items-center">
        <nav aria-label="Progress" className="-my-4 max-w-fit overflow-x-auto py-4">
          <ol className={cn("flex flex-row flex-nowrap gap-x-3", colors, className)}>
            {steps?.map((step, stepIdx) => {
              const status =
                currentStep === stepIdx ? "active" : currentStep < stepIdx ? "inactive" : "complete";

              return (
                <li key={stepIdx} className="relative flex w-full items-center pr-12">
                  <button
                    key={stepIdx}
                    ref={ref}
                    aria-current={status === "active" ? "step" : undefined}
                    className={cn(
                      "group flex w-full cursor-pointer flex-row items-center justify-center gap-x-3 rounded-large py-2.5",
                      stepClassName,
                    )}
                    onClick={() => setCurrentStep(stepIdx)}
                    {...props}
                  >
                    <div className="h-ful relative flex items-center">
                      <LazyMotion features={domAnimation}>
                        <m.div animate={status} className="relative">
                          <m.div
                            className={cn(
                              "relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-semibold text-default-foreground",
                              {
                                "shadow-lg": status === "complete",
                              },
                            )}
                            initial={false}
                            transition={{duration: 0.25}}
                            variants={{
                              inactive: {
                                backgroundColor: "transparent",
                                borderColor: "var(--inactive-border-color)",
                                color: "var(--inactive-color)",
                              },
                              active: {
                                backgroundColor: "transparent",
                                borderColor: "var(--active-border-color)",
                                color: "var(--active-color)",
                              },
                              complete: {
                                backgroundColor: "var(--complete-background-color)",
                                borderColor: "var(--complete-border-color)",
                              },
                            }}
                          >
                            <div className="flex items-center justify-center">
                              {status === "complete" ? (
                                <CheckIcon className="h-6 w-6 text-[var(--active-fg-color)]" />
                              ) : (
                                <span>{stepIdx + 1}</span>
                              )}
                            </div>
                          </m.div>
                        </m.div>
                      </LazyMotion>
                    </div>
                    <div className="max-w-full flex-1 text-start">
                      <div
                        className={cn(
                          "text-small font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-medium",
                          {
                            "text-default-500": status === "inactive",
                          },
                        )}
                      >
                        {step.title}
                      </div>
                    </div>
                    {stepIdx < steps.length - 1 && !hideProgressBars && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 w-10 flex-none items-center"
                        style={{
                          // @ts-ignore
                          "--idx": stepIdx,
                        }}
                      >
                        <div
                          className={cn(
                            "relative h-0.5 w-full bg-[var(--inactive-bar-color)] transition-colors duration-300",
                            "after:absolute after:block after:h-full after:w-0 after:bg-[var(--active-border-color)] after:transition-[width] after:duration-300 after:content-['']",
                            {
                              "after:w-full": stepIdx < currentStep,
                            },
                          )}
                        />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <Form className="w-full">
          <AnimatePresence mode="wait">
            { currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col gap-4"
              >
                {fields.map((field) => (
                  field.step === 1 && <Input
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={profileData[field.name]}
                    onChange={handleValueChange}
                    type={field.type || 'text'}
                    required={field.required}
                    isInvalid={field.required && touchedFields[field.name] && errors[field.name]}
                    errorMessage={field.required && touchedFields[field.name] && errors[field.name] ? 'Campo requerido' : ''}
                    onBlur={() => handleBlur(field.name)}
                  />
                ))}
              </motion.div>
            )}
            { currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col gap-4"
              >
                {fields.map((field) => (
                  field.step === 2 && <Input
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={profileData[field.name]}
                    onChange={handleValueChange}
                    type={field.type || 'text'}
                    required={field.required}
                    isInvalid={field.required && touchedFields[field.name] && errors[field.name]}
                    errorMessage={field.required && touchedFields[field.name] && errors[field.name] ? 'Campo requerido' : ''}
                    onBlur={() => handleBlur(field.name)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4 flex space-between items-center justify-between w-full">
            <Button 
              variant="bordered"
              color="primary"
              onPress={() => setCurrentStep(currentStep - 1)}
              isDisabled={currentStep === 0}
            >
              Volver
            </Button>
            <Button
              variant="solid"
              color="primary"
              onPress={handleAction}
            >
              {currentStep === 0 ? "Siguiente" : "Guardar"}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
    );
  },
);

RowSteps.displayName = "RowSteps";

export default RowSteps;
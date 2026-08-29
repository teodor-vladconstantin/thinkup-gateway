import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';

export type FormStep = {
  key: string;
  title?: string;
  content: ReactNode;
  validate?: () => string | null;
};

type StepperFormProps = {
  steps: FormStep[];
  onSubmit: () => void | Promise<void>;
  submitLabel?: ReactNode;
  submitting?: boolean;
  onValidationError?: (message: string) => void;
};

export default function StepperForm({ steps, onSubmit, submitLabel = 'Trimite', submitting, onValidationError }: StepperFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const goNext = () => {
    const error = step.validate?.();
    if (error) {
      onValidationError?.(error);
      return;
    }
    if (isLastStep) {
      onSubmit();
    } else {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }
  };

  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0));

  return (
    <div className="space-y-6">
      {steps.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Pasul {stepIndex + 1} din {steps.length}</span>
            {step.title && <span>{step.title}</span>}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div>{step.content}</div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
        </Button>

        <Button
          type="button"
          onClick={goNext}
          disabled={submitting}
          className="bg-[#1a0b2e] text-white hover:bg-[#2d1b4e]"
        >
          {isLastStep ? (
            submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Se trimite...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {submitLabel} <Send className="h-4 w-4" />
              </span>
            )
          ) : (
            <span className="flex items-center gap-2">
              Continuă <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

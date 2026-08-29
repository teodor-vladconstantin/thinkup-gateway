import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CampaignQuestion } from '@/types/recruitment';
import { cn } from '@/lib/utils';

export type AnswerValues = Record<string, string | string[]>;
export type AnswerFiles = Record<string, File>;

type CampaignQuestionsFormProps = {
  questions: CampaignQuestion[];
  values: AnswerValues;
  files: AnswerFiles;
  onValueChange: (questionId: string, value: string | string[]) => void;
  onFileChange: (questionId: string, file: File | null) => void;
  disabled?: boolean;
};

const getScaleBounds = (question: CampaignQuestion) => {
  const min = Number(question.options?.[0]);
  const max = Number(question.options?.[1]);
  return {
    min: Number.isFinite(min) ? min : 1,
    max: Number.isFinite(max) ? max : 5,
  };
};

export default function CampaignQuestionsForm({
  questions,
  values,
  files,
  onValueChange,
  onFileChange,
  disabled,
}: CampaignQuestionsFormProps) {
  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const value = values[question.id];

        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-gray-700">
              {question.label}
              {question.is_required && <span className="text-red-500"> *</span>}
            </Label>
            {question.help_text && <p className="text-xs text-gray-500">{question.help_text}</p>}

            {question.type === 'long_text' ? (
              <Textarea
                id={question.id}
                value={(value as string) ?? ''}
                onChange={(event) => onValueChange(question.id, event.target.value)}
                required={question.is_required}
                disabled={disabled}
                className="min-h-[120px] bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            ) : question.type === 'dropdown' ? (
              <Select
                value={(value as string) ?? ''}
                onValueChange={(next) => onValueChange(question.id, next)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Selectează o opțiune" />
                </SelectTrigger>
                <SelectContent>
                  {(question.options ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : question.type === 'single_choice' ? (
              <div className="flex flex-wrap gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                {(question.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name={question.id}
                      checked={value === option}
                      onChange={() => onValueChange(question.id, option)}
                      disabled={disabled}
                      className="h-4 w-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : question.type === 'multiple_choice' ? (
              <div className="flex flex-wrap gap-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                {(question.options ?? []).map((option) => {
                  const selected = Array.isArray(value) && value.includes(option);
                  return (
                    <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                      <Checkbox
                        checked={selected}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          const current = Array.isArray(value) ? value : [];
                          const next = checked ? [...current, option] : current.filter((item) => item !== option);
                          onValueChange(question.id, next);
                        }}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            ) : question.type === 'file_upload' ? (
              <Input
                id={question.id}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={question.is_required && !files[question.id]}
                disabled={disabled}
                onChange={(event) => onFileChange(question.id, event.target.files?.[0] ?? null)}
                className="bg-gray-50 border-gray-200 text-gray-700 file:text-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            ) : question.type === 'scale' ? (
              (() => {
                const { min, max } = getScaleBounds(question);
                const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index);
                return (
                  <div className="flex flex-wrap gap-2">
                    {steps.map((step) => (
                      <button
                        key={step}
                        type="button"
                        disabled={disabled}
                        onClick={() => onValueChange(question.id, String(step))}
                        className={cn(
                          'h-10 w-10 rounded-md border text-sm font-medium transition',
                          value === String(step)
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300',
                        )}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                );
              })()
            ) : (
              <Input
                id={question.id}
                type={
                  question.type === 'email'
                    ? 'email'
                    : question.type === 'phone'
                      ? 'tel'
                      : question.type === 'date'
                        ? 'date'
                        : question.type === 'number'
                          ? 'number'
                          : 'text'
                }
                value={(value as string) ?? ''}
                onChange={(event) => onValueChange(question.id, event.target.value)}
                required={question.is_required}
                disabled={disabled}
                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

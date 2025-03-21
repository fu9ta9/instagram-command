import { cn } from "@/lib/utils";
import { FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: { message: string };
  field: any;
  props: any;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, field, props }) => {
  return (
    <div className="space-y-2 w-full">
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <input
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2",
            "text-sm ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500"
          )}
          {...field}
          {...props}
        />
      </FormControl>
      {error && (
        <FormMessage className="text-red-500 text-sm">
          {error.message}
        </FormMessage>
      )}
    </div>
  );
};

export default FormField; 
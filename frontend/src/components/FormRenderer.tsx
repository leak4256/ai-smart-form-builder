import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import type { FormSchema } from "../types/form";

type FormRendererProps = {
    schema?: FormSchema;
};

export default function FormRenderer({ schema }: FormRendererProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();

    const schemaFromUrl = searchParams.get('schema');

    let resolvedSchema: FormSchema | undefined;
    let schemaError = '';

    if (schemaFromUrl) {
        try {
            const parsedSchema = JSON.parse(schemaFromUrl) as FormSchema;
            if (!parsedSchema || !Array.isArray(parsedSchema.fields)) {
                schemaError = 'סכמת הטופס בקישור אינה תקינה.';
            } else {
                resolvedSchema = parsedSchema;
            }
        } catch {
            schemaError = 'לא ניתן לקרוא את סכמת הטופס מהקישור.';
        }
    } else {
        resolvedSchema = schema;
    }

    if (!resolvedSchema) {
        if (!schemaError) {
            schemaError = 'לא נמצאה סכמת טופס להצגה.';
        }
        return <p className="text-sm text-red-700">{schemaError}</p>;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetEmail: resolvedSchema.targetEmail,
                    submittedData: formData
                })
            });

            const contentType = response.headers.get('content-type') ?? '';
            const responseBody = contentType.includes('application/json')
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                const serverMessage = typeof responseBody === 'object' && responseBody !== null && 'error' in responseBody
                    ? String(responseBody.error)
                    : `Request failed with status ${response.status}`;
                throw new Error(serverMessage);
            }

            console.log('Form submission response:', responseBody);
            showToast('הטופס נשלח בהצלחה', 'success');
        } catch (error) {
            console.error('Error submitting form:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showToast(`שליחת הטופס נכשלה: ${message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    if (!resolvedSchema.fields?.length) {
        return <p className="text-sm text-red-700">סכמת הטופס אינה מכילה שדות להצגה.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {
                resolvedSchema.fields.map(field => (

                    <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
                        </label>
                        {field.type !== 'select' ? (
                            <input
                                id={field.id}
                                name={field.id}
                                type={field.type}
                                required={field.required}
                                onChange={(event) => setFormData({ ...formData, [field.id]: event.target.value })}
                                className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-slate-500" />
                        ) : (
                            <select
                                id={field.id}
                                name={field.id}
                                required={field.required}
                                onChange={(event) => setFormData({ ...formData, [field.id]: event.target.value })}
                                className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                            >
                                {field.options?.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ))
            }


            <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {isLoading ? 'שולח...' : 'שליחה'}
            </button>
        </form>
    )
}
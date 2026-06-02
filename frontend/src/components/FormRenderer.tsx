import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import type { FormSchema } from "../types/form";
import { buildApiUrl } from "../config/api";

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
        return <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{schemaError}</p>;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(buildApiUrl('/submit-form'), {
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
                    : `הבקשה נכשלה (${response.status})`;
                throw new Error(serverMessage);
            }

            console.log('Form submission response:', responseBody);
            showToast('הטופס נשלח בהצלחה', 'success');
        } catch (error) {
            console.error('Error submitting form:', error);
            const message = error instanceof Error ? error.message : 'שגיאה לא ידועה';
            showToast(`שליחת הטופס נכשלה: ${message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    if (!resolvedSchema.fields?.length) {
        return <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">סכמת הטופס אינה מכילה שדות להצגה.</p>;
    }

    const fieldClass =
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {
                resolvedSchema.fields.map(field => (

                    <div key={field.id}>
                        <label htmlFor={field.id} className="mb-1 block text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required && <span className="ms-1 text-red-500" aria-label="required">*</span>}
                        </label>
                        {field.type !== 'select' ? (
                            <input
                                id={field.id}
                                name={field.id}
                                type={field.type}
                                required={field.required}
                                onChange={(event) => setFormData({ ...formData, [field.id]: event.target.value })}
                                className={fieldClass} />
                        ) : (
                            <select
                                id={field.id}
                                name={field.id}
                                required={field.required}
                                onChange={(event) => setFormData({ ...formData, [field.id]: event.target.value })}
                                className={fieldClass}
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
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
                {isLoading ? 'שולח...' : 'שליחה'}
            </button>
        </form>
    )
}
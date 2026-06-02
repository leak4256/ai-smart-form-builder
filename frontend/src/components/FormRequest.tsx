import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import FormRenderer from './FormRenderer';
import { useToast } from '../context/ToastContext';
import type { FormSchema } from '../types/form';
import { buildApiUrl } from '../config/api';

export default function FormRequest() {
    const [userPrompt, setUserPrompt] = useState('');
    const [targetEmail, setTargetEmail] = useState('');
    const [mailingList, setMailingList] = useState('');
    const [schema, setSchema] = useState<FormSchema>();
    const [shareableUrl, setShareableUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('עדיין אין נתונים.');
    const { showToast } = useToast();
    const formRendererSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!schema) {
            return;
        }

        formRendererSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [schema]);

    const distributeForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!shareableUrl) {
            showToast('יש ליצור טופס לפני ביצוע הפצה.', 'error');
            return;
        }

        const emails = mailingList
            .split(/[\s,;]+/)
            .map((email) => email.trim())
            .filter(Boolean);

        if (!emails.length) {
            showToast('יש להזין לפחות כתובת מייל אחת להפצה.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter((email) => !emailPattern.test(email));

        if (invalidEmails.length > 0) {
            showToast('יש כתובות מייל לא תקינות ברשימת התפוצה.', 'error');
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/distribute-form'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formLink: shareableUrl,
                    mailingList: emails
                })
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const serverError =
                    (data && typeof data.error === 'string' && data.error) ||
                    (data && typeof data.message === 'string' && data.message) ||
                    `שגיאת שרת (${response.status})`;
                showToast(`ההפצה נכשלה: ${serverError}`, 'error');
                return;
            }

            const failedCount =
                (data && typeof data.failedCount === 'number' && data.failedCount) ||
                (data && Array.isArray(data.failedEmails) && data.failedEmails.length) ||
                0;
            const successCount =
                (data && typeof data.successCount === 'number' && data.successCount) ||
                (data && Array.isArray(data.successfulEmails) && data.successfulEmails.length) ||
                Math.max(emails.length - failedCount, 0);

            if (failedCount > 0) {
                showToast(`ההפצה הושלמה חלקית: ${successCount} הצליחו, ${failedCount} נכשלו.`, 'success');
                return;
            }

            showToast(`ההפצה הושלמה בהצלחה עבור ${successCount} נמענים.`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'שגיאה לא ידועה';
            showToast(`ההפצה נכשלה: ${message}`, 'error');
        }
    };

    const generateForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setLoadingMessage('טוען...');
        setSchema(undefined);
        setShareableUrl('');

        try {
            const response = await fetch(buildApiUrl('/generate-form'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userPrompt, targetEmail })
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            const schemaWithTargetEmail: FormSchema = {
                ...data,
                targetEmail
            };

            setSchema(schemaWithTargetEmail);
            const encodedSchema = encodeURIComponent(JSON.stringify(schemaWithTargetEmail));
            const generatedShareableUrl = `${window.location.origin}/form?schema=${encodedSchema}`;
            setShareableUrl(generatedShareableUrl);
            console.log('Received schema:', schemaWithTargetEmail);
            showToast('הטופס נוצר בהצלחה', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setLoadingMessage(`שגיאה: ${message}`);
            console.error('Error fetching form schema:', error);
            showToast(`יצירת הטופס נכשלה: ${message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto mt-10 w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-slate-900">מחולל טפסים חכם</h1>
            <p className="mb-4 text-sm text-slate-600">תארו את הטופס הרצוי, הזינו אימייל יעד ולחצו שליחה.</p>

            <form onSubmit={generateForm} className="space-y-4">
                <label htmlFor="formRequest" className="block text-sm font-medium text-slate-700">
                    בקשת הטופס
                </label>
                <textarea
                    id="formRequest"
                    value={userPrompt}
                    onChange={(event) => setUserPrompt(event.target.value)}
                    placeholder="לדוגמה: אני צריך טופס לידים עם שם, אימייל וטלפון"
                    required
                    className="h-32 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                />

                <label htmlFor="targetEmail" className="block text-sm font-medium text-slate-700">
                    אימייל יעד
                </label>
                <input
                    id="targetEmail"
                    type="email"
                    value={targetEmail}
                    onChange={(event) => setTargetEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                />


                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {isLoading ? 'עובד על זה...' : 'צור טופס'}
                </button>
            </form>


            {shareableUrl && (
                <section className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
                    <form onSubmit={distributeForm} className="space-y-3">
                        <label htmlFor="mailingList" className="block text-sm font-medium text-slate-700">
                            רשימת תפוצה
                        </label>
                        <textarea
                            id="mailingList"
                            value={mailingList}
                            onChange={(event) => setMailingList(event.target.value)}
                            placeholder="name1@example.com, name2@example.com"
                            className="h-24 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                        />

                        <button
                            type="submit"
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            הפצה
                        </button>
                    </form>

                    <h2 className="mb-2 mt-4 text-sm font-semibold text-slate-900">קישור לשיתוף הטופס</h2>
                    <p className="mb-2 text-sm text-slate-600">אפשר להעתיק ולשתף את הקישור הבא:</p>
                    <input
                        type="text"
                        readOnly
                        value={shareableUrl}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900"
                        onFocus={(event) => event.currentTarget.select()}
                    />
                </section>
            )}
                        {!schema ? (
                <p className="mt-4 text-sm text-slate-600">{loadingMessage}</p>
            ) : (
                <section ref={formRendererSectionRef} className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <FormRenderer schema={schema} />
                </section>
            )}

        </main>
    );
}

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import FormRenderer from './FormRenderer';
import { useToast } from '../context/ToastContext';
import type { FormSchema } from '../types/form';
import { buildApiUrl } from '../config/api';

type ActiveTab = 'preview' | 'distribution';

export default function FormRequest() {
    const [userPrompt, setUserPrompt] = useState('');
    const [targetEmail, setTargetEmail] = useState('');
    const [mailingList, setMailingList] = useState('');
    const [schema, setSchema] = useState<FormSchema>();
    const [shareableUrl, setShareableUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDistributing, setIsDistributing] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
    const [loadingMessage, setLoadingMessage] = useState('עדיין אין נתונים.');
    const { showToast } = useToast();
    const workspaceSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!schema) {
            return;
        }

        workspaceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            setIsDistributing(true);
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
        } finally {
            setIsDistributing(false);
        }
    };

    const generateForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setLoadingMessage('מייצר את הטופס...');
        setSchema(undefined);
        setShareableUrl('');
        setActiveTab('preview');

        try {
            const response = await fetch(buildApiUrl('/generate-form'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userPrompt, targetEmail })
            });
            if (!response.ok) {
                throw new Error(`הבקשה נכשלה (${response.status})`);
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
            const message = error instanceof Error ? error.message : 'שגיאה לא ידועה';
            setLoadingMessage(`שגיאה: ${message}`);
            console.error('Error fetching form schema:', error);
            showToast(`יצירת הטופס נכשלה: ${message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const tabButtonClass = (tab: ActiveTab) =>
        `rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-emerald-50'
        }`;

    const fieldClass =
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

    return (
        <main className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-emerald-200/70 bg-white/95 p-5 shadow-sm backdrop-blur sm:mt-10 sm:p-8">
            <header className="mb-6 border-b border-emerald-100 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">מחולל טפסים חכם</h1>
                <p className="mt-2 text-sm text-slate-600">כתבו בקשה ברורה, צרו טופס מיידי, ואז עברו לתצוגה או להפצה בלחיצה אחת.</p>
            </header>

            <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
                <h2 className="mb-1 text-base font-semibold text-slate-900">שלב 1: יצירת טופס</h2>
                <p className="mb-4 text-sm text-slate-600">הזינו תיאור ואימייל יעד לקבלת התשובות.</p>

                <form onSubmit={generateForm} className="space-y-4">
                    <div>
                        <label htmlFor="formRequest" className="mb-1 block text-sm font-medium text-slate-700">
                            בקשת הטופס
                        </label>
                        <textarea
                            id="formRequest"
                            value={userPrompt}
                            onChange={(event) => setUserPrompt(event.target.value)}
                            placeholder="לדוגמה: אני צריך טופס לידים עם שם, אימייל וטלפון"
                            required
                            className={`${fieldClass} h-32`}
                        />
                    </div>

                    <div>
                        <label htmlFor="targetEmail" className="mb-1 block text-sm font-medium text-slate-700">
                            אימייל יעד
                        </label>
                        <input
                            id="targetEmail"
                            type="email"
                            value={targetEmail}
                            onChange={(event) => setTargetEmail(event.target.value)}
                            placeholder="name@example.com"
                            required
                            className={fieldClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                        {isLoading ? 'עובד על זה...' : 'צור טופס'}
                    </button>
                </form>
            </section>

            <section ref={workspaceSectionRef} className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">שלב 2: תצוגה והפצה</h2>
                        <p className="mt-1 text-sm text-slate-600"> כאן תוכלו לצפות בטופס ולהפץ אותו לנמענים</p>
                    </div>
                    {schema && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">הטופס מוכן</span>}
                </div>

                {!schema ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        {loadingMessage}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex gap-2 rounded-xl border border-emerald-100 bg-white p-2">
                            <button type="button" onClick={() => setActiveTab('preview')} className={tabButtonClass('preview')}>
                                תצוגת הטופס
                            </button>
                            <button type="button" onClick={() => setActiveTab('distribution')} className={tabButtonClass('distribution')}>
                                הפצה
                            </button>
                        </div>

                        {activeTab === 'preview' ? (
                            <section className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="mb-3 text-sm text-slate-600">כאן אפשר לבדוק איך הטופס נראה לפני שליחה לנמענים.</p>
                                <FormRenderer schema={schema} />
                            </section>
                        ) : (
                            <section className="rounded-xl border border-slate-200 bg-white p-4">
                                <form onSubmit={distributeForm} className="space-y-3">
                                    <label htmlFor="mailingList" className="mb-1 block text-sm font-medium text-slate-700">
                                        רשימת תפוצה
                                    </label>
                                    <textarea
                                        id="mailingList"
                                        value={mailingList}
                                        onChange={(event) => setMailingList(event.target.value)}
                                        placeholder="name1@example.com, name2@example.com"
                                        className={`${fieldClass} h-24`}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isDistributing}
                                        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                                    >
                                        {isDistributing ? 'מפיץ...' : 'הפצה'}
                                    </button>
                                </form>

                                <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-900">קישור לשיתוף הטופס</h3>
                                <p className="mb-2 text-sm text-slate-600">אפשר להעתיק ולשתף את הקישור הבא:</p>
                                <input
                                    type="text"
                                    readOnly
                                    value={shareableUrl}
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-900"
                                    onFocus={(event) => event.currentTarget.select()}
                                />
                            </section>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

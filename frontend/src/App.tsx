import FormRequest from './components/FormRequest';
import FormRenderer from './components/FormRenderer';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white px-3 py-6 sm:px-6 sm:py-10">
            <FormRequest />
          </div>
        }
      />
      <Route
        path="/form"
        element={
          <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white px-3 py-6 sm:px-6 sm:py-10">
            <main className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-emerald-200/70 bg-white/95 p-5 shadow-sm backdrop-blur sm:mt-10 sm:p-8">
              <FormRenderer />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

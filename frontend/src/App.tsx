import FormRequest from './components/FormRequest';
import FormRenderer from './components/FormRenderer';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-slate-50 px-4 py-8">
            <FormRequest />
          </div>
        }
      />
      <Route
        path="/form"
        element={
          <div className="min-h-screen bg-slate-50 px-4 py-8">
            <main className="mx-auto mt-10 w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <FormRenderer />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

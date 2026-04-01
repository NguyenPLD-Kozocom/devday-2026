import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";

const BeeWordSearch = lazy(() => import("./bee-word-search/App"));
const LuckyDraw = lazy(() => import("./lucky-draw/App"));
const TenSeconds = lazy(() => import("./ten-seconds/App"));

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0A1128]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/60 tracking-widest uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/bee-word-search/*" element={<BeeWordSearch />} />
          <Route path="/lucky-draw" element={<LuckyDraw />} />
          <Route path="/ten-seconds" element={<TenSeconds />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

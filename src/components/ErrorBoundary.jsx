import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GezginOgi Yakalanan Hata:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('kesif_atlasim_places_v6');
      localStorage.removeItem('kesif_atlasim_places_v5');
      localStorage.removeItem('kesif_atlasim_places_v4');
      localStorage.removeItem('kesif_atlasim_places_v3');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl shadow-inner border border-amber-500/30">
              🧭
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-100">GezginOgi Yenileniyor</h1>
              <p className="text-sm text-slate-400">
                Uygulama yüklenirken beklenmedik bir arayüz durumu oluştu. Seyahat rotalarınız ve verileriniz güvende!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                🔄 Sayfayı Yenile
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 active:scale-95 transition cursor-pointer"
              >
                🧹 Ön Belleği Temizle & Yeniden Başlat
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 overflow-x-auto">
                <summary className="cursor-pointer text-amber-400/90 font-sans font-semibold text-xs pb-1 select-none">
                  Hata Detayı (Geliştirici)
                </summary>
                <div className="mt-2 text-rose-300 font-semibold">{this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-slate-400 text-[11px] leading-relaxed whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { useEffect, useState } from 'react';
import { Select } from './components/ui';
import { artistsData } from './data';
import { pl } from './i18n/pl';
import { MarketModule } from './modules/market/MarketModule';
import { RoyaltyModule } from './modules/royalty/RoyaltyModule';
import { TimelineModule } from './modules/timeline/TimelineModule';
import { TourModule } from './modules/tour/TourModule';
import { ArtistProvider, useArtist } from './state/artist';

const TABS = ['timeline', 'royalty', 'tour', 'market'] as const;
type Tab = (typeof TABS)[number];

const fromHash = (): Tab => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (TABS as readonly string[]).includes(h) ? (h as Tab) : 'timeline';
};

function Shell() {
  const [tab, setTab] = useState<Tab>(fromHash);
  const { artist, setArtistId } = useArtist();

  useEffect(() => {
    const on = () => setTab(fromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = (t: Tab) => {
    window.location.hash = `/${t}`;
    setTab(t);
  };
  const key = artist?.id ?? 'none';
  const num = String(TABS.indexOf(tab) + 1).padStart(2, '0');

  return (
    <>
      <div className="bg-art" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="dots" />
      </div>
      <a className="skip-link" href="#main">
        {pl.skip}
      </a>
      <aside className="disclaimer-bar" aria-label={pl.disclaimerLabel}>
        <span aria-hidden="true">●</span> {pl.disclaimerBar}
      </aside>
      <div className="layout">
        <nav className="rail" aria-label={pl.nav.label}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? 'active' : ''}
              aria-current={tab === t ? 'page' : undefined}
              onClick={() => go(t)}
            >
              <span className="rail-label">{pl.nav[t]}</span>
            </button>
          ))}
        </nav>
        <div className="content">
          <header className="app-header">
            <div className="hero">
              <h1>
                <span className="accent">Music</span>
                <span>Money Lab</span>
              </h1>
            </div>
            <div className="artist-picker">
              <Select
                label={pl.artist.label}
                value={artist?.id ?? ''}
                options={[
                  { value: '', label: pl.artist.none },
                  ...artistsData.artists.map((a) => ({
                    value: a.id,
                    label: `${a.name} · ${a.genre}`,
                  })),
                ]}
                onChange={setArtistId}
              />
              <small>{pl.artist.hint}</small>
            </div>
          </header>
          <main id="main" tabIndex={-1} data-num={num}>
            <div hidden={tab !== 'timeline'}>
              <TimelineModule />
            </div>
            <div hidden={tab !== 'royalty'}>
              <RoyaltyModule key={`r-${key}`} />
            </div>
            <div hidden={tab !== 'tour'}>
              <TourModule key={`t-${key}`} />
            </div>
            <div hidden={tab !== 'market'}>
              <MarketModule />
            </div>
          </main>
          <footer className="app-footer">{pl.footer}</footer>
        </div>
      </div>
    </>
  );
}

export function App() {
  return (
    <ArtistProvider>
      <Shell />
    </ArtistProvider>
  );
}

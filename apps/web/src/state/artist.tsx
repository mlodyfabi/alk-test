import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DemoArtist } from '@mml/core';
import { artistsData } from '../data';

interface ArtistState {
  artist: DemoArtist | undefined;
  setArtistId: (id: string) => void;
}

const Ctx = createContext<ArtistState>({ artist: undefined, setArtistId: () => {} });

/** Selected demo artist. Empty id = no artist (modules fall back to neutral defaults). */
export function ArtistProvider({ children }: { children: ReactNode }) {
  const [id, setArtistId] = useState(artistsData.artists[0]?.id ?? '');
  const value = useMemo(
    () => ({ artist: artistsData.artists.find((a) => a.id === id), setArtistId }),
    [id],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useArtist = () => useContext(Ctx);

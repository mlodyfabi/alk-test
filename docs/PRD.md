# PRD: Music Money Lab

**Wersja:** 0.1 (draft)
**Status:** do akceptacji, bez prototypu
**Kontekst:** projekt testowy na zajecia w ALK, budowany w repozytorium GitHub (nie jako artefakt)

## 1. Cel produktu

Music Money Lab to interaktywna aplikacja webowa, ktora pokazuje, jak naprawde plyna pieniadze w branzy muzycznej. Uzytkownik moze zobaczyc historie zmian formatow, policzyc podzial przychodow ze streamingu, zasymulowac oplacalnosc trasy koncertowej i porownac rynki.

Projekt ma dwa cele:

1. **Edukacyjny:** zrozumiec mechanike przychodow w muzyce przez zabawe suwakami.
2. **Warsztatowy:** pokazac wspolprace w repo na GitHubie: monorepo, testy, CI, pull requesty, automatyczny deploy.

## 2. Zalozenia i ograniczenia

- Wszystkie dane liczbowe sa **fikcyjne** (patrz `data/README.md`). Aplikacja musi to jasno komunikowac w interfejsie.
- To projekt testowy: bez backendu, bez kont uzytkownikow, bez bazy danych.
- Brak kosztow utrzymania: hosting statyczny (GitHub Pages).
- Jezyk interfejsu: polski. Kod, nazwy plikow i commity: angielski.

## 3. Uzytkownicy

| Persona | Potrzeba |
|---------|----------|
| Student/uczestnik zajec | Zrozumiec, skad biora sie pieniadze w muzyce i dlaczego umowy roznia sie wynikami |
| Prowadzacy | Miec narzedzie do pokazania mechaniki rynku na zywo, z mozliwoscia zmiany zalozen |
| Zespol projektowy | Pracowac nad modulami rownolegle na osobnych branchach i scalac przez PR |

## 4. Zakres (MVP)

### 4.1 Format Timeline
- Wykres warstwowy (stacked area) przychodow wg formatu, lata 1990-2025.
- Suwak lat i wlaczanie/wylaczanie formatow.
- Karty z kamieniami milowymi (14 wydarzen) zsynchronizowane z osia czasu.
- Dane: `format-revenue.json`, `timeline-events.json`.

**Kryteria akceptacji:**
- Wybranie roku podswietla wlasciwy punkt na wykresie i pokazuje sume oraz udzial formatow.
- Klikniecie wydarzenia przewija suwak do jego roku.
- Wylaczenie formatu przelicza udzialy procentowe.

### 4.2 Royalty Splitter
- Wybor liczby streamow (preset lub wpisana wartosc) i typu umowy (4 modele).
- Wykres kaskadowy (waterfall): od przychodu brutto do kwoty dla artysty.
- Porownanie obok siebie dwoch umow dla tej samej liczby streamow.
- Pokazanie progu recoupmentu zaliczki.
- Dane: `royalty-models.json`.

**Kryteria akceptacji:**
- Suma wszystkich czesci podzialu rowna sie przychodowi brutto (test automatyczny).
- Zmiana umowy lub liczby streamow przelicza wynik bez przeladowania strony.
- Widoczna informacja, ze stawki sa fikcyjne.

### 4.3 Tour P&L
- Budowa trasy z gotowego presetu lub wlasnych przystankow (miasto, typ sali, dystans).
- Przychody: bilety, merch. Koszty: sala, produkcja, transport, noclegi, diety, prowizje (agent, manager), ubezpieczenie.
- Wynik per koncert i dla calej trasy, oraz prog rentownosci (ile biletow musi sie sprzedac).
- Suwak obsadzenia sal (sell-through).
- Dane: `tour-templates.json`, `artists-demo.json`.

**Kryteria akceptacji:**
- Zmiana obsadzenia sal aktualizuje wynik trasy w czasie rzeczywistym.
- Prog rentownosci jest obliczany poprawnie dla kazdego typu sali (test automatyczny).
- Festiwal (stala stawka) liczy sie inaczej niz sala biletowana.

### 4.4 Market Compare
- Porownanie 4 rynkow: struktura przychodow 2025 (streaming, fizyki, download, live, sync) oraz historia udzialu streamingu 2010-2025.
- Przelacznik: wartosci bezwzgledne vs na mieszkanca (ARPU).
- Dane: `markets.json`.

**Kryteria akceptacji:**
- Segmenty kazdego rynku sumuja sie do 100 procent.
- Przelacznik zmienia skale i etykiety bez bledow.

### 4.5 Elementy wspolne
- Wybor "artysty demo" z `artists-demo.json`, ktory ustawia domyslne wartosci w modulach 4.2 i 4.3.
- Stala belka z komunikatem "Dane fikcyjne, wylacznie do celow edukacyjnych".
- Nawigacja zakladkowa, responsywny uklad (telefon i laptop).

## 5. Poza zakresem (v1)

- Dane rzeczywiste i integracje z API platform streamingowych.
- Logowanie, zapis wynikow, udostepnianie linkow.
- Eksport do PDF/Excel.
- Wersja angielska interfejsu.

## 6. Wymagania niefunkcjonalne

| Obszar | Wymaganie |
|--------|-----------|
| Wydajnosc | Pierwsze zaladowanie < 2 s na laczu domowym, przeliczenia natychmiastowe |
| Dostepnosc | Kontrast zgodny z WCAG AA, nawigacja klawiatura, opisy tekstowe wykresow |
| Jakosc | Logika obliczen w czystych funkcjach z pokryciem testami jednostkowymi |
| Przenosnosc | Dziala w aktualnych Chrome, Safari, Firefox |
| Utrzymanie | Zmiana danych nie wymaga zmian w kodzie UI |

## 7. Architektura (propozycja)

```
music-money-lab/
  apps/
    web/                 # React + TypeScript + Vite (UI)
  packages/
    core/                # czysta logika: royalty, tour, rynek (bez UI)
  data/                  # fikcyjne dane JSON + README
  docs/
    PRD.md
  .github/
    workflows/           # CI: lint, test, build; deploy do Pages
```

- **Stack:** React, TypeScript, Vite, wykresy w SVG (D3 pomocniczo lub czysty SVG), Vitest do testow.
- **Podzial:** `packages/core` nie zna Reacta i mozna go testowac niezaleznie. `apps/web` tylko wizualizuje wyniki.
- **Walidacja danych:** skrypt sprawdza schemat JSON i sumy procentowe w CI.

## 8. Wzorzec pracy na GitHubie

- Branch `main` chroniony, zmiany tylko przez pull request.
- Konwencja branchy: `feat/<modul>`, `fix/<opis>`, `data/<opis>`, `docs/<opis>`.
- Kazdy modul z sekcji 4 jest osobnym issue z kryteriami akceptacji z tego dokumentu.
- CI uruchamia sie przy kazdym PR: lint, testy jednostkowe, walidacja danych, build.
- Merge do `main` wywoluje deploy na GitHub Pages.
- Szablon PR zawiera checklist: testy, aktualizacja danych/README, zrzut ekranu zmiany UI.

## 9. Plan etapow

| Etap | Zakres | Wynik |
|------|--------|-------|
| 0 | Dane fikcyjne i PRD | Ten dokument i folder `data/` (gotowe) |
| 1 | Szkielet repo: monorepo, tooling, CI, deploy pusta strona | Zielone CI, dzialajaca strona na Pages |
| 2 | `packages/core` z testami: royalty i tour | Logika obliczen pokryta testami |
| 3 | Moduly UI: Format Timeline, Royalty Splitter | Dwie dzialajace zakladki |
| 4 | Moduly UI: Tour P&L, Market Compare | Komplet czterech zakladek |
| 5 | Dopracowanie: wyglad, dostepnosc, README, szablony PR/issue | Wersja do pokazania na zajeciach |

## 10. Metryki sukcesu (projekt zajeciowy)

- Wszystkie 4 moduly dzialaja i spelniaja swoje kryteria akceptacji.
- CI zielone na `main`, strona dostepna publicznie.
- Min. 5 pull requestow zmergowanych przez co najmniej dwie osoby lub dwa tryby pracy (czlowiek + AI).
- Logika `packages/core` z testami dla kazdego wzoru finansowego.

## 11. Ryzyka

| Ryzyko | Skutek | Reakcja |
|--------|--------|---------|
| Uzytkownik bierze fikcyjne dane za prawdziwe | Bledne wnioski | Stala belka z komunikatem, disclaimer w `meta` kazdego pliku |
| Zbyt duzy zakres na czas zajec | Niedokonczone moduly | MVP ma 4 moduly, Timeline i Royalty Splitter jako priorytet |
| Rozjazd danych i logiki | Bledy obliczen | Walidacja schematu danych w CI i testy sum |
| Rozne style kodu w zespole | Chaos w repo | Lint i formatowanie wymuszane w CI |

## 12. Otwarte pytania

1. Czy interfejs ma byc od razu dwujezyczny, czy tylko po polsku?
2. Czy wykresy robimy samym SVG, czy z lekka biblioteka (np. D3)?
3. Czy deploy na GitHub Pages wystarczy, czy testujemy tez Vercel?
4. Ktory modul wchodzi pierwszy do implementacji (propozycja: Royalty Splitter)?

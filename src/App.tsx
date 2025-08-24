import React, { useMemo, useState } from 'react'
import './style.css'

function clampMinute(m: number) {
  const day = 24 * 60
  return ((m % day) + day) % day
}

function parseTimeToMinutes(value: string): number | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return clampMinute(h * 60 + m)
}

function minutesToHHMM(total: number): string {
  const m = clampMinute(total)
  const hh = Math.floor(m / 60)
  const mm = m % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export default function App() {
  const [fine, setFine] = useState('')     // HH:MM
  const [durata, setDurata] = useState('') // HH:MM

  const fineMin = useMemo(() => parseTimeToMinutes(fine), [fine])
  const durataMin = useMemo(() => parseTimeToMinutes(durata), [durata])

  const delays = [3, 6, 9]

  const risultati = useMemo(() => {
    if (fineMin == null || durataMin == null) return null
    return delays.map((h) => {
      const start = clampMinute(fineMin - durataMin - h * 60)
      return { h, label: minutesToHHMM(start) }
    })
  }, [fineMin, durataMin])

  const allSet = fineMin != null && durataMin != null

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t) } catch {}
  }

  const reset = () => { setFine(''); setDurata('') }

  return (
    <main className="wrap">
      <header className="hdr">
        <div className="logo">⏱️</div>
        <div>
          <h1>Calcolatore Start Lavaggio</h1>
          <p>
            Inserisci <strong>fine lavaggio</strong> e <strong>durata</strong> (HH:MM, 24h).
            <br />Formula: <code>start = fine − durata − ritardo</code> con ritardi 3/6/9h. Il tempo si riavvolge sulle 24h.
          </p>
        </div>
      </header>

      <section className="card">
        <h2>Parametri</h2>
        <div className="grid">
          <label className="field">
            <span>Orario fine lavaggio</span>
            <input type="time" step={60} value={fine} onChange={(e) => setFine(e.target.value)} />
          </label>
          <label className="field">
            <span>Durata lavaggio</span>
            <input type="time" step={60} value={durata} onChange={(e) => setDurata(e.target.value)} />
          </label>
          <div className="actions">
            <button className="secondary" onClick={reset}>Reset</button>
          </div>
        </div>
      </section>

      <section className="grid results">
        {delays.map((h) => {
          const label = risultati?.find(r => r.h === h)?.label ?? '--:--'
          return (
            <div className="card" key={h}>
              <h3>Ritardo {h}h</h3>
              <div className="time">{label}</div>
              <button onClick={() => copy(label)} disabled={!allSet}>Copia</button>
            </div>
          )
        })}
      </section>

      <footer className="foot">Niente orari negativi: sotto 00:00 si riavvolge aggiungendo 24 ore.</footer>
    </main>
  )
}

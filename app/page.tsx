"use client"

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  MutableRefObject
} from "react"

import { supabase } from "@/lib/supabase"

type Match = {
  id: number
  round: string
  team_home?: string | null
  team_away?: string | null
  winner?: string | null
  next_match_id?: number | null
  score_home?: number | null
  score_away?: number | null
}

const TEAM_COLORS: Record<string, string> = {
  MCI: "#38bdf8",
  TOT: "#f8fafc",
  BAR: "#a855f7",
  BVB: "#facc15",
  ARS: "#ef4444",
  PSV: "#dc2626",
  NAP: "#0ea5e9",
  CHE: "#2563eb",
  INT: "#1d4ed8",
  MIL: "#dc2626",
  PSG: "#1e40af",
  LIV: "#ef4444",
  BEN: "#e11d48",
  POR: "#3b82f6",
  RMA: "#f8fafc",
  ATM: "#ef4444",
}

function getTeamColor(team?: string | null) {
  if (!team) return "#334155"
  return TEAM_COLORS[team.toUpperCase()] || "#06b6d4"
}

function getTeamLogo(team?: string | null) {
  if (!team) return null
  return `/logos/${team.toUpperCase()}.png`
}

function TeamRow({
  team,
  score,
  winner
}: {
  team?: string | null
  score?: number | null
  winner?: string | null
}) {
  const color = getTeamColor(team)
  const logo = getTeamLogo(team)
  const isWinner = team && winner === team

  return (
    <div
      className="h-[34px] flex items-center justify-between px-3 text-[11px] font-bold border-b border-white/5 last:border-b-0"
      style={{
        background: team
          ? `linear-gradient(90deg, ${color}55 0%, ${color}22 45%, rgba(15,23,42,0.82) 100%)`
          : "rgba(15,23,42,0.65)",
        boxShadow: isWinner ? `inset 0 0 16px ${color}55` : undefined,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-[20px] h-[20px] rounded-full flex items-center justify-center bg-slate-900 border border-white/20 overflow-hidden shrink-0"
          style={{
            boxShadow: team ? `0 0 10px ${color}99` : undefined,
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt={team || "time"}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="w-full h-full rounded-full bg-slate-600" />
          )}
        </div>

        <span
          className="truncate"
          style={{
            color: team && color === "#f8fafc" ? "#ffffff" : "#f8fafc"
          }}
        >
          {team || "A definir"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500">-</span>
        <span className="text-cyan-300 min-w-[12px] text-right">
          {score ?? "-"}
        </span>
      </div>
    </div>
  )
}

function MatchBox({ match }: { match: Match }) {
  const winnerColor = getTeamColor(match.winner)

  return (
    <div
      className="relative w-56 rounded-md overflow-hidden border bg-slate-950/80"
      style={{
        borderColor: match.winner ? winnerColor : "rgba(148,163,184,0.18)",
        boxShadow: match.winner ? `0 0 18px ${winnerColor}66` : undefined,
      }}
    >
      <TeamRow
        team={match.team_home}
        score={match.score_home}
        winner={match.winner}
      />

      <TeamRow
        team={match.team_away}
        score={match.score_away}
        winner={match.winner}
      />
    </div>
  )
}

function BracketColumn({
  title,
  data,
  refs
}: {
  title: string
  data: Match[]
  refs: MutableRefObject<Record<number, HTMLDivElement | null>>
}) {
  return (
    <div className="flex flex-col justify-around h-full w-56 relative group">
      <div className="absolute -top-12 left-0 right-0 text-center">
        <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold">
          {title}
        </span>
      </div>

      {data.map((m) => (
        <div
          key={m.id}
          className="relative z-10 py-2"
          ref={(el) => { refs.current[m.id] = el }}
        >
          <MatchBox match={m} />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [paths, setPaths] = useState<string[]>([])
  const [simulating, setSimulating] = useState(false)
  const [champion, setChampion] = useState<string | null>(null)

  const matchRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  async function fetchMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("id")

    setMatches(data || [])

    const finalMatch = (data || []).find((m) => m.round === "final")
    setChampion(finalMatch?.winner || null)
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const bracketData = useMemo(() => {
    const filterByRound = (round: string) =>
      matches.filter(m => m.round === round).sort((a, b) => a.id - b.id)

    const round16 = filterByRound("round16")
    const quarter = filterByRound("quarter")
    const semi = filterByRound("semi")
    const final = filterByRound("final")

    return {
      left: {
        r16: round16.slice(0, 4),
        qf: quarter.slice(0, 2),
        sf: semi.slice(0, 1),
      },
      final,
      right: {
        r16: round16.slice(4, 8),
        qf: quarter.slice(2, 4),
        sf: semi.slice(1, 2),
      },
    }
  }, [matches])

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function gerarPlacar() {
    let home = Math.floor(Math.random() * 5)
    let away = Math.floor(Math.random() * 5)

    while (home === away) {
      home = Math.floor(Math.random() * 5)
      away = Math.floor(Math.random() * 5)
    }

    return { home, away }
  }

  async function saveMatch(match: Match) {
    await supabase
      .from("matches")
      .update({
        team_home: match.team_home,
        team_away: match.team_away,
        winner: match.winner,
        score_home: match.score_home,
        score_away: match.score_away,
      })
      .eq("id", match.id)
  }

  function placeWinnerInNextMatch(
    list: Match[],
    nextMatchId: number | null | undefined,
    winner: string
  ) {
    if (!nextMatchId) return list

    return list.map((m) => {
      if (m.id !== nextMatchId) return m

      if (!m.team_home) {
        return { ...m, team_home: winner }
      }

      if (!m.team_away) {
        return { ...m, team_away: winner }
      }

      return m
    })
  }

  async function simulateOneMatch(list: Match[], matchId: number) {
    const match = list.find(m => m.id === matchId)

    if (!match) return list
    if (!match.team_home || !match.team_away) return list
    if (match.winner) return list

    const score = gerarPlacar()
    const winner = score.home > score.away ? match.team_home : match.team_away

    const updatedMatch: Match = {
      ...match,
      score_home: score.home,
      score_away: score.away,
      winner
    }

    let updatedList = list.map(m =>
      m.id === updatedMatch.id ? updatedMatch : m
    )

    updatedList = placeWinnerInNextMatch(
      updatedList,
      updatedMatch.next_match_id,
      winner
    )

    const nextMatch = updatedMatch.next_match_id
      ? updatedList.find(m => m.id === updatedMatch.next_match_id)
      : null

    setMatches(updatedList)
    await saveMatch(updatedMatch)

    if (nextMatch) {
      await saveMatch(nextMatch)
    }

    await sleep(550)

    return updatedList
  }

  async function simulateRound(localMatches: Match[], round: string) {
    let updatedList = [...localMatches]

    const roundMatches = updatedList
      .filter(m => m.round === round)
      .sort((a, b) => a.id - b.id)

    for (const match of roundMatches) {
      updatedList = await simulateOneMatch(updatedList, match.id)
    }

    return updatedList
  }

  async function simulateTournament() {
    setSimulating(true)
    setChampion(null)

    let localMatches = [...matches]

    localMatches = await simulateRound(localMatches, "round16")
    await sleep(700)

    localMatches = await simulateRound(localMatches, "quarter")
    await sleep(700)

    localMatches = await simulateRound(localMatches, "semi")
    await sleep(700)

    localMatches = await simulateRound(localMatches, "final")

    const finalMatch = localMatches.find(m => m.round === "final")
    setChampion(finalMatch?.winner || null)

    await fetchMatches()
    setSimulating(false)
  }

  async function resetTournament() {
    setSimulating(true)
    setChampion(null)

    const updatedMatches = matches.map((m) => {
      const isRound16 = m.round === "round16"

      return {
        ...m,
        winner: null,
        score_home: null,
        score_away: null,
        team_home: isRound16 ? m.team_home : null,
        team_away: isRound16 ? m.team_away : null,
      }
    })

    setMatches(updatedMatches)

    await Promise.all(
      updatedMatches.map((m) =>
        supabase
          .from("matches")
          .update({
            winner: null,
            score_home: null,
            score_away: null,
            team_home: m.team_home,
            team_away: m.team_away,
          })
          .eq("id", m.id)
      )
    )

    await fetchMatches()
    setSimulating(false)
  }

  const drawLines = useCallback(() => {
    if (!containerRef.current || matches.length === 0) return

    const container = containerRef.current.getBoundingClientRect()
    const newPaths: string[] = []

    const getBox = (match?: Match) => {
      if (!match) return null

      const el = matchRefs.current[match.id]
      if (!el) return null

      const r = el.getBoundingClientRect()

      return {
        left: r.left - container.left,
        right: r.right - container.left,
        centerY: r.top + r.height / 2 - container.top,
      }
    }

    const drawPair = (
      first: Match | undefined,
      second: Match | undefined,
      target: Match | undefined,
      side: "left" | "right"
    ) => {
      const a = getBox(first)
      const b = getBox(second)
      const t = getBox(target)

      if (!a || !b || !t) return

      const isLeft = side === "left"

      const startA = isLeft ? a.right : a.left
      const startB = isLeft ? b.right : b.left
      const targetX = isLeft ? t.left : t.right

      const offset = 34
      const connectorX = isLeft ? startA + offset : startA - offset
      const middleY = (a.centerY + b.centerY) / 2

      newPaths.push(`
        M ${startA},${a.centerY}
        L ${connectorX},${a.centerY}
        L ${connectorX},${b.centerY}
        L ${startB},${b.centerY}
      `)

      newPaths.push(`
        M ${connectorX},${middleY}
        L ${targetX},${middleY}
      `)
    }

    const drawSingle = (
      from: Match | undefined,
      to: Match | undefined,
      side: "left" | "right"
    ) => {
      const f = getBox(from)
      const t = getBox(to)

      if (!f || !t) return

      const isLeft = side === "left"
      const x1 = isLeft ? f.right : f.left
      const x2 = isLeft ? t.left : t.right

      newPaths.push(`
        M ${x1},${f.centerY}
        L ${x2},${f.centerY}
      `)
    }

    drawPair(bracketData.left.r16[0], bracketData.left.r16[1], bracketData.left.qf[0], "left")
    drawPair(bracketData.left.r16[2], bracketData.left.r16[3], bracketData.left.qf[1], "left")
    drawPair(bracketData.left.qf[0], bracketData.left.qf[1], bracketData.left.sf[0], "left")
    drawSingle(bracketData.left.sf[0], bracketData.final[0], "left")

    drawPair(bracketData.right.r16[0], bracketData.right.r16[1], bracketData.right.qf[0], "right")
    drawPair(bracketData.right.r16[2], bracketData.right.r16[3], bracketData.right.qf[1], "right")
    drawPair(bracketData.right.qf[0], bracketData.right.qf[1], bracketData.right.sf[0], "right")
    drawSingle(bracketData.right.sf[0], bracketData.final[0], "right")

    setPaths(newPaths)
  }, [matches, bracketData])

  useEffect(() => {
    const observer = new ResizeObserver(() => drawLines())

    if (containerRef.current) observer.observe(containerRef.current)
    window.addEventListener("resize", drawLines)

    const timeout = setTimeout(drawLines, 800)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", drawLines)
      clearTimeout(timeout)
    }
  }, [matches, drawLines])

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 overflow-hidden">

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <div className="flex gap-4">
          <button
            onClick={simulateTournament}
            disabled={simulating}
            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-black uppercase tracking-widest hover:bg-cyan-300 disabled:opacity-50"
          >
            {simulating ? "Simulando..." : "Simular Campeonato"}
          </button>

          <button
            onClick={resetTournament}
            disabled={simulating}
            className="px-6 py-3 rounded-xl border border-cyan-500 text-cyan-300 font-black uppercase tracking-widest hover:bg-cyan-500/10 disabled:opacity-50"
          >
            Resetar
          </button>
        </div>

        {champion && (
          <div
            className="px-6 py-2 rounded-xl border font-black tracking-[0.25em] uppercase"
            style={{
              color: getTeamColor(champion),
              borderColor: getTeamColor(champion),
              backgroundColor: `${getTeamColor(champion)}22`,
              boxShadow: `0 0 18px ${getTeamColor(champion)}55`
            }}
          >
            Campeão: {champion}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-[1800px] h-[850px] flex items-center justify-between gap-4 overflow-visible"
      >

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          style={{ overflow: "visible" }}
        >
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="#06b6d4"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          ))}
        </svg>

        <div className="z-10 flex gap-12 h-full items-center">
          <BracketColumn title="Oitavas de Final" data={bracketData.left.r16} refs={matchRefs} />
          <BracketColumn title="Quartas de Final" data={bracketData.left.qf} refs={matchRefs} />
          <BracketColumn title="Semifinal" data={bracketData.left.sf} refs={matchRefs} />
        </div>

        <div className="z-10 flex flex-col items-center justify-center">
          <span className="text-cyan-400 font-bold mb-4 tracking-[0.3em]">
            GRANDE FINAL
          </span>

          {bracketData.final.map((m) => (
            <div key={m.id} ref={(el) => { matchRefs.current[m.id] = el }}>
              <MatchBox match={m} />
            </div>
          ))}
        </div>

        <div className="z-10 flex gap-12 h-full items-center flex-row-reverse">
          <BracketColumn title="Oitavas de Final" data={bracketData.right.r16} refs={matchRefs} />
          <BracketColumn title="Quartas de Final" data={bracketData.right.qf} refs={matchRefs} />
          <BracketColumn title="Semifinal" data={bracketData.right.sf} refs={matchRefs} />
        </div>

      </div>
    </main>
  )
}
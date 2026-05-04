"use client"

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  MutableRefObject
} from "react"

type Match = {
  id: number
  round: "round16" | "quarter" | "semi" | "final"
  team_home?: string | null
  team_away?: string | null
  winner?: string | null
  next_match_id?: number | null
  score_home?: number | null
  score_away?: number | null
}

type Team = {
  name: string
  logo: string
  color: string
}

const COLORS = [
  "#38bdf8", "#f8fafc", "#a855f7", "#facc15",
  "#ef4444", "#dc2626", "#0ea5e9", "#2563eb",
  "#1d4ed8", "#e11d48", "#3b82f6", "#22c55e",
  "#f97316", "#14b8a6", "#8b5cf6", "#ec4899"
]

const LOGOS = [
  { name: "Manchester City", file: "/logos/MCI.png" },
  { name: "Tottenham", file: "/logos/TOT.png" },
  { name: "Barcelona", file: "/logos/BAR.png" },
  { name: "Borussia Dortmund", file: "/logos/BVB.png" },
  { name: "Arsenal", file: "/logos/ARS.png" },
  { name: "PSV", file: "/logos/PSV.png" },
  { name: "Napoli", file: "/logos/NAP.png" },
  { name: "Chelsea", file: "/logos/CHE.png" },
  { name: "Inter", file: "/logos/INT.png" },
  { name: "Milan", file: "/logos/MIL.png" },
  { name: "PSG", file: "/logos/PSG.png" },
  { name: "Liverpool", file: "/logos/LIV.png" },
  { name: "Benfica", file: "/logos/BEN.png" },
  { name: "Porto", file: "/logos/POR.png" },
  { name: "Real Madrid", file: "/logos/RMA.png" },
  { name: "Atlético de Madrid", file: "/logos/ATM.png" },
]

function getTeam(team?: string | null, teams: Team[] = []) {
  if (!team) return undefined
  return teams.find(t => t.name === team)
}

function getTeamColor(team?: string | null, teams: Team[] = []) {
  return getTeam(team, teams)?.color || "#334155"
}

function createInitialMatches(selectedTeams: Team[], count: 4 | 8 | 16): Match[] {
  const matches: Match[] = []

  if (count === 16) {
    for (let i = 0; i < 8; i++) {
      matches.push({
        id: i + 1,
        round: "round16",
        team_home: selectedTeams[i * 2]?.name || null,
        team_away: selectedTeams[i * 2 + 1]?.name || null,
        next_match_id: 9 + Math.floor(i / 2),
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    for (let i = 0; i < 4; i++) {
      matches.push({
        id: 9 + i,
        round: "quarter",
        team_home: null,
        team_away: null,
        next_match_id: 13 + Math.floor(i / 2),
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    for (let i = 0; i < 2; i++) {
      matches.push({
        id: 13 + i,
        round: "semi",
        team_home: null,
        team_away: null,
        next_match_id: 15,
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    matches.push({
      id: 15,
      round: "final",
      team_home: null,
      team_away: null,
      next_match_id: null,
      winner: null,
      score_home: null,
      score_away: null
    })
  }

  if (count === 8) {
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: i + 1,
        round: "quarter",
        team_home: selectedTeams[i * 2]?.name || null,
        team_away: selectedTeams[i * 2 + 1]?.name || null,
        next_match_id: 5 + Math.floor(i / 2),
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    for (let i = 0; i < 2; i++) {
      matches.push({
        id: 5 + i,
        round: "semi",
        team_home: null,
        team_away: null,
        next_match_id: 7,
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    matches.push({
      id: 7,
      round: "final",
      team_home: null,
      team_away: null,
      next_match_id: null,
      winner: null,
      score_home: null,
      score_away: null
    })
  }

  if (count === 4) {
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: i + 1,
        round: "semi",
        team_home: selectedTeams[i * 2]?.name || null,
        team_away: selectedTeams[i * 2 + 1]?.name || null,
        next_match_id: 3,
        winner: null,
        score_home: null,
        score_away: null
      })
    }

    matches.push({
      id: 3,
      round: "final",
      team_home: null,
      team_away: null,
      next_match_id: null,
      winner: null,
      score_home: null,
      score_away: null
    })
  }

  return matches
}

function TeamRow({
  team,
  score,
  winner,
  teams
}: {
  team?: string | null
  score?: number | null
  winner?: string | null
  teams: Team[]
}) {
  const t = getTeam(team, teams)
  const color = t?.color || "#334155"
  const isWinner = team && winner === team

  return (
    <div
      className="h-[34px] flex items-center justify-between px-3 text-[11px] font-bold border-b border-white/5 last:border-b-0"
      style={{
        background: team
          ? `linear-gradient(90deg, ${color}66 0%, ${color}30 55%, rgba(15,23,42,0.9) 100%)`
          : "rgba(15,23,42,0.65)",
        boxShadow: isWinner ? `inset 0 0 18px ${color}77` : undefined,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-[22px] h-[22px] rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0">
          {t?.logo ? (
            <img src={t.logo} alt={team || "logo"} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-600" />
          )}
        </div>

        <span className="truncate text-white">
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

function MatchBox({ match, teams }: { match: Match; teams: Team[] }) {
  const winnerColor = getTeamColor(match.winner, teams)

  return (
    <div
      className="relative w-56 rounded-md overflow-hidden border bg-slate-950/80"
      style={{
        borderColor: match.winner ? winnerColor : "rgba(148,163,184,0.18)",
        boxShadow: match.winner ? `0 0 18px ${winnerColor}66` : undefined,
      }}
    >
      <TeamRow team={match.team_home} score={match.score_home} winner={match.winner} teams={teams} />
      <TeamRow team={match.team_away} score={match.score_away} winner={match.winner} teams={teams} />
    </div>
  )
}

function BracketColumn({
  title,
  data,
  refs,
  teams
}: {
  title: string
  data: Match[]
  refs: MutableRefObject<Record<number, HTMLDivElement | null>>
  teams: Team[]
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
          <MatchBox match={m} teams={teams} />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [teamCount, setTeamCount] = useState<4 | 8 | 16>(16)
  const [paths, setPaths] = useState<string[]>([])
  const [register, setRegister] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [champion, setChampion] = useState<string | null>(null)

  const matchRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams")
    const savedCount = localStorage.getItem("team-count")
    const savedMatches = localStorage.getItem("matches")

    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
      setRegister(false)
    }

    if (savedCount === "4" || savedCount === "8" || savedCount === "16") {
      setTeamCount(Number(savedCount) as 4 | 8 | 16)
    }

    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches)
      setMatches(parsedMatches)

      const finalMatch = parsedMatches.find((m: Match) => m.round === "final")
      setChampion(finalMatch?.winner || null)
    }
  }, [])

  function setName(i: number, name: string) {
    const copy = [...teams]
    copy[i] = {
      name,
      logo: copy[i]?.logo || "",
      color: COLORS[i] || "#06b6d4"
    }
    setTeams(copy)
  }

  function setLogo(i: number, logo: string) {
    const copy = [...teams]
    copy[i] = {
      name: copy[i]?.name || "",
      logo,
      color: COLORS[i] || "#06b6d4"
    }
    setTeams(copy)
  }

  function resetCadastro() {
    localStorage.removeItem("teams")
    localStorage.removeItem("team-count")
    localStorage.removeItem("matches")
    setTeams([])
    setMatches([])
    setTeamCount(16)
    setChampion(null)
  }

  function gerar() {
    const selectedTeams = teams
      .filter(t => t?.name?.trim())
      .slice(0, 16)

    if (selectedTeams.length < 4) {
      alert("Cadastre no mínimo 4 times.")
      return
    }

    if (![4, 8, 16].includes(selectedTeams.length)) {
      alert("Use 4, 8 ou 16 times para o chaveamento funcionar corretamente.")
      return
    }

    const count = selectedTeams.length as 4 | 8 | 16
    const createdMatches = createInitialMatches(selectedTeams, count)

    localStorage.setItem("teams", JSON.stringify(selectedTeams))
    localStorage.setItem("team-count", String(count))
    localStorage.setItem("matches", JSON.stringify(createdMatches))

    setTeams(selectedTeams)
    setTeamCount(count)
    setMatches(createdMatches)
    setChampion(null)
    setRegister(false)
  }

  const bracketData = useMemo(() => {
    const filterByRound = (round: Match["round"]) =>
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

  function placeWinnerInNextMatch(
    list: Match[],
    nextMatchId: number | null | undefined,
    winner: string
  ) {
    if (!nextMatchId) return list

    return list.map((m) => {
      if (m.id !== nextMatchId) return m
      if (!m.team_home) return { ...m, team_home: winner }
      if (!m.team_away) return { ...m, team_away: winner }
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

    setMatches(updatedList)
    localStorage.setItem("matches", JSON.stringify(updatedList))

    await sleep(500)

    return updatedList
  }

  async function simulateRound(localMatches: Match[], round: Match["round"]) {
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

    if (teamCount === 16) {
      localMatches = await simulateRound(localMatches, "round16")
      await sleep(600)
    }

    if (teamCount === 16 || teamCount === 8) {
      localMatches = await simulateRound(localMatches, "quarter")
      await sleep(600)
    }

    localMatches = await simulateRound(localMatches, "semi")
    await sleep(600)

    localMatches = await simulateRound(localMatches, "final")

    const finalMatch = localMatches.find(m => m.round === "final")
    setChampion(finalMatch?.winner || null)

    localStorage.setItem("matches", JSON.stringify(localMatches))
    setSimulating(false)
  }

  function resetTournament() {
    const createdMatches = createInitialMatches(teams, teamCount)
    setMatches(createdMatches)
    setChampion(null)
    localStorage.setItem("matches", JSON.stringify(createdMatches))
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

    if (teamCount === 16) {
      drawPair(bracketData.left.r16[0], bracketData.left.r16[1], bracketData.left.qf[0], "left")
      drawPair(bracketData.left.r16[2], bracketData.left.r16[3], bracketData.left.qf[1], "left")
      drawPair(bracketData.right.r16[0], bracketData.right.r16[1], bracketData.right.qf[0], "right")
      drawPair(bracketData.right.r16[2], bracketData.right.r16[3], bracketData.right.qf[1], "right")
    }

    if (teamCount === 16 || teamCount === 8) {
      drawPair(bracketData.left.qf[0], bracketData.left.qf[1], bracketData.left.sf[0], "left")
      drawPair(bracketData.right.qf[0], bracketData.right.qf[1], bracketData.right.sf[0], "right")
    }

    drawSingle(bracketData.left.sf[0], bracketData.final[0], "left")
    drawSingle(bracketData.right.sf[0], bracketData.final[0], "right")

    setPaths(newPaths)
  }, [matches, bracketData, teamCount])

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

  if (register) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-8">
        <h1 className="text-4xl text-cyan-400 font-black text-center mb-8 tracking-[0.25em]">
          CADASTRO DOS TIMES
        </h1>

        <p className="text-center text-slate-400 mb-6">
          Cadastre no mínimo 4 e no máximo 16 times. Use 4, 8 ou 16 times.
        </p>

        <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const t = teams[i]

            return (
              <div key={i} className="bg-slate-900/80 border border-cyan-500/20 p-4 rounded-xl">
                <p className="text-cyan-400 font-bold mb-2">Time {i + 1}</p>

                <input
                  value={t?.name || ""}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder="Nome do time"
                  className="w-full mb-2 p-2 bg-black rounded border border-slate-700 outline-none focus:border-cyan-400"
                />

                <select
                  value={t?.logo || ""}
                  onChange={(e) => setLogo(i, e.target.value)}
                  className="w-full mb-2 p-2 bg-black rounded border border-slate-700 outline-none focus:border-cyan-400"
                >
                  <option value="">Escolher logo</option>
                  {LOGOS.map((logo) => (
                    <option key={logo.file} value={logo.file}>
                      {logo.name}
                    </option>
                  ))}
                </select>

                {t?.logo && (
                  <img
                    src={t.logo}
                    alt={t.name}
                    className="w-14 h-14 object-contain mx-auto mt-3 bg-white rounded-full p-1"
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={gerar}
            className="px-8 py-3 bg-cyan-500 text-black font-black rounded uppercase tracking-widest hover:bg-cyan-300"
          >
            Gerar Chaveamento
          </button>

          <button
            onClick={resetCadastro}
            className="px-8 py-3 border border-red-500 text-red-300 font-black rounded uppercase tracking-widest hover:bg-red-500/10"
          >
            Resetar Cadastro
          </button>
        </div>
      </main>
    )
  }

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

          <button
            onClick={() => setRegister(true)}
            disabled={simulating}
            className="px-6 py-3 rounded-xl border border-purple-500 text-purple-300 font-black uppercase tracking-widest hover:bg-purple-500/10 disabled:opacity-50"
          >
            Editar Times
          </button>
        </div>

        {champion && (
          <div
            className="px-6 py-2 rounded-xl border font-black tracking-[0.25em] uppercase"
            style={{
              color: getTeamColor(champion, teams),
              borderColor: getTeamColor(champion, teams),
              backgroundColor: `${getTeamColor(champion, teams)}22`,
              boxShadow: `0 0 18px ${getTeamColor(champion, teams)}55`
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
          {teamCount === 16 && (
            <BracketColumn title="Oitavas de Final" data={bracketData.left.r16} refs={matchRefs} teams={teams} />
          )}

          {(teamCount === 16 || teamCount === 8) && (
            <BracketColumn title="Quartas de Final" data={bracketData.left.qf} refs={matchRefs} teams={teams} />
          )}

          <BracketColumn title="Semifinal" data={bracketData.left.sf} refs={matchRefs} teams={teams} />
        </div>

        <div className="z-10 flex flex-col items-center justify-center">
          <span className="text-cyan-400 font-bold mb-4 tracking-[0.3em]">
            GRANDE FINAL
          </span>

          {bracketData.final.map((m) => (
            <div key={m.id} ref={(el) => { matchRefs.current[m.id] = el }}>
              <MatchBox match={m} teams={teams} />
            </div>
          ))}
        </div>

        <div className="z-10 flex gap-12 h-full items-center flex-row-reverse">
          {teamCount === 16 && (
            <BracketColumn title="Oitavas de Final" data={bracketData.right.r16} refs={matchRefs} teams={teams} />
          )}

          {(teamCount === 16 || teamCount === 8) && (
            <BracketColumn title="Quartas de Final" data={bracketData.right.qf} refs={matchRefs} teams={teams} />
          )}

          <BracketColumn title="Semifinal" data={bracketData.right.sf} refs={matchRefs} teams={teams} />
        </div>
      </div>
    </main>
  )
}




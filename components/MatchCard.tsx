"use client"

import React from "react"

// Tipagem baseada na sua estrutura de banco de dados
type MatchProps = {
  match: {
    id: number
    team_home?: string | null
    team_away?: string | null
    winner?: string | null
    round?: string
  }
}

export default function MatchCard({ match }: MatchProps) {
  // Helpers para estilo
  const isHomeWinner = match.winner === match.team_home && match.team_home !== null
  const isAwayWinner = match.winner === match.team_away && match.team_away !== null

  return (
    <div className="w-52 bg-[#0f172a]/80 border border-slate-800 rounded shadow-lg overflow-hidden backdrop-blur-sm transition-all hover:border-cyan-500/50 group">
      {/* Time da Casa */}
      <div className={`flex items-center justify-between p-2 px-3 border-b border-slate-800/40 ${isHomeWinner ? 'bg-cyan-500/5' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Placeholder para Escudo/Bandeira */}
          <div className={`w-5 h-5 rounded-full flex-shrink-0 ${match.team_home ? 'bg-slate-700' : 'bg-slate-800/50'} border border-slate-700`} />
          
          <span className={`text-[11px] font-semibold truncate ${isHomeWinner ? 'text-white' : 'text-slate-400'}`}>
            {match.team_home || "A definir"}
          </span>
        </div>
        
        {/* Placar (Estático ou dinâmico conforme seu banco) */}
        <span className={`text-xs font-bold ${isHomeWinner ? 'text-cyan-400' : 'text-slate-600'}`}>
          -
        </span>
      </div>

      {/* Time de Fora */}
      <div className={`flex items-center justify-between p-2 px-3 ${isAwayWinner ? 'bg-cyan-500/5' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`w-5 h-5 rounded-full flex-shrink-0 ${match.team_away ? 'bg-slate-700' : 'bg-slate-800/50'} border border-slate-700`} />
          
          <span className={`text-[11px] font-semibold truncate ${isAwayWinner ? 'text-white' : 'text-slate-400'}`}>
            {match.team_away || "A definir"}
          </span>
        </div>

        <span className={`text-xs font-bold ${isAwayWinner ? 'text-cyan-400' : 'text-slate-600'}`}>
          -
        </span>
      </div>

      {/* Detalhe visual lateral (opcional - estilo Champions) */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-cyan-500 transition-all" />
    </div>
  )
}
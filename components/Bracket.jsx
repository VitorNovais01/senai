export default function Bracket() {
  return (
    <div className="bracket-container">
      
      {/* LADO ESQUERDO */}
      <div className="side">
        <div className="match">
          <span>PSG 1</span>
          <span>LIV 1</span>
        </div>

        <div className="match">
          <span>PSG 5</span>
          <span>AVL 4</span>
        </div>

        <div className="match">
          <span>CLU 1</span>
          <span>AVL 6</span>
        </div>

        <div className="match">
          <span>RMA 2</span>
          <span>ATM 2</span>
        </div>

        <div className="match">
          <span>RMA 1</span>
          <span>ARS 5</span>
        </div>

        <div className="match">
          <span>PSV 3</span>
          <span>ARS 9</span>
        </div>
      </div>

      {/* CENTRO */}
      <div className="center">
        <h1>🏆</h1>
        <p>FINAL</p>
      </div>

      {/* LADO DIREITO */}
      <div className="side">
        <div className="match">
          <span>SLB 1</span>
          <span>BAR 4</span>
        </div>

        <div className="match">
          <span>BAR 5</span>
          <span>BVB 3</span>
        </div>

        <div className="match">
          <span>BVB 3</span>
          <span>LIL 2</span>
        </div>

        <div className="match">
          <span>FCB 5</span>
          <span>LEV 0</span>
        </div>

        <div className="match">
          <span>FCB 3</span>
          <span>INT 4</span>
        </div>

        <div className="match">
          <span>FEY 1</span>
          <span>INT 4</span>
        </div>
      </div>
    </div>
  )
}
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Option A: image du logo fourni */}
      {/* <img src="/logo-eliatis.png" alt="EliAtis" className="h-8 w-auto"/> */}
      {/* Option B: logo texte script */}
      <span className="font-script text-3xl" style={{ letterSpacing: 1 }}>
        EliAtis
      </span>
    </div>
  );
}


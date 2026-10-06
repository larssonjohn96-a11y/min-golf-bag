import { useState } from "react";
import { User } from "lucide-react";
export type ComparisonBagClub = {
  label: string;
  brand?: string;
  model?: string;
  loft?: string;
  shaft?: string;
  flex?: string;
  length?: string;
  lie?: string;
  grip?: string;
  carry?: number;
  dispersion?: number;
};

export type ComparisonBagProfile = {
  bagHcp?: number;
  mappedCount: number;
  clubCount: number;
  clubs: ComparisonBagClub[];
};

const glassCard = "border border-white/70 bg-muted/55 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.28)] backdrop-blur-2xl backdrop-saturate-125 dark:border-white/10 dark:bg-white/[0.06]";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("");
}

function Avatar({ name, url, side }: { name:string; url?:string|null; side:"left"|"right" }) {
  const tone = side === "left"
    ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_10px_28px_-16px_rgba(59,130,246,0.6)]"
    : "border-red-500 bg-red-500/10 text-red-500 shadow-[0_10px_28px_-16px_rgba(239,68,68,0.55)]";
  return <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] font-display text-xl ${tone}`}>
    {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : initials(name) || <User className="h-6 w-6" />}
  </div>;
}

type BagCompareTarget = "friend" | "hcp30" | "hcp20" | "hcp10" | "scratch" | "tour" | "tour-long";

const BAG_TARGETS: Array<{ id: BagCompareTarget; label: string; shortLabel: string }> = [
  { id: "friend", label: "Kompis", shortLabel: "Kompis" },
  { id: "hcp30", label: "HCP 30", shortLabel: "HCP 30" },
  { id: "hcp20", label: "HCP 20", shortLabel: "HCP 20" },
  { id: "hcp10", label: "HCP 10", shortLabel: "HCP 10" },
  { id: "scratch", label: "HCP 0", shortLabel: "HCP 0" },
  { id: "tour", label: "Tour", shortLabel: "Tour" },
  { id: "tour-long", label: "Tour Long Hitter", shortLabel: "Long Hitter" },
];

const BENCHMARK_CARRY: Record<Exclude<BagCompareTarget, "friend">, Record<string, number>> = {
  hcp30: { Driver:185,"3W":170,"5W":160,"4H":150,"5H":145,"4i":145,"5i":137,"6i":128,"7i":118,"8i":108,"9i":98,PW:88,"48°":82,"50°":78,"52°":74,"54°":70,"56°":66,"58°":62,"60°":58 },
  hcp20: { Driver:200,"3W":185,"5W":175,"4H":165,"5H":158,"4i":158,"5i":150,"6i":140,"7i":130,"8i":120,"9i":110,PW:100,"48°":94,"50°":90,"52°":86,"54°":82,"56°":78,"58°":74,"60°":70 },
  hcp10: { Driver:220,"3W":203,"5W":191,"4H":180,"5H":172,"4i":174,"5i":165,"6i":155,"7i":145,"8i":135,"9i":125,PW:114,"48°":108,"50°":103,"52°":98,"54°":93,"56°":88,"58°":83,"60°":78 },
  scratch:{ Driver:240,"3W":220,"5W":207,"4H":194,"5H":185,"4i":188,"5i":178,"6i":168,"7i":158,"8i":148,"9i":138,PW:126,"48°":120,"50°":115,"52°":110,"54°":104,"56°":98,"58°":92,"60°":86 },
  tour:   { Driver:255,"3W":235,"5W":220,"4H":205,"5H":196,"4i":198,"5i":188,"6i":178,"7i":168,"8i":158,"9i":148,PW:136,"48°":130,"50°":125,"52°":120,"54°":114,"56°":108,"58°":102,"60°":96 },
  "tour-long":{ Driver:280,"3W":258,"5W":242,"4H":225,"5H":215,"4i":218,"5i":207,"6i":196,"7i":185,"8i":174,"9i":163,PW:150,"48°":143,"50°":137,"52°":131,"54°":124,"56°":117,"58°":110,"60°":103 },
};

function benchmarkBag(target: Exclude<BagCompareTarget, "friend">, labels: string[]): ComparisonBagProfile {
  const carry = BENCHMARK_CARRY[target];
  const clubs = labels.map((label) => ({ label, ...(carry[label] !== undefined ? { carry: carry[label] } : {}) }));
  return { mappedCount: clubs.filter((club) => club.carry !== undefined).length, clubCount: clubs.length, clubs };
}

export function BagComparison({
  left,
  friendBag,
  leftName,
  friendName,
  leftAvatar,
  friendAvatar,
  initialTarget = "friend",
}: {
  left?: ComparisonBagProfile;
  friendBag?: ComparisonBagProfile;
  leftName: string;
  friendName: string;
  leftAvatar?: string | null;
  friendAvatar?: string | null;
  initialTarget?: BagCompareTarget;
}) {
  const [bagView, setBagView] = useState<"carry" | "witb">("carry");
  const [target, setTarget] = useState<BagCompareTarget>(initialTarget);

  if (!left) {
    return <Empty text="Skapa din golfbag först för att kunna jämföra." />;
  }

  const leftLabels = [...left.clubs].map((club) => club.label);
  const targetConfig = BAG_TARGETS.find((item) => item.id === target) ?? BAG_TARGETS[0];
  const benchmark = target === "friend" ? friendBag : benchmarkBag(target, leftLabels);
  const rightName = target === "friend" ? friendName : targetConfig.label;
  const rightAvatar = target === "friend" ? friendAvatar : null;
  const canShowWitb = target === "friend";

  const normalize = (label: string) => label.trim().toLowerCase();
  const rightByLabel = new Map((benchmark?.clubs ?? []).map((club) => [normalize(club.label), club]));
  const knownLeft = new Set(left.clubs.map((club) => normalize(club.label)));
  const rows = [
    ...left.clubs.map((club) => ({ label: club.label, left: club, right: rightByLabel.get(normalize(club.label)) })),
    ...(target === "friend" ? benchmark?.clubs ?? [] : [])
      .filter((club) => !knownLeft.has(normalize(club.label)))
      .map((club) => ({ label: club.label, left: undefined, right: club })),
  ].reverse();

  const modelText = (club: ComparisonBagProfile["clubs"][number] | undefined) =>
    club ? [club.brand, club.model].filter(Boolean).join(" ") : "";
  const specText = (club: ComparisonBagProfile["clubs"][number] | undefined) =>
    club
      ? [
          club.loft ? `Loft ${club.loft}` : null,
          club.shaft,
          club.flex ? `Flex ${club.flex}` : null,
          club.length ? `Längd ${club.length}` : null,
          club.lie ? `Lie ${club.lie}` : null,
          club.grip,
        ].filter(Boolean).join(" · ")
      : "";

  return <div className="space-y-5">
    <section className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[2rem] px-4 py-5 ${glassCard}`}>
      <div className="flex min-w-0 flex-col items-center text-center">
        <Avatar name={leftName} url={leftAvatar} side="left" />
        <p className="mt-2 max-w-[8rem] truncate text-sm font-bold">{leftName}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">{left.mappedCount} mappade</p>
      </div>
      <span className="rounded-xl bg-foreground px-3 py-2 font-display text-2xl text-background shadow-sm">VS</span>
      <div className="flex min-w-0 flex-col items-center text-center">
        <Avatar name={rightName} url={rightAvatar} side="right" />
        <p className="mt-2 max-w-[8rem] truncate text-sm font-bold">{rightName}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
          {target === "friend" ? (benchmark ? `${benchmark.mappedCount} mappade` : "Ingen bag ännu") : "Illustrativ referens"}
        </p>
      </div>
    </section>

    <section>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Jämför mot</p>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {BAG_TARGETS.map((item) => {
          const active = item.id === target;
          return <button
            key={item.id}
            type="button"
            onClick={() => { setTarget(item.id); if (item.id !== "friend") setBagView("carry"); }}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground"}`}
          >
            {item.shortLabel}
          </button>;
        })}
      </div>
    </section>

    {canShowWitb ? (
      <div className={`grid grid-cols-2 gap-1 rounded-2xl p-1 ${glassCard}`}>
        <button type="button" onClick={() => setBagView("carry")} className={`min-h-11 rounded-xl text-sm font-bold transition ${bagView === "carry" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"}`}>Carry</button>
        <button type="button" onClick={() => setBagView("witb")} className={`min-h-11 rounded-xl text-sm font-bold transition ${bagView === "witb" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"}`}>WITB</button>
      </div>
    ) : null}

    <section className={`overflow-hidden rounded-[1.8rem] ${glassCard}`}>
      <div className="grid grid-cols-[78px_1fr_1fr] items-end border-b border-white/60 px-4 py-3 dark:border-white/10">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.12em] text-muted-foreground">Klubb</p>
        </div>
        <div className="text-center">
          <p className="truncate text-sm font-black text-blue-600 dark:text-blue-400">{leftName}</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-muted-foreground">{bagView === "carry" ? "Carry" : "WITB"}</p>
        </div>
        <div className="text-center">
          <p className="truncate text-sm font-black text-red-600 dark:text-red-400">{rightName}</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-muted-foreground">{bagView === "carry" ? "Carry" : "WITB"}</p>
        </div>
      </div>

      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className={`grid min-h-[62px] grid-cols-[78px_1fr_1fr] items-center gap-2 px-4 py-3 ${index ? "border-t border-white/60 dark:border-white/10" : ""}`}>
          <div className="text-left text-sm font-black">{row.label}</div>
          {bagView === "carry" ? (
            <>
              <div className="text-center">
                <p className="text-xl font-black tabular-nums text-blue-600 dark:text-blue-400">{row.left?.carry === undefined ? "–" : `${Math.round(row.left.carry)} m`}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black tabular-nums text-red-600 dark:text-red-400">{row.right?.carry === undefined ? "–" : `${Math.round(row.right.carry)} m`}</p>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 text-center">
                <p className="truncate text-[11px] font-bold text-blue-600 dark:text-blue-400">{modelText(row.left) || (row.left ? "Ej angivet" : "–")}</p>
                {specText(row.left) ? <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{specText(row.left)}</p> : null}
              </div>
              <div className="min-w-0 text-center">
                <p className="truncate text-[11px] font-bold text-red-600 dark:text-red-400">{modelText(row.right) || (row.right ? "Ej angivet" : "–")}</p>
                {specText(row.right) ? <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{specText(row.right)}</p> : null}
              </div>
            </>
          )}
        </div>
      ))}
    </section>

    {target === "friend" && !friendBag ? (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">Importera en delad bagfil nedan för att jämföra carry och utrustning.</p>
    ) : target !== "friend" ? (
      <p className="text-center text-[10px] leading-relaxed text-muted-foreground">Illustrativa referensvärden från SG4, inte verifierade populationssnitt. Slaglängd avgör inte handicap.</p>
    ) : null}
  </div>;
}

function Empty({ text = "Ingen gemensam jämförbar data ännu för det valda området." }: { text?: string }){return <div className="rounded-3xl border border-dashed border-white/70 bg-muted/45 p-6 text-center text-sm text-muted-foreground shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">{text}</div>}

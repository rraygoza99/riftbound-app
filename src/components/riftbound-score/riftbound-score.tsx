import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Popover,
  Snackbar,
  TextField,
  Typography,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import CasinoIcon from "@mui/icons-material/Casino";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GradeIcon from "@mui/icons-material/Grade";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/Shield";
import { useTheme } from "@mui/material/styles";
import { App as CapApp } from "@capacitor/app";
import "./riftbound-score.css";

const STORAGE_KEY = "riftbound-setup";
const CONFIG_KEY = "riftbound-config";

const LEGENDS = [
  { id: "OGN-247", name: "Kai'Sa" },
  { id: "OGN-249", name: "Volibear" },
  { id: "OGN-251", name: "Jinx" },
  { id: "OGN-253", name: "Darius" },
  { id: "OGN-255", name: "Ahri" },
  { id: "OGN-257", name: "Lee Sin" },
  { id: "OGN-259", name: "Yasuo" },
  { id: "OGN-261", name: "Leona" },
  { id: "OGN-263", name: "Teemo" },
  { id: "OGN-265", name: "Viktor" },
  { id: "OGN-267", name: "Miss Fortune" },
  { id: "OGN-269", name: "Sett" },
  { id: "OGS-017", name: "Annie" },
  { id: "OGS-019", name: "Master Yi" },
  { id: "OGS-021", name: "Lux" },
  { id: "OGS-023", name: "Garen" },
  { id: "SFD-181", name: "Rumble" },
  { id: "SFD-183", name: "Lucian" },
  { id: "SFD-185", name: "Draven" },
  { id: "SFD-187", name: "Rek'Sai" },
  { id: "SFD-189", name: "Ornn" },
  { id: "SFD-193", name: "Jax" },
  { id: "SFD-195", name: "Irelia" },
  { id: "SFD-197", name: "Azir" },
  { id: "SFD-199", name: "Ezreal" },
  { id: "SFD-201", name: "Renata Glasc" },
  { id: "SFD-203", name: "Sivir" },
  { id: "SFD-205", name: "Fiora" },
  { id: "UNL-181", name: "Jhin" },
  { id: "UNL-183", name: "Rengar" },
  { id: "UNL-185", name: "Pyke" },
  { id: "UNL-187", name: "Vi" },
  { id: "UNL-189", name: "Lillia" },
  { id: "UNL-191", name: "Master Yi" },
  { id: "UNL-193", name: "Vex" },
  { id: "UNL-195", name: "Ivern" },
  { id: "UNL-197", name: "Diana" },
  { id: "UNL-199", name: "LeBlanc" },
  { id: "UNL-201", name: "Kha'Zix" },
  { id: "UNL-203", name: "Poppy" },
];

function getLegendUrl(id: string): string {
  return `/legends/${id}.webp`;
}

type GameMode = "2p" | "3p" | "4p";
type AppView = "home" | "setup" | "game" | "solo" | "config";
type UtilitiesMode = "gesture" | "button";
type LogAction = "Conquer" | "Hold" | "Ability" | "+1" | "-1";
type PointType = "Conquer" | "Hold" | "Ability";

interface LogEntry {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  action: LogAction;
  score: number;
  gameTime: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  xp: number;
  color: string;
  legendId: string | null;
  history: PointType[];
}

interface SetupState {
  mode: GameMode;
  players: Player[];
  maxPoints: number;
  useXp: boolean;
}

const MODE_ORDER: GameMode[] = ["2p", "3p", "4p"];

const MODE_LABELS: Record<GameMode, string> = {
  "2p": "2 Players",
  "3p": "3 Players",
  "4p": "4 Players",
};

const PRESET_COLORS = [
  "#e63946",
  "#2979ff",
  "#00bcd4",
  "#ffd600",
  "#ff9800",
  "#4caf50",
  "#9c27b0",
  "#f1faee",
];

const DEFAULT_COLORS = ["#e63946", "#2979ff", "#4caf50", "#ffd600"];

const DEFAULT_NAMES: Record<GameMode, string[]> = {
  "2p": ["Player 1", "Player 2"],
  "3p": ["Player 1", "Player 2", "Player 3"],
  "4p": ["Player 1", "Player 2", "Player 3", "Player 4"],
};

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makePlayers(mode: GameMode, existing: Player[] = []): Player[] {
  return DEFAULT_NAMES[mode].map((defaultName, i) => ({
    id: existing[i]?.id ?? genId(),
    name: existing[i]?.name ?? defaultName,
    score: 0,
    xp: 0,
    color: existing[i]?.color ?? DEFAULT_COLORS[i] ?? "#ffffff",
    legendId: existing[i]?.legendId ?? null,
    history: [],
  }));
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function tryVibrate(ms = 25) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

function loadSetup(): SetupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SetupState>;
      if (parsed.mode && parsed.players) {
        const mode: GameMode = (["2p", "3p", "4p"] as GameMode[]).includes(parsed.mode as GameMode) ? (parsed.mode as GameMode) : "2p";
        return {
          mode,
          players: (parsed.players as Player[]).map((p) => ({ ...p, score: 0, xp: 0, legendId: p.legendId ?? null, history: [] })),
          maxPoints: parsed.maxPoints ?? 8,
          useXp: parsed.useXp ?? false,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { mode: "2p", players: makePlayers("2p"), maxPoints: 8, useXp: false };
}

// Player Panel

interface PlayerPanelProps {
  player: Player;
  flipped: boolean;
  highlighted?: boolean;
  maxPoints: number;
  useXp: boolean;
  hideActions?: boolean;
  onChangeScore: (id: string, delta: number) => void;
  onChangeXp: (id: string, delta: number) => void;
  onLogAction: (id: string, action: LogAction) => void;
}

const POINT_COLORS: Record<PointType, string> = {
  Conquer: "#ff6d3a",
  Hold: "#2f7bff",
  Ability: "#a44bff",
};

const POINT_ICONS: Record<PointType, typeof BoltIcon> = {
  Conquer: BoltIcon,
  Hold: ShieldIcon,
  Ability: AutoAwesomeIcon,
};

const PlayerPanel = React.memo(function PlayerPanel({ player, flipped, highlighted = false, maxPoints, useXp, onChangeXp, onLogAction, hideActions = false }: PlayerPanelProps) {
  const atMax = player.score >= maxPoints;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      className={`rb-player-panel${flipped ? " rb-player-panel--flipped" : ""}${highlighted ? " rb-player-panel--highlighted" : ""}`}
      style={{ background: `linear-gradient(160deg, ${isDark ? "#09091a" : "#f4f4f8"} 0%, ${player.color}1a 100%)`, '--rb-hl-color': player.color } as React.CSSProperties}
    >
      {player.legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url(${getLegendUrl(player.legendId)})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: isDark ? 1 : 0.92,
        }} />
      )}
      {player.legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: isDark
            ? "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.62) 100%)"
            : "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 45%, rgba(0,0,0,0.42) 100%)",
        }} />
      )}

      {hideActions ? (
        <Box className="rb-vert-layout">
          <IconButton
            className="rb-score-btn"
            onClick={() => { tryVibrate(); onLogAction(player.id, flipped ? "+1" : "-1"); }}
            disableRipple
          >
            {flipped ? <AddIcon className="rb-score-icon" /> : <RemoveIcon className="rb-score-icon" />}
          </IconButton>
          <Box className="rb-vert-middle">
            <Typography
              className="rb-score-number"
              style={{ color: atMax ? player.color : (isDark ? "#ffffff" : "#111111") }}
            >
              {player.score}
            </Typography>
            <Box className="rb-player-badge rb-player-badge--vert" style={{ borderColor: `${player.color}55` }}>
              <Typography className="rb-player-badge-text">{player.name}</Typography>
            </Box>
          </Box>
          <IconButton
            className="rb-score-btn"
            onClick={() => { tryVibrate(); onLogAction(player.id, flipped ? "-1" : "+1"); }}
            disableRipple
          >
            {flipped ? <RemoveIcon className="rb-score-icon" /> : <AddIcon className="rb-score-icon" />}
          </IconButton>
        </Box>
      ) : (
        <>
          <Box className="rb-player-badge" style={{ borderColor: `${player.color}55` }}>
            <Typography className="rb-player-badge-text">{player.name}</Typography>
          </Box>

          {useXp && (
            <Box className="rb-xp-bar">
              <Typography className="rb-xp-label">XP</Typography>
              <IconButton size="small" className="rb-xp-btn" onClick={() => onChangeXp(player.id, -1)}>
                <RemoveIcon sx={{ fontSize: 22 }} />
              </IconButton>
              <Typography className="rb-xp-value">{player.xp}</Typography>
              <IconButton size="small" className="rb-xp-btn" onClick={() => onChangeXp(player.id, 1)}>
                <AddIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1, width: "100%" }}>
            <Box className="rb-score-row">
              <Typography className="rb-score-number" style={{ color: atMax ? player.color : (isDark ? "#ffffff" : "#111111") }}>
                {player.score}
              </Typography>
            </Box>
            <Box className="rb-action-row">
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-conquer-btn" disableRipple onClick={() => onLogAction(player.id, "Conquer")}>
                  <BoltIcon />
                </IconButton>
                <Typography className="rb-action-label">Conquer</Typography>
              </Box>
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-hold-btn" disableRipple onClick={() => onLogAction(player.id, "Hold")}>
                  <ShieldIcon />
                </IconButton>
                <Typography className="rb-action-label">Hold</Typography>
              </Box>
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-ability-btn" disableRipple onClick={() => onLogAction(player.id, "Ability")}>
                  <AutoAwesomeIcon />
                </IconButton>
                <Typography className="rb-action-label">Ability</Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rb-point-bar" aria-label="score points">
            {Array.from({ length: maxPoints }).map((_, i) => {
              const type = player.history[i];
              const filled = i < player.history.length;
              const isLast = filled && i === player.history.length - 1;
              return (
                <Box
                  key={i}
                  className={`rb-point-seg${filled ? " rb-point-seg--filled" : ""}${isLast ? " rb-point-seg--last" : ""}`}
                  style={filled ? { background: POINT_COLORS[type!], boxShadow: `0 0 10px ${POINT_COLORS[type!]}66` } : undefined}
                  onClick={isLast ? () => { tryVibrate(); onLogAction(player.id, "-1"); } : undefined}
                >
                  {filled && React.createElement(POINT_ICONS[type!], { className: "rb-point-seg-icon" })}
                </Box>
              );
            })}
          </Box>
        </>
      )}

    </Box>
  );
});

// Might Calculator

const BRUSH_TAGS = ["bird", "cat", "dog", "poro", "ivern"] as const;
type BrushTag = typeof BRUSH_TAGS[number];

// Auto-tag keywords (English + Spanish), accent- and case-insensitive.
const TAG_KEYWORDS: { kw: string; tag: BrushTag }[] = [
  { kw: "cat", tag: "cat" }, { kw: "gato", tag: "cat" },
  { kw: "dog", tag: "dog" }, { kw: "perro", tag: "dog" },
  { kw: "bird", tag: "bird" }, { kw: "pajaro", tag: "bird" },
  { kw: "poro", tag: "poro" },
  { kw: "ivern", tag: "ivern" },
];

function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectTags(name: string): BrushTag[] {
  const n = normalizeText(name);
  const found = new Set<BrushTag>();
  for (const { kw, tag } of TAG_KEYWORDS) {
    if (n.includes(kw)) found.add(tag);
  }
  return Array.from(found);
}

interface MightCard {
  id: string;
  name: string;
  might: number;
  tags: BrushTag[];
}

interface CardGroup { name: string; might: number; tags: BrushTag[]; count: number; }

const QUICK_CARDS: { name: string; might: number; tags: BrushTag[] }[] = [
  { name: "Recruit", might: 1, tags: [] },
  { name: "Bird", might: 1, tags: ["bird"] },
  { name: "Sand Soldier", might: 2, tags: [] },
  { name: "Mech", might: 3, tags: [] },
  { name: "Sprite", might: 3, tags: [] },
];

const MIGHT_STORAGE_KEY = "riftbound-might-calc";

interface PlayerMight { cards: MightCard[]; trifarian: boolean; brush: boolean; }
type MightState = { p1: PlayerMight; p2: PlayerMight };

function emptyPlayerMight(): PlayerMight {
  return { cards: [], trifarian: false, brush: false };
}

function loadMightState(): MightState {
  try {
    const raw = localStorage.getItem(MIGHT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MightState>;
      if (parsed && parsed.p1 && parsed.p2) {
        return {
          p1: { cards: parsed.p1.cards ?? [], trifarian: !!parsed.p1.trifarian, brush: !!parsed.p1.brush },
          p2: { cards: parsed.p2.cards ?? [], trifarian: !!parsed.p2.trifarian, brush: !!parsed.p2.brush },
        };
      }
    }
  } catch { /* ignore */ }
  return { p1: emptyPlayerMight(), p2: emptyPlayerMight() };
}

function mightTotal(p: PlayerMight): number {
  return p.cards.reduce((sum, c) => sum + c.might + (p.trifarian ? 1 : 0) + (p.brush && c.tags.some((t) => BRUSH_TAGS.includes(t)) ? 1 : 0), 0);
}

function MightCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [state, setState] = useState<MightState>(loadMightState);
  const [active, setActive] = useState<"p1" | "p2">("p1");
  const [newName, setNewName] = useState("");
  const [newMight, setNewMight] = useState<number | "">(1);
  const [newTags, setNewTags] = useState<BrushTag[]>([]);

  // Persist across panel/screen changes and app restarts.
  // Debounced so rapid edits don't trigger a synchronous localStorage write
  // each tap; skips the initial (just-loaded) value and flushes on unmount.
  const stateRef = useRef(state);
  stateRef.current = state;
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(MIGHT_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [state]);
  useEffect(() => () => {
    try { localStorage.setItem(MIGHT_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
  }, []);

  const cur = state[active];
  const cards = cur.cards;
  const trifarian = cur.trifarian;
  const brush = cur.brush;

  function setCards(updater: (prev: MightCard[]) => MightCard[]) {
    setState((s) => ({ ...s, [active]: { ...s[active], cards: updater(s[active].cards) } }));
  }
  function setTrifarian(v: boolean) {
    setState((s) => ({ ...s, [active]: { ...s[active], trifarian: v } }));
  }
  function setBrush(v: boolean) {
    setState((s) => ({ ...s, [active]: { ...s[active], brush: v } }));
  }

  function effectiveMight(card: { might: number; tags: BrushTag[] }) {
    return card.might + (trifarian ? 1 : 0) + (brush && card.tags.some((t) => BRUSH_TAGS.includes(t)) ? 1 : 0);
  }

  function toggleNewTag(tag: BrushTag) {
    setNewTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCard() {
    const might = typeof newMight === "number" ? newMight : 1;
    if (might < 1) return;
    const tags = Array.from(new Set<BrushTag>([...newTags, ...detectTags(newName)]));
    setCards((prev) => [...prev, { id: genId(), name: newName.trim() || `Card ${prev.length + 1}`, might, tags }]);
    setNewName("");
    setNewMight(1);
    setNewTags([]);
  }

  function quickAdd(name: string, might: number, tags: BrushTag[]) {
    setCards((prev) => [...prev, { id: genId(), name, might, tags }]);
  }

  function duplicateGroup(name: string, might: number, tags: BrushTag[]) {
    setCards((prev) => [...prev, { id: genId(), name, might, tags }]);
  }

  function removeOneFromGroup(name: string, might: number, tags: BrushTag[]) {
    const tagKey = [...tags].sort().join(",");
    setCards((prev) => {
      const idx = [...prev].reverse().findIndex((c) => c.name === name && c.might === might && [...c.tags].sort().join(",") === tagKey);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev.filter((_, i) => i !== realIdx);
    });
  }

  // Group by name+might+tags
  const groups: CardGroup[] = [];
  for (const card of cards) {
    const tagKey = [...card.tags].sort().join(",");
    const existing = groups.find((g) => g.name === card.name && g.might === card.might && [...g.tags].sort().join(",") === tagKey);
    if (existing) existing.count++;
    else groups.push({ name: card.name, might: card.might, tags: card.tags, count: 1 });
  }

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const tagChipStyle = (active: boolean) => ({
    borderRadius: "50px",
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: "0.7rem",
    px: 1,
    py: 0.25,
    minWidth: 0,
    lineHeight: 1.4,
    border: `1px solid ${active ? "rgba(76,175,80,0.6)" : border}`,
    background: active ? "rgba(76,175,80,0.18)" : surface,
    color: active ? "#4caf50" : textMuted,
    "&:hover": { background: active ? "rgba(76,175,80,0.28)" : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)") },
  });

  const p1Total = mightTotal(state.p1);
  const p2Total = mightTotal(state.p2);
  const detectedTags = detectTags(newName);

  const totalBar = (key: "p1" | "p2", label: string, value: number, flipped: boolean) => {
    const sel = active === key;
    return (
      <Box
        onClick={() => setActive(key)}
        sx={{
          flexShrink: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transform: flipped ? "rotate(180deg)" : "none",
          background: sel ? "rgba(41,121,255,0.16)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
          border: `1.5px solid ${sel ? "rgba(41,121,255,0.55)" : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)")}`,
          borderRadius: 2, px: 2, py: 0.9,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: textPrimary, fontSize: "0.92rem", lineHeight: 1.2 }}>{label}</Typography>
          <Typography sx={{ fontSize: "0.64rem", color: sel ? "#2979ff" : textMuted }}>{sel ? "Editing units" : "Tap to edit"}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#2979ff", lineHeight: 1 }}>{value}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "hidden" }}>
      {/* Player 2 total (top, flipped for across-table) */}
      {totalBar("p2", "Player 2", p2Total, true)}

      {/* Editor for the active player */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
      {/* Add card row */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Card name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              background: surface, borderRadius: 2, color: textPrimary,
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
            },
            "& input::placeholder": { color: textMuted },
          }}
        />
        <TextField
          size="small"
          type="number"
          placeholder="Might"
          value={newMight}
          onChange={(e) => setNewMight(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          slotProps={{ htmlInput: { min: 0, style: { textAlign: "center" } } }}
          sx={{
            width: 72,
            "& .MuiOutlinedInput-root": {
              background: surface, borderRadius: 2, color: textPrimary,
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
            },
          }}
        />
        <IconButton onClick={addCard} sx={{ background: "#2979ff", color: "#fff", borderRadius: 2, "&:hover": { background: "#1565c0" } }} size="small">
          <AddIcon />
        </IconButton>
      </Box>

      {/* Tag toggles for manual add */}
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
        {BRUSH_TAGS.map((tag) => (
          <Button key={tag} size="small" onClick={() => toggleNewTag(tag)} sx={tagChipStyle(newTags.includes(tag) || detectedTags.includes(tag))}>
            {tag}
          </Button>
        ))}
        {newTags.length > 0 && (
          <Typography sx={{ fontSize: "0.7rem", color: textMuted, alignSelf: "center", ml: 0.5 }}>
            (tags for new card)
          </Typography>
        )}
      </Box>

      {/* Quick-add chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", flexShrink: 0 }}>
        {QUICK_CARDS.map((qc) => (
          <Button
            key={qc.name}
            size="small"
            onClick={() => quickAdd(qc.name, qc.might, qc.tags)}
            sx={{
              borderRadius: "50px", textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
              px: 1.5, py: 0.4, background: surface, border: `1px solid ${border}`,
              color: textPrimary, minWidth: 0, lineHeight: 1.4,
              "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" },
            }}
          >
            {qc.name}&nbsp;<Typography component="span" sx={{ fontSize: "0.68rem", color: "#ffd600", fontWeight: 700 }}>+{qc.might}</Typography>
            {qc.tags.length > 0 && <Typography component="span" sx={{ fontSize: "0.62rem", color: "#4caf50", ml: 0.5 }}>·{qc.tags[0]}</Typography>}
          </Button>
        ))}
      </Box>

      {/* Battlefield checkboxes */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
        <FormControlLabel
          control={<Checkbox checked={trifarian} onChange={(e) => setTrifarian(e.target.checked)} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", "&.Mui-checked": { color: "#ffd600" }, p: 0.5 }} />}
          label={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: textPrimary }}>Trifarian War Camp <Typography component="span" sx={{ fontSize: "0.68rem", color: textMuted }}>(+1 all)</Typography></Typography>}
          sx={{ mx: 0 }}
        />
        <FormControlLabel
          control={<Checkbox checked={brush} onChange={(e) => setBrush(e.target.checked)} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", "&.Mui-checked": { color: "#4caf50" }, p: 0.5 }} />}
          label={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: textPrimary }}>Brush <Typography component="span" sx={{ fontSize: "0.68rem", color: textMuted }}>(+1 bird/cat/dog/poro/ivern)</Typography></Typography>}
          sx={{ mx: 0 }}
        />
      </Box>

      {/* Card list */}
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", pr: 0.5 }}>
        {groups.length === 0 && (
          <Typography sx={{ color: textMuted, fontSize: "0.85rem", textAlign: "center", mt: 3 }}>
            No cards added yet
          </Typography>
        )}
        {groups.map((group) => {
          const eff = effectiveMight(group);
          const hasBrushBonus = brush && group.tags.some((t) => BRUSH_TAGS.includes(t));
          const groupKey = `${group.name}__${group.might}__${[...group.tags].sort().join(",")}`;
          return (
            <Box key={groupKey} sx={{ display: "flex", alignItems: "center", gap: 1, background: surface, border: `1px solid ${border}`, borderRadius: 2, px: 1.5, py: 0.8 }}>
              {/* Count badge */}
              <Box sx={{ minWidth: 26, height: 26, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: textPrimary, lineHeight: 1 }}>{group.count}</Typography>
              </Box>

              {/* Name + tags */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: textPrimary, fontSize: "0.92rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {group.name}
                </Typography>
                {group.tags.length > 0 && (
                  <Box sx={{ display: "flex", gap: "3px", flexWrap: "wrap", mt: 0.2 }}>
                    {group.tags.map((tag) => (
                      <Typography key={tag} component="span" sx={{ fontSize: "0.6rem", fontWeight: 700, color: hasBrushBonus ? "#4caf50" : textMuted, background: hasBrushBonus ? "rgba(76,175,80,0.12)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"), borderRadius: "4px", px: 0.6, py: 0.1, textTransform: "capitalize" }}>
                        {tag}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Might per unit × count */}
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#ffd600", flexShrink: 0 }}>
                {eff}
                {group.count > 1 && (
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: "0.72rem", color: textMuted }}>×{group.count}={eff * group.count}</Typography>
                )}
              </Typography>

              <IconButton size="small" onClick={() => duplicateGroup(group.name, group.might, group.tags)} sx={{ color: textMuted, p: 0.5 }} title="Add one more">
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={() => removeOneFromGroup(group.name, group.might, group.tags)} sx={{ color: textMuted, p: 0.5 }} title="Remove one">
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
      </Box>

      {/* Player 1 total (bottom) */}
      {totalBar("p1", "Player 1", p1Total, false)}
    </Box>
  );
}

// Ornn Might Calculator

// Blue (Mind) / Green (Calm) gears — each counts as +1 friendly gear for Ornn's passive.
// Svellsongur is handled separately because it copies Ornn's text.
const ORNN_GEARS = [
  "Brutalizer",
  "Chemtech Cask",
  "Cloth Armor",
  "Doran's Shield",
  "Energy Conduit",
  "Experimental Hexplate",
  "Forgefire Cape",
  "Forgotten Signpost",
  "Frigid Jewel",
  "Garbage Grabber",
  "Guardian Angel",
  "Gutter Palace",
  "Heart of Dark Ice",
  "Hextech Anomaly",
  "Honeyfruit",
  "Mask of Foresight",
  "Mushroom Pouch",
  "Orb of Regret",
  "Poro Snax",
  "Rabadon's Deathcrown",
  "Seal of Focus",
  "Seal of Insight",
  "Shurelya's Requiem",
  "Solari Shrine",
  "Soul Sword",
  "Spirit's Refuge",
  "Sprite Fountain",
  "Sterak's Gage",
  "Sumpworks Map",
  "Temporal Portal",
  "The Zero Drive",
  "World Atlas",
  "Zhonya's Hourglass",
];

const ORNN_STORAGE_KEY = "riftbound-ornn-calc";

interface OrnnState { gearCounts: Record<string, number>; svellsongur: number; goldTokens: number; }

function loadOrnnState(): OrnnState {
  try {
    const raw = localStorage.getItem(ORNN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OrnnState>;
      return {
        gearCounts: (parsed.gearCounts && typeof parsed.gearCounts === "object") ? parsed.gearCounts : {},
        svellsongur: Math.max(0, Math.min(3, Number(parsed.svellsongur) || 0)),
        goldTokens: Math.max(0, Number(parsed.goldTokens) || 0),
      };
    }
  } catch { /* ignore */ }
  return { gearCounts: {}, svellsongur: 0, goldTokens: 0 };
}

function OrnnCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const initial = useRef(loadOrnnState()).current;
  const [gearCounts, setGearCounts] = useState<Record<string, number>>(initial.gearCounts);
  const [svellsongur, setSvellsongur] = useState(initial.svellsongur);
  const [goldTokens, setGoldTokens] = useState(initial.goldTokens);

  // Persist across panel/screen changes and app restarts. Debounced so rapid
  // edits don't trigger a synchronous localStorage write each tap; skips the
  // initial (just-loaded) value and flushes on unmount.
  const stateRef = useRef<OrnnState>(initial);
  stateRef.current = { gearCounts, svellsongur, goldTokens };
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(ORNN_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [gearCounts, svellsongur, goldTokens]);
  useEffect(() => () => {
    try { localStorage.setItem(ORNN_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
  }, []);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const selectedGears = Object.values(gearCounts).reduce((a, b) => a + b, 0);
  // Friendly gears = listed gears + each Svellsongur + each gold token
  const totalGears = selectedGears + svellsongur + goldTokens;
  // Ornn's own passive grants +totalGears. Each Svellsongur copies that text → ×(1 + svellsongur).
  const mightBonus = totalGears * (1 + svellsongur);

  function addGear(name: string) {
    setGearCounts((p) => ({ ...p, [name]: (p[name] || 0) + 1 }));
  }
  function removeGear(name: string) {
    setGearCounts((p) => {
      const next = { ...p };
      const n = (next[name] || 0) - 1;
      if (n <= 0) delete next[name];
      else next[name] = n;
      return next;
    });
  }
  function resetAll() {
    setGearCounts({});
    setSvellsongur(0);
    setGoldTokens(0);
  }

  const stepper = (
    value: number,
    onDec: () => void,
    onInc: () => void,
    accent: string,
    decDisabled: boolean,
    incDisabled: boolean,
  ) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
      <IconButton size="small" onClick={onDec} disabled={decDisabled} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 1.5, p: 0.4, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
        <RemoveIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: accent, minWidth: 22, textAlign: "center" }}>{value}</Typography>
      <IconButton size="small" onClick={onInc} disabled={incDisabled} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 1.5, p: 0.4, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, height: "100%", overflow: "hidden" }}>
      {/* Special counters: Svellsongur + Gold tokens */}
      <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.08)", border: `1px solid rgba(41,121,255,0.30)`, borderRadius: 2, px: 1.5, py: 0.8 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: textPrimary }}>Svellsongur attached</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>Copies Ornn's text · max 3</Typography>
          </Box>
          {stepper(svellsongur, () => setSvellsongur((v) => Math.max(0, v - 1)), () => setSvellsongur((v) => Math.min(3, v + 1)), "#2979ff", svellsongur <= 0, svellsongur >= 3)}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: isDark ? "rgba(255,214,0,0.08)" : "rgba(255,193,7,0.10)", border: `1px solid rgba(255,193,7,0.35)`, borderRadius: 2, px: 1.5, py: 0.8 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: textPrimary }}>Gold tokens</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>Each counts as a friendly gear</Typography>
          </Box>
          {stepper(goldTokens, () => setGoldTokens((v) => Math.max(0, v - 1)), () => setGoldTokens((v) => v + 1), "#ffb300", goldTokens <= 0, false)}
        </Box>
      </Box>

      {/* Gear list */}
      <Typography sx={{ flexShrink: 0, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: textMuted, mt: 0.3 }}>
        Gears · tap to add
      </Typography>
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px", pr: 0.5 }}>
        {ORNN_GEARS.map((name) => {
          const count = gearCounts[name] || 0;
          const active = count > 0;
          return (
            <Box
              key={name}
              onClick={() => addGear(name)}
              sx={{
                display: "flex", alignItems: "center", gap: 1, cursor: "pointer",
                background: active ? (isDark ? "rgba(76,175,80,0.14)" : "rgba(76,175,80,0.12)") : surface,
                border: `1px solid ${active ? "rgba(76,175,80,0.45)" : border}`,
                borderRadius: 2, px: 1.5, py: 0.7,
                transition: "background 0.12s",
              }}
            >
              <Box sx={{ minWidth: 26, height: 26, borderRadius: "50%", background: active ? "rgba(76,175,80,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: active ? "#4caf50" : textMuted, lineHeight: 1 }}>{count}</Typography>
              </Box>
              <Typography sx={{ flex: 1, minWidth: 0, color: textPrimary, fontSize: "0.9rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </Typography>
              {active && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeGear(name); }} sx={{ color: textMuted, p: 0.4 }} title="Remove one">
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Result */}
      <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 0.5, background: isDark ? "rgba(41,121,255,0.15)" : "rgba(41,121,255,0.10)", border: `1px solid rgba(41,121,255,0.35)`, borderRadius: 2, px: 2, py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.95rem" }}>Ornn Might bonus</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>
              {totalGears} gear{totalGears === 1 ? "" : "s"} × (1 + {svellsongur} Svellsongur)
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color: "#2979ff", lineHeight: 1 }}>+{mightBonus}</Typography>
        </Box>
        {(selectedGears > 0 || svellsongur > 0 || goldTokens > 0) && (
          <Button size="small" onClick={resetAll} sx={{ alignSelf: "flex-start", textTransform: "none", fontSize: "0.72rem", color: textMuted, p: 0, minWidth: 0, "&:hover": { background: "transparent", color: textPrimary } }}>
            Reset
          </Button>
        )}
      </Box>
    </Box>
  );
}

// Runes Teller — "How many runes I have?"

const RUNES_STORAGE_KEY = "riftbound-runes-turn";

function loadRunesTurn(): number {
  try {
    const raw = localStorage.getItem(RUNES_STORAGE_KEY);
    if (raw) return Math.max(1, Number(raw) || 1);
  } catch { /* ignore */ }
  return 1;
}

// First player: 2 runes on turn 1, +2 each following turn → 2 × turn.
// Second player: 3 runes on turn 1, +2 each following turn → 2 × turn + 1.
function runesForPlayer(turn: number, isFirst: boolean): number {
  if (turn < 1) return 0;
  return isFirst ? 2 * turn : 2 * turn + 1;
}

function RunesCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [turn, setTurn] = useState<number>(loadRunesTurn);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const turnRef = useRef(turn);
  turnRef.current = turn;
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(RUNES_STORAGE_KEY, String(turnRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [turn]);
  useEffect(() => () => {
    try { localStorage.setItem(RUNES_STORAGE_KEY, String(turnRef.current)); } catch { /* ignore */ }
  }, []);

  const firstRunes = runesForPlayer(turn, true);
  const secondRunes = runesForPlayer(turn, false);

  const playerCard = (label: string, runes: number, accent: string) => (
    <Box sx={{
      flex: 1,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5,
      background: surface, border: `1px solid ${border}`, borderRadius: 3, py: 3, px: 1.5,
    }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: textMuted, textAlign: "center" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: "3rem", lineHeight: 1, color: accent }}>{runes}</Typography>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>runes</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%", overflow: "hidden", justifyContent: "center" }}>
      {/* Player tellers */}
      <Box sx={{ display: "flex", gap: 1.2, flexShrink: 0 }}>
        {playerCard("First player", firstRunes, "#2979ff")}
        {playerCard("Second player", secondRunes, "#ff5c8a")}
      </Box>

      {/* Turn counter with steppers */}
      <Box sx={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5,
        background: isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.08)",
        border: `1px solid rgba(41,121,255,0.30)`, borderRadius: 3, py: 2, px: 2,
      }}>
        <IconButton onClick={() => setTurn((t) => Math.max(1, t - 1))} disabled={turn <= 1} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 2, p: 1, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
          <RemoveIcon />
        </IconButton>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: textMuted }}>Turn</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", lineHeight: 1, color: textPrimary }}>{turn}</Typography>
        </Box>
        <IconButton onClick={() => setTurn((t) => t + 1)} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 2, p: 1 }}>
          <AddIcon />
        </IconButton>
      </Box>

      <Typography sx={{ flexShrink: 0, textAlign: "center", fontSize: "0.7rem", color: textMuted, px: 2 }}>
        Turn 1: first player draws 2, second draws 3. Every turn after, each draws 2.
      </Typography>
    </Box>
  );
}

// How To Guide

const GUIDE_TIPS = [
  {
    animClass: "rb-guide-h",
    label: "Utilities & Might Calculator",
    desc: "Swipe left or right anywhere on the game screen",
  },
  {
    animClass: "rb-guide-u",
    label: "Close Utilities",
    desc: "Swipe up inside the Utilities panel",
  },
  {
    animClass: "rb-guide-tap",
    label: "Return to Setup",
    desc: 'Tap "Setup" in the middle bar',
  },
];

function HowToGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Box
      onClick={onDismiss}
      sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.88)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2, px: 3,
      }}
    >
      <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", letterSpacing: 0.2, mb: 0.5 }}>
        Gestures &amp; Controls
      </Typography>

      {GUIDE_TIPS.map((tip) => (
        <Box
          key={tip.label}
          sx={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px", px: 2.5, py: 2,
            width: "100%", maxWidth: 360,
            display: "flex", alignItems: "center", gap: 2,
          }}
        >
          <Box sx={{ width: 44, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <TouchAppIcon className={`rb-guide-icon ${tip.animClass}`} sx={{ fontSize: 36, color: "#fff" }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3 }}>
              {tip.label}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", mt: 0.3 }}>
              {tip.desc}
            </Typography>
          </Box>
        </Box>
      ))}

      <Button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        sx={{
          mt: 1, borderRadius: "50px", px: 5, py: 1.3,
          background: "#2979ff", color: "#fff",
          fontWeight: 700, fontSize: "0.95rem",
          textTransform: "none",
          boxShadow: "0 4px 20px rgba(41,121,255,0.4)",
          "&:hover": { background: "#1565c0" },
        }}
      >
        Got it!
      </Button>
      <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", mt: -1 }}>
        Tap anywhere to close
      </Typography>
    </Box>
  );
}

// Utilities Panel

interface UtilitiesPanelProps {
  open: boolean;
  onClose: () => void;
}

function UtilitiesPanel({ open, onClose }: UtilitiesPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const touchStart = useRef<{ x: number; y: number; inScroll: boolean } | null>(null);
  const [tab, setTab] = useState<"battlefield" | "ornn" | "runes">("battlefield");

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    // Detect if the gesture started inside a vertically scrollable list so we
    // don't treat a scroll-up as a swipe-to-close.
    let el: HTMLElement | null = e.target as HTMLElement;
    let inScroll = false;
    while (el && el !== e.currentTarget) {
      if (el.scrollHeight > el.clientHeight) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          inScroll = true;
          break;
        }
      }
      el = el.parentElement;
    }
    touchStart.current = { x: t.clientX, y: t.clientY, inScroll };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const inScroll = touchStart.current.inScroll;
    touchStart.current = null;
    // Horizontal swipe → cycle calculators (wraps around)
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const order = ["battlefield", "ornn", "runes"] as const;
      setTab((prev) => {
        const i = order.indexOf(prev);
        const next = dx < 0 ? (i + 1) % order.length : (i - 1 + order.length) % order.length;
        return order[next];
      });
      return;
    }
    // Swipe up to close (ignored when scrolling a list)
    if (!inScroll && dy < -70 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      onClose();
    }
  }

  return (
    <Box
      className={`rb-utilities-panel${open ? " rb-utilities-panel--open" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        background: isDark ? "#0a0a1a" : "#f4f4f8",
        color: isDark ? "#fff" : "#111",
      }}
    >
      {/* Header */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        py: 1.8,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)"}`,
        flexShrink: 0,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ fontSize: 18, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: 0.2 }}>Utilities</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "10px", p: 0.8 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Section: Might Calculator */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", px: 2, pt: 2, pb: 1 }}>
        {/* Calculator title + swipe indicator */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: isDark ? "#fff" : "#111", letterSpacing: 0.2 }}>
            {tab === "battlefield" ? "Battlefield Might" : tab === "ornn" ? "Ornn Calculator" : "How many runes I have?"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
            {(["battlefield", "ornn", "runes"] as const).map((k) => {
              const active = tab === k;
              return (
                <Box
                  key={k}
                  onClick={() => setTab(k)}
                  sx={{
                    width: active ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: active ? "linear-gradient(135deg, #2979ff 0%, #5c35d4 100%)" : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)"),
                  }}
                />
              );
            })}
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {open && (tab === "battlefield" ? <MightCalculator /> : tab === "ornn" ? <OrnnCalculator /> : <RunesCalculator />)}
        </Box>
      </Box>

      {/* Swipe-up hint */}
      <Box sx={{ flexShrink: 0, display: "flex", justifyContent: "center", pb: 2, pt: 1 }}>
        <Box sx={{
          width: 36,
          height: 4,
          borderRadius: 4,
          background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
        }} />
      </Box>
    </Box>
  );
}

// Game View

interface GameViewProps {
  players: Player[];
  mode: GameMode;
  maxPoints: number;
  useXp: boolean;
  timer: number;
  timerRunning: boolean;
  tossOpen: boolean;
  tossMsg: string;
  log: LogEntry[];
  logOpen: boolean;
  onChangeScore: (id: string, delta: number) => void;
  onChangeXp: (id: string, delta: number) => void;
  onLogAction: (id: string, action: LogAction) => void;
  onToggleTimer: () => void;
  onReset: () => void;
  onToss: () => void;
  onCloseToss: () => void;
  onBack: () => void;
  onCloseLog: () => void;
  starterHighlightId: string | null;
  starterSpinning: boolean;
  onStarterSpin: () => void;
  utilitiesMode: UtilitiesMode;
}

function GameView({ players, mode, maxPoints, useXp, timer, timerRunning, tossOpen, tossMsg, log, logOpen, onChangeScore, onChangeXp, onLogAction, onToggleTimer, onReset, onCloseToss, onBack, onCloseLog, starterHighlightId, starterSpinning, onStarterSpin, utilitiesMode }: GameViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(() => !localStorage.getItem("rb-guide-seen"));
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  function dismissGuide() {
    localStorage.setItem("rb-guide-seen", "1");
    setGuideOpen(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!swipeStart.current || utilitiesOpen) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStart.current.x;
    const dy = t.clientY - swipeStart.current.y;
    swipeStart.current = null;
    // Horizontal swipe → open utilities (only in gesture mode)
    if (utilitiesMode === "gesture" && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setUtilitiesOpen(true);
    }
  }

  const panel = (p: Player, flipped: boolean) => (
    <PlayerPanel key={p.id} player={p} flipped={flipped} highlighted={starterHighlightId === p.id} maxPoints={maxPoints} useXp={useXp} hideActions={mode !== "2p"} onChangeScore={onChangeScore} onChangeXp={onChangeXp} onLogAction={onLogAction} />
  );

  const middleBar = (
    <Box className="rb-middle-bar">
      <Button
        size="small"
        onClick={onBack}
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
        sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)", fontSize: "0.7rem", textTransform: "none", fontWeight: 700, minWidth: 0, px: 1 }}
      >
        Menu
      </Button>
      <Button
        className="rb-timer-pill"
        onClick={onToggleTimer}
        startIcon={timerRunning ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
      >
        {formatTime(timer)}
      </Button>
      <Box sx={{ flex: 1 }} />
      {utilitiesMode === "button" && (
        <IconButton className="rb-bar-icon-btn" onClick={() => setUtilitiesOpen(true)} size="small" title="Open Utilities">
          <TuneIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
      )}
      <IconButton className="rb-bar-icon-btn" onClick={onStarterSpin} size="small" title="Pick starting player" disabled={starterSpinning}>
        <CasinoIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
      <IconButton className="rb-bar-icon-btn" onClick={() => setGuideOpen(true)} size="small" title="How to play">
        <HelpOutlineIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
      <IconButton className="rb-bar-icon-btn" onClick={onReset} size="small" title="Restart scores & log">
        <RefreshIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
    </Box>
  );

  return (
    <Box className="rb-game-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} sx={{
      '--rb-bg': isDark ? '#08080f' : '#f4f4f8',
      '--rb-text': isDark ? '#ffffff' : '#111111',
      '--rb-text-muted': isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
      '--rb-icon-color': isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)',
      '--rb-badge-bg': isDark ? 'rgba(10,10,30,0.85)' : 'rgba(255,255,255,0.92)',
      '--rb-badge-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
      '--rb-score-btn-bg': isDark ? 'rgba(18,18,45,0.92)' : 'rgba(240,240,250,0.95)',
      '--rb-score-btn-border': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
      '--rb-score-btn-color': isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
      '--rb-bar-bg': isDark ? '#0c0c1e' : '#ebebf5',
      '--rb-bar-border': isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
      '--rb-pill-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      '--rb-pill-color': isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
      '--rb-panel-divider': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      '--rb-xp-bg': isDark ? 'rgba(4,4,18,0.94)' : 'rgba(255,255,255,0.96)',
      '--rb-xp-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
    } as React.CSSProperties}>
      {mode === "2p" && <>{panel(players[1], true)}{middleBar}{panel(players[0], false)}</>}
      {mode === "3p" && (
        <>
          <Box className="rb-panel-row">{panel(players[1], true)}{panel(players[2], true)}</Box>
          {middleBar}
          {panel(players[0], false)}
        </>
      )}
      {mode === "4p" && (
        <>
          <Box className="rb-panel-row">{panel(players[2], true)}{panel(players[3], true)}</Box>
          {middleBar}
          <Box className="rb-panel-row">{panel(players[0], false)}{panel(players[1], false)}</Box>
        </>
      )}
      <Snackbar
        open={tossOpen}
        autoHideDuration={3000}
        onClose={onCloseToss}
        message={tossMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ "& .MuiSnackbarContent-root": { fontSize: "1.1rem", fontWeight: 700 } }}
      />

      <Dialog
        open={logOpen}
        onClose={onCloseLog}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: {
          sx: {
            background: isDark ? "#0f0f22" : "#f4f4f8",
            borderRadius: 3,
            m: 2,
            maxHeight: "75vh",
          },
        } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Game Log
          <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontWeight: 400 }}>
            {log.length} {log.length === 1 ? "action" : "actions"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, px: 2, pb: 2 }}>
          {log.length === 0 ? (
            <Typography sx={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontSize: "0.88rem", textAlign: "center", py: 3 }}>
              No actions logged yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[...log].reverse().map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.9,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: entry.playerColor, flexShrink: 0 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: isDark ? "#fff" : "#111", flex: 1 }}>
                    {entry.playerName}
                  </Typography>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: entry.action === "Conquer" ? "#ff6d3a" : entry.action === "Hold" ? "#2f7bff" : entry.action === "Ability" ? "#a44bff" : entry.action === "+1" ? "#4caf50" : entry.action === "-1" ? "#ef5350" : "#2979ff",
                    minWidth: 60,
                    textAlign: "right",
                  }}>
                    {entry.action}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", minWidth: 44, textAlign: "right" }}>
                    {entry.score}pts
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.3)", minWidth: 36, textAlign: "right" }}>
                    {formatTime(entry.gameTime)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <UtilitiesPanel open={utilitiesOpen} onClose={() => setUtilitiesOpen(false)} />
      {guideOpen && <HowToGuide onDismiss={dismissGuide} />}
    </Box>
  );
}

// Config Screen

interface ConfigScreenProps {
  utilitiesMode: UtilitiesMode;
  onChangeUtilitiesMode: (m: UtilitiesMode) => void;
  onBack: () => void;
}

function ConfigScreen({ utilitiesMode, onChangeUtilitiesMode, onBack }: ConfigScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const surface = isDark ? "#0f0f22" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)";

  return (
    <Box sx={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      background: isDark ? "#08080f" : "#f4f4f8",
      color: isDark ? "#fff" : "#111",
      pt: "env(safe-area-inset-top)",
      pb: "env(safe-area-inset-bottom)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${border}` }}>
        <IconButton size="small" onClick={onBack} sx={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: -0.2 }}>Configuration</Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Section label */}
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)" }}>
          Game Screen
        </Typography>

        {/* Utilities option */}
        <Box sx={{ background: surface, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
          <Typography sx={{ px: 2, pt: 1.5, pb: 1, fontSize: "1rem", fontWeight: 700 }}>
            Open Utilities
          </Typography>
          <Typography sx={{ px: 2, pb: 1.5, fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
            Choose how the Utilities &amp; Might Calculator panel is opened during gameplay.
          </Typography>

          {/* Option: Gesture */}
          <Box
            onClick={() => onChangeUtilitiesMode("gesture")}
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              px: 2, py: 1.5,
              borderTop: `1px solid ${border}`,
              cursor: "pointer",
              background: utilitiesMode === "gesture" ? (isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.06)") : "transparent",
              transition: "background 0.15s",
            }}
          >
            <Box sx={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${utilitiesMode === "gesture" ? "#2979ff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")}`,
              background: utilitiesMode === "gesture" ? "#2979ff" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {utilitiesMode === "gesture" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Gesture</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
                Swipe left or right anywhere on the screen
              </Typography>
            </Box>
          </Box>

          {/* Option: Button */}
          <Box
            onClick={() => onChangeUtilitiesMode("button")}
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              px: 2, py: 1.5,
              borderTop: `1px solid ${border}`,
              cursor: "pointer",
              background: utilitiesMode === "button" ? (isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.06)") : "transparent",
              transition: "background 0.15s",
            }}
          >
            <Box sx={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${utilitiesMode === "button" ? "#2979ff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")}`,
              background: utilitiesMode === "button" ? "#2979ff" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {utilitiesMode === "button" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Button</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
                A button in the control bar opens the panel
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Home Screen

function HomeScreen({ onMultiplayer, onSolo, onConfig }: { onMultiplayer: () => void; onSolo: () => void; onConfig: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: isDark ? "#08080f" : "#f4f4f8",
      gap: 3, px: 3,
      pt: "env(safe-area-inset-top)",
      pb: "env(safe-area-inset-bottom)",
    }}>
      {/* Logo / title */}
      <Box sx={{ textAlign: "center", mb: 3, position: "relative" }}>
        {/* Glow blob behind title */}
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(41,121,255,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <AutoAwesomeIcon sx={{ fontSize: 32, color: "#ffd600", mb: 1, filter: "drop-shadow(0 0 8px rgba(255,214,0,0.6))" }} />
        <Typography sx={{
          fontSize: "clamp(2.2rem, 9vw, 3.2rem)", fontWeight: 900,
          color: isDark ? "#fff" : "#111", letterSpacing: -1.5, lineHeight: 1,
          textShadow: isDark ? "0 2px 30px rgba(41,121,255,0.3)" : "none",
        }}>
          Riftbound
        </Typography>
        <Typography sx={{
          fontSize: "clamp(0.7rem, 2.8vw, 0.85rem)", fontWeight: 700,
          color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
          letterSpacing: 4, textTransform: "uppercase", mt: 0.75,
        }}>
          Score Tracker
        </Typography>
      </Box>

      {/* Multiplayer */}
      <Button
        fullWidth
        onClick={onMultiplayer}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: "linear-gradient(135deg, #2979ff 0%, #5c35d4 100%)",
          color: "#fff", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          boxShadow: "0 8px 32px rgba(41,121,255,0.5)",
          transition: "box-shadow 0.2s, transform 0.1s",
          "&:hover": { boxShadow: "0 10px 36px rgba(41,121,255,0.6)", transform: "translateY(-1px)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>Multiplayer</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.75, lineHeight: 1 }}>
          2 – 4 players
        </Typography>
      </Button>

      {/* Solo */}
      <Button
        fullWidth
        onClick={onSolo}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
          color: isDark ? "#fff" : "#111", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          transition: "background 0.15s, transform 0.1s",
          "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>Solo</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.5, lineHeight: 1 }}>
          Single player
        </Typography>
      </Button>

      {/* Config */}
      <Button
        onClick={onConfig}
        startIcon={<SettingsIcon sx={{ fontSize: 17 }} />}
        sx={{
          mt: 1.5, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)",
          fontSize: "0.82rem", fontWeight: 600, textTransform: "none", letterSpacing: 0.2,
          "&:hover": { color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" },
        }}
      >
        Configuration
      </Button>
    </Box>
  );
}

// Solo View

function SoloView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [legendId, setLegendId] = useState<string | null>(null);
  const [legendPickerOpen, setLegendPickerOpen] = useState(false);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Pause timer when app goes to background
  useEffect(() => {
    function onVisChange() { if (document.hidden) setTimerRunning(false); }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  function reset() {
    setScore(0);
    setTimer(0);
    setTimerRunning(false);
  }

  const cssVars = {
    '--rb-bg': isDark ? '#08080f' : '#f4f4f8',
    '--rb-text': isDark ? '#ffffff' : '#111111',
    '--rb-badge-bg': isDark ? 'rgba(10,10,30,0.85)' : 'rgba(255,255,255,0.92)',
    '--rb-badge-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
    '--rb-score-btn-bg': isDark ? 'rgba(18,18,45,0.92)' : 'rgba(240,240,250,0.95)',
    '--rb-score-btn-border': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
    '--rb-score-btn-color': isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
    '--rb-bar-bg': isDark ? '#0c0c1e' : '#ebebf5',
    '--rb-bar-border': isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
    '--rb-pill-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    '--rb-pill-color': isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
  } as React.CSSProperties;

  return (
    <Box sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "var(--rb-bg)", overflow: "hidden",
      pt: "env(safe-area-inset-top)", pb: "env(safe-area-inset-bottom)", ...cssVars }}>
      {/* Legend background */}
      {legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url(${getLegendUrl(legendId)})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          opacity: isDark ? 0.18 : 0.14,
        }} />
      )}

      {/* Score area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, position: "relative", zIndex: 1 }}>
        <IconButton
          className="rb-score-btn"
          onClick={() => { tryVibrate(); setScore((s) => Math.max(0, s - 1)); }}
          disableRipple
          sx={{ width: 80, height: 80 }}
        >
          <RemoveIcon sx={{ fontSize: "2.2rem" }} />
        </IconButton>

        <Typography sx={{
          fontSize: "clamp(5rem, 22vw, 10rem)", fontWeight: 900, lineHeight: 1,
          color: isDark ? "#fff" : "#111", textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          userSelect: "none",
        }}>
          {score}
        </Typography>

        <IconButton
          className="rb-score-btn"
          onClick={() => { tryVibrate(); setScore((s) => s + 1); }}
          disableRipple
          sx={{ width: 80, height: 80 }}
        >
          <AddIcon sx={{ fontSize: "2.2rem" }} />
        </IconButton>
      </Box>

      {/* Bottom bar */}
      <Box className="rb-middle-bar">
        <Button
          size="small"
          onClick={onBack}
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
          sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)", fontSize: "0.7rem", textTransform: "none", fontWeight: 700, minWidth: 0, px: 1 }}
        >
          Home
        </Button>
        <Button
          className="rb-timer-pill"
          onClick={() => setTimerRunning((r) => !r)}
          startIcon={timerRunning ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
        >
          {formatTime(timer)}
        </Button>
        <Box sx={{ flex: 1 }} />
        <IconButton
          className="rb-bar-icon-btn"
          size="small"
          title="Pick legend"
          onClick={() => setLegendPickerOpen(true)}
        >
          <EditIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
        <IconButton className="rb-bar-icon-btn" onClick={reset} size="small" title="Reset">
          <RefreshIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
      </Box>

      {/* Legend picker */}
      <Dialog
        open={legendPickerOpen}
        onClose={() => setLegendPickerOpen(false)}
        fullWidth maxWidth="xs"
        slotProps={{ paper: { sx: { background: isDark ? "#0f0f22" : "#f4f4f8", borderRadius: 3, m: 2, maxHeight: "70vh" } } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1 }}>Choose Legend</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {legendId && (
              <Button size="small" onClick={() => { setLegendId(null); setLegendPickerOpen(false); }}
                sx={{ borderRadius: 2, textTransform: "none", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "0.78rem" }}>
                None
              </Button>
            )}
            {LEGENDS.map((l) => (
              <Box
                key={l.id}
                onClick={() => { setLegendId(l.id); setLegendPickerOpen(false); }}
                sx={{
                  width: 56, height: 72, borderRadius: 2, overflow: "hidden", cursor: "pointer",
                  border: legendId === l.id ? "2px solid #2979ff" : "2px solid transparent",
                  backgroundImage: `url(${getLegendUrl(l.id)})`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                  "&:hover": { opacity: 0.85 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// Main component

export default function RiftboundScore() {
  const initial = loadSetup();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [view, setView] = useState<AppView>("home");
  const [mode, setMode] = useState<GameMode>(initial.mode);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [maxPoints, setMaxPoints] = useState<number>(initial.maxPoints);
  const [useXp, setUseXp] = useState<boolean>(initial.useXp);
  const [utilitiesMode, setUtilitiesMode] = useState<UtilitiesMode>(() => {
    try { return (JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "{}").utilitiesMode as UtilitiesMode) || "gesture"; }
    catch { return "gesture"; }
  });

  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [tossOpen, setTossOpen] = useState(false);
  const [tossMsg, setTossMsg] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);

  const [starterHighlightId, setStarterHighlightId] = useState<string | null>(null);
  const [starterSpinning, setStarterSpinning] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [colorPlayerId, setColorPlayerId] = useState<string | null>(null);
  const [legendPickerOpen, setLegendPickerOpen] = useState(false);
  const [legendPickerPlayerId, setLegendPickerPlayerId] = useState<string | null>(null);
  const [legendSearch, setLegendSearch] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable refs so useCallback handlers never go stale
  const playersRef = useRef(players);
  playersRef.current = players;
  const timerValueRef = useRef(timer);
  timerValueRef.current = timer;
  const maxPointsRef = useRef(maxPoints);
  maxPointsRef.current = maxPoints;

  // Only save to localStorage during setup — not on every score change during gameplay
  useEffect(() => {
    if (view === "game") return;
    const state: SetupState = { mode, players, maxPoints, useXp };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [mode, players, maxPoints, useXp, view]);

  // Pause timer when app is backgrounded (saves battery)
  useEffect(() => {
    function onVisChange() {
      if (document.hidden) setTimerRunning(false);
    }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  // Hardware back button — navigate instead of exiting
  const viewRef = useRef(view);
  viewRef.current = view;
  useEffect(() => {
    const listenerPromise = CapApp.addListener("backButton", () => {
      const current = viewRef.current;
      if (current === "home") {
        CapApp.exitApp();
      } else if (current === "game") {
        setView("setup");
        setLog([]);
        setTimerRunning(false);
      } else {
        setView("home");
      }
    });
    return () => { listenerPromise.then((h) => h.remove()); };
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  function handleSwitchMode(m: GameMode) {
    setMode(m);
    setPlayers((prev) => makePlayers(m, prev));
  }

  const handleChangeScore = useCallback((id: string, delta: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p));
  }, []);

  const handleChangeXp = useCallback((id: string, delta: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, xp: Math.max(0, p.xp + delta) } : p));
  }, []);

  const handleLogAction = useCallback((playerId: string, action: LogAction) => {
    tryVibrate();
    const player = playersRef.current.find((p) => p.id === playerId)!;
    let newScore = player.score;
    let newHistory = player.history;
    if (action === "Conquer" || action === "Hold" || action === "Ability") {
      if (player.score < maxPointsRef.current) {
        newHistory = [...player.history, action];
        newScore = newHistory.length;
      }
    } else if (action === "+1") {
      newScore = Math.min(player.score + 1, maxPointsRef.current);
    } else if (action === "-1") {
      newScore = Math.max(player.score - 1, 0);
      newHistory = player.history.slice(0, Math.max(0, player.history.length - 1));
    }
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, score: newScore, history: newHistory } : p)));
    setLog((l) => [
      ...l,
      {
        id: genId(),
        playerId,
        playerName: player.name,
        playerColor: player.color,
        action,
        score: newScore,
        gameTime: timerValueRef.current,
      },
    ]);
  }, []);

  function handleLaunch() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, xp: 0, history: [] })));
    setTimer(0);
    setTimerRunning(false);
    setView("game");
  }

  function handleResetPlayers() {
    setPlayers(makePlayers(mode));
  }

  function handleResetGame() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, xp: 0, history: [] })));
    setTimer(0);
    setTimerRunning(false);
    setLog([]);
  }

  function handleToss() {
    setTossMsg(Math.random() < 0.5 ? "Heads!" : "Tails!");
    setTossOpen(true);
  }

  function handleStarterSpin() {
    if (starterSpinning) return;
    setStarterSpinning(true);
    setStarterHighlightId(null);

    const snapshot = players;
    const playerIds = snapshot.map((p) => p.id);
    const finalIdx = Math.floor(Math.random() * playerIds.length);
    const totalCycles = 22;
    let cycle = 0;

    function step() {
      cycle++;
      if (cycle < totalCycles) {
        const idx = (cycle - 1) % playerIds.length;
        setStarterHighlightId(playerIds[idx]);
        const progress = cycle / totalCycles;
        const delay = 70 + Math.pow(progress, 2.2) * 480;
        setTimeout(step, delay);
      } else {
        setStarterHighlightId(playerIds[finalIdx]);
        setStarterSpinning(false);
        setTossMsg(`${snapshot[finalIdx].name} goes first!`);
        setTossOpen(true);
        tryVibrate(80);
        setTimeout(() => setStarterHighlightId(null), 3000);
      }
    }

    setTimeout(step, 70);
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditName(player.name);
  }

  function commitEdit(id: string) {
    if (editName.trim()) {
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: editName.trim() } : p)));
    }
    setEditingId(null);
  }

  function openColorPicker(e: React.MouseEvent<HTMLElement>, playerId: string) {
    setColorAnchorEl(e.currentTarget);
    setColorPlayerId(playerId);
  }

  function pickColor(color: string) {
    if (colorPlayerId) {
      setPlayers((prev) => prev.map((p) => (p.id === colorPlayerId ? { ...p, color } : p)));
    }
    setColorAnchorEl(null);
    setColorPlayerId(null);
  }

  function openLegendPicker(playerId: string) {
    setLegendPickerPlayerId(playerId);
    setLegendPickerOpen(true);
  }

  function pickLegend(legendId: string | null) {
    if (legendPickerPlayerId) {
      setPlayers((prev) => prev.map((p) => (p.id === legendPickerPlayerId ? { ...p, legendId } : p)));
    }
    setLegendPickerOpen(false);
    setLegendPickerPlayerId(null);
    setLegendSearch("");
  }

  if (view === "home") {
    return <HomeScreen onMultiplayer={() => setView("setup")} onSolo={() => setView("solo")} onConfig={() => setView("config")} />;
  }

  if (view === "config") {
    return (
      <ConfigScreen
        utilitiesMode={utilitiesMode}
        onChangeUtilitiesMode={(m) => {
          setUtilitiesMode(m);
          localStorage.setItem(CONFIG_KEY, JSON.stringify({ utilitiesMode: m }));
        }}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "solo") {
    return <SoloView onBack={() => setView("home")} />;
  }

  if (view === "game") {
    return (
      <GameView
        players={players}
        mode={mode}
        maxPoints={maxPoints}
        useXp={useXp}
        timer={timer}
        timerRunning={timerRunning}
        tossOpen={tossOpen}
        tossMsg={tossMsg}
        log={log}
        logOpen={logOpen}
        onChangeScore={handleChangeScore}
        onChangeXp={handleChangeXp}
        onLogAction={handleLogAction}
        onToggleTimer={() => setTimerRunning((r) => !r)}
        onReset={handleResetGame}
        onToss={handleToss}
        onCloseToss={() => setTossOpen(false)}
        onBack={() => { setView("setup"); setLog([]); setTimerRunning(false); }}
        onCloseLog={() => setLogOpen(false)}
        starterHighlightId={starterHighlightId}
        starterSpinning={starterSpinning}
        onStarterSpin={handleStarterSpin}
        utilitiesMode={utilitiesMode}
      />
    );
  }

  return (
    <Box className="rb-setup" sx={{
      '--rb-bg': isDark ? '#070710' : '#f0f0f6',
      '--rb-surface': isDark ? '#0e0e20' : '#ffffff',
      '--rb-surface2': isDark ? '#141428' : '#e4e4ef',
      '--rb-surface3': isDark ? '#1a1a32' : '#d4d4e4',
      '--rb-text': isDark ? '#ffffff' : '#111111',
      '--rb-text-muted': isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
      '--rb-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
      '--rb-border-subtle': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
      '--rb-icon-color': isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
      '--rb-swatch-border': isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.15)',
      '--rb-swatch-hover': isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      '--rb-mode-active-bg': isDark ? '#2a2a4a' : '#d0d0e0',
      '--rb-reset-color': isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)',
    } as React.CSSProperties}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 2, py: 1.5, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
        <IconButton size="small" onClick={() => setView("home")} sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography className="rb-setup-title" variant="h6">Create a Game</Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>

      <Box className="rb-mode-tabs">
        {MODE_ORDER.map((m) => (
          <Button key={m} className={`rb-mode-btn${mode === m ? " rb-mode-btn--active" : ""}`} onClick={() => handleSwitchMode(m)}>
            {MODE_LABELS[m]}
          </Button>
        ))}
      </Box>

      <Typography className="rb-section-label">Configure Players</Typography>
      <Box className="rb-players-list">
        {players.map((player) => (
          <Box key={player.id} className="rb-player-row">
            <Box
              className="rb-player-avatar"
              style={{ background: player.legendId ? "transparent" : player.color, cursor: "pointer", overflow: "hidden", position: "relative" }}
              onClick={() => openLegendPicker(player.id)}
            >
              {player.legendId ? (
                <img
                  src={getLegendUrl(player.legendId)}
                  alt="legend"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", borderRadius: 8 }}
                />
              ) : (
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, px: 0.5 }}>
                    Pick Legend
                  </Typography>
                </Box>
              )}
            </Box>
            <Box className="rb-player-name-area">
              {editingId === player.id ? (
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => commitEdit(player.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(player.id); }}
                  size="small"
                  variant="standard"
                  autoFocus
                  sx={{
                    "& .MuiInput-input": { color: isDark ? "#fff" : "#111", fontSize: "1.05rem", fontWeight: 700 },
                    "& .MuiInput-underline:before": { borderBottomColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)", borderBottomStyle: "dashed" },
                  }}
                />
              ) : (
                <Box className="rb-name-click-row" onClick={() => startEdit(player)}>
                  <Typography className="rb-player-name-text">{player.name}</Typography>
                  <EditIcon className="rb-edit-icon" />
                </Box>
              )}
            </Box>
            <Box className="rb-color-swatch" style={{ background: player.color }} onClick={(e) => openColorPicker(e, player.id)}>
              <KeyboardArrowDownIcon className="rb-swatch-chevron" />
            </Box>
          </Box>
        ))}
      </Box>

      <Typography className="rb-section-label">Game Options</Typography>
      <Box className="rb-options-card">
        <Box className="rb-option-row">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <GradeIcon sx={{ fontSize: 18, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }} />
            <Typography className="rb-option-label">Max Points</Typography>
          </Box>
          <Box className="rb-stepper">
            <IconButton size="small" className="rb-stepper-btn" onClick={() => setMaxPoints((p) => Math.max(1, p - 1))}>
              <RemoveIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography className="rb-stepper-value">{maxPoints}</Typography>
            <IconButton size="small" className="rb-stepper-btn" onClick={() => setMaxPoints((p) => p + 1)}>
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
        <Box className="rb-option-row rb-option-row--last">
          <Typography className="rb-option-label">Use XP Tracker</Typography>
          <Switch checked={useXp} onChange={(e) => setUseXp(e.target.checked)} size="small" color="primary" />
        </Box>
      </Box>

      <Box className="rb-bottom-actions">
        <Button variant="contained" className="rb-launch-btn" onClick={handleLaunch}>Launch Game</Button>
        <Button className="rb-reset-btn" onClick={handleResetPlayers}>↺ Reset Players</Button>
      </Box>

      </Box>

      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { background: isDark ? "#14142a" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`, borderRadius: 2 } } }}
      >
        <Box sx={{ p: 1.5, display: "grid", gridTemplateColumns: "repeat(4, 32px)", gap: "8px" }}>
          {PRESET_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => pickColor(c)}
              sx={{
                width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer",
                border: `2px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
                "&:hover": { border: `2px solid ${isDark ? "#fff" : "#333"}` },
                transition: "border 0.15s",
              }}
            />
          ))}
        </Box>
      </Popover>

      <Dialog
        open={legendPickerOpen}
        onClose={() => { setLegendPickerOpen(false); setLegendSearch(""); }}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: {
          sx: {
            background: isDark ? "#0f0f22" : "#f4f4f8",
            borderRadius: 3,
            m: 2,
            maxHeight: "80vh",
          },
        } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Choose Legend
          <Button size="small" onClick={() => { pickLegend(null); setLegendSearch(""); }} sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.75rem", textTransform: "none", minWidth: 0 }}>
            No legend
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            placeholder="Search legends…"
            value={legendSearch}
            onChange={(e) => setLegendSearch(e.target.value)}
            size="small"
            fullWidth
            autoComplete="off"
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)" },
              },
              "& .MuiOutlinedInput-input": { color: isDark ? "#fff" : "#111", fontSize: "0.9rem" },
              "& .MuiOutlinedInput-input::placeholder": { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", opacity: 1 },
            }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", pb: 1 }}>
            {LEGENDS.filter((l) => l.name.toLowerCase().includes(legendSearch.toLowerCase())).map((legend) => (
              <Box
                key={legend.id}
                onClick={() => pickLegend(legend.id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  "&:hover": { borderColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" },
                  transition: "border-color 0.15s",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={getLegendUrl(legend.id)}
                  alt={legend.name}
                  loading="lazy"
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", display: "block" }}
                />
                
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
